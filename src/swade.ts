/* eslint-disable no-unused-vars */
/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: FloRad
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system
 */

// Import TypeScript modules
import { SwadeCharacterSheet } from './module/character-sheet';
import { formatRoll } from './module/chat';
import { SWADE } from './module/config';
import { SwadeActor } from './module/entity';
import { registerCustomHelpers } from './module/handlebarsHelpers';
import { rollInitiative, setupTurns } from './module/init/swadeInit';
import { SwadeItem } from './module/item-entity';
import { SwadeItemSheet } from './module/item-sheet';
import { listenJournalDrop } from './module/journalDrop';
import { SwadeNPCSheet } from './module/npc-sheet';
import { preloadHandlebarsTemplates } from './module/preloadTemplates';
import { registerSettings } from './module/settings';
import { SwadeSetup } from './module/setup/setupHandler';
import { createActionCardTable } from './module/util';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	//CONFIG.debug.hooks = true;
	console.log(
		`SWADE | Initializing Savage Worlds Adventure Edition\n${SWADE.ASCII}`
	);

	// Record Configuration Values
	CONFIG.SWADE = SWADE;
	Combat.prototype.rollInitiative = rollInitiative;
	Combat.prototype.setupTurns = setupTurns;

	//Register custom Handlebars helpers
	registerCustomHelpers();
	CONFIG.Actor.entityClass = SwadeActor;
	CONFIG.Item.entityClass = SwadeItem;

	// Register custom system settings
	registerSettings();

	// Register custom sheets (if any)
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('swade', SwadeCharacterSheet, {
		types: ['character'],
		makeDefault: true,
	});
	Actors.registerSheet('swade', SwadeNPCSheet, {
		types: ['npc'],
		makeDefault: true,
	});
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('swade', SwadeItemSheet, { makeDefault: true });

	// Drop a journal image to a tile (for cards)
	listenJournalDrop();

	// Preload Handlebars templates
	await preloadHandlebarsTemplates();
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
	// Do anything after initialization but before ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', async () => {

	let packChoices = {}
	game.packs.filter(p => p.entity === 'JournalEntry').forEach(p => {
		packChoices[p.collection] = p.metadata.label;
	});

	game.settings.register('swade', 'cardDeck', {
		name: 'Card Deck to use for Initiative',
		scope: 'world',
		type: String,
		config: true,
		default: CONFIG.SWADE.init.defaultCardCompendium,
		choices: packChoices,
		onChange: (choice) => {
			console.log(`Repopulating action cards Table with cards from deck ${choice}`);
			createActionCardTable(true, choice).then(ui.notifications.info('Table re-population complete'));
		}
	});

	await SwadeSetup.setup();


});

// Add any additional hooks if necessary
Hooks.on('preCreateItem', function (createData: any, options: any, userId: string) {
	//Set default image if no image already exists
	if (!createData.img) {
		createData.img = `systems/swade/assets/icons/${createData.type}.svg`;
	}
});

// Mark all Wildcards in the Actors sidebars with an icon
Hooks.on('renderActorDirectory', (app, html: JQuery<HTMLElement>, options: any) => {
	const found = html.find('.entity-name');

	let wildcards: Actor[] = app.entities.filter((a: Actor) => a.data.type === 'character');

	//if the player is not a GM, then don't mark the NPC wildcards
	if (!game.settings.get('swade', 'hideNPCWildcards') || options.user.isGM) {
		wildcards = wildcards.concat(app.entities.filter(a => a.data.type === 'npc' && a.data.data.wildcard));
	}

	wildcards.forEach((wc: Actor) => {
		for (let i = 0; i < found.length; i++) {
			const element = found[i];
			if (element.innerText === wc.data.name) {
				element.innerHTML = `
					<a><img src="systems/swade/assets/ui/wildcard.svg" class="wildcard-icon">${wc.data.name}</a>
					`;
			}
		}
	});
});

Hooks.on('renderCompendium', async (app, html: JQuery<HTMLElement>, data) => {
	if (app.metadata.entity !== 'Actor') {
		return;
	}
	const content = await app.getContent();
	const wildcards = content.filter(
		(entity: Actor) => entity.data['wildcard']
	);
	const names: string[] = wildcards.map((e) => e.data.name);

	const found = html.find('.entry-name');
	found.each((i, el) => {
		const name = names.find((name) => name === el.innerText);
		if (!name) {
			return;
		}
		el.innerHTML = `<a><img src="systems/swade/assets/ui/wildcard-dark.svg" class="wildcard-icon">${name}</a>`;
	});
});

Hooks.on('updateActor', async (actor: Actor, updateData: any, options: any, userId: string) => {
	if (actor.data.type === 'npc') {
		ui.actors.render();
	}

	//if it's a status update, update the token
	if (updateData.data && updateData.data.status && (game.user.isGM || actor.owner)) {

		const shaken = CONFIG.SWADE.statusIcons.shaken;
		const vulnerable = CONFIG.SWADE.statusIcons.vulnerable;
		const distracted = CONFIG.SWADE.statusIcons.distracted;
		const actorData = actor.data as any;

		for (const t of actor.getActiveTokens()) {
			if (t.data.actorLink && t.scene.id === game.scenes.active.id) {
				if (actorData.data.status.isShaken && !t.data.effects.includes(shaken)) await t.toggleEffect(shaken);
				if (!actorData.data.status.isShaken && t.data.effects.includes(shaken)) await t.toggleEffect(shaken);
				if (actorData.data.status.isVulnerable && !t.data.effects.includes(vulnerable)) await t.toggleEffect(vulnerable);
				if (!actorData.data.status.isVulnerable && t.data.effects.includes(vulnerable)) await t.toggleEffect(vulnerable);
				if (actorData.data.status.isDistracted && !t.data.effects.includes(distracted)) await t.toggleEffect(distracted);
				if (!actorData.data.status.isDistracted && t.data.effects.includes(distracted)) await t.toggleEffect(distracted);
			}
		}
	}
});

Hooks.on('preUpdateToken', async (scene: Scene, token: any, updateData: any, options: any) => {
	const shaken = CONFIG.SWADE.statusIcons.shaken;
	const vulnerable = CONFIG.SWADE.statusIcons.vulnerable;
	const distracted = CONFIG.SWADE.statusIcons.distracted;

	// if the update is effects
	if (updateData.effects) {
		if (token.actorLink) { // linked token
			const tokenActor = game.actors.get(token.actorId) as Actor;

			await tokenActor.update({
				'data.status': {
					'isShaken': updateData.effects.includes(shaken),
					'isVulnerable': updateData.effects.includes(vulnerable),
					'isDistracted': updateData.effects.includes(distracted),
				}
			});
		} else {// unlinked token
			const newStatus = {
				isShaken: updateData.effects.includes(shaken),
				isVulnerable: updateData.effects.includes(vulnerable),
				isDistracted: updateData.effects.includes(distracted),
			}
			updateData.actorData = {
				data: {
					status: newStatus
				}
			}
		}
	} else if (updateData.actorData && updateData.actorData.data && updateData.actorData.data.status) { //else if the update is a toke-actor status update
		const actorShaken = updateData.actorData.data.status.isShaken;
		const actorVulnerable = updateData.actorData.data.status.isVulnerable;
		const actorDistracted = updateData.actorData.data.status.isDistracted;

		let newEffects = token.effects;

		if (typeof actorShaken !== 'undefined') {
			if (actorShaken && !newEffects.includes(shaken)) newEffects.push(shaken)
			if (!actorShaken && newEffects.includes(shaken)) {
				const index = newEffects.indexOf(shaken);
				if (index > -1) newEffects.splice(index, 1);
			}
		}

		if (typeof actorVulnerable !== 'undefined') {
			if (actorVulnerable && !newEffects.includes(vulnerable)) newEffects.push(vulnerable)
			if (!actorVulnerable && newEffects.includes(vulnerable)) {
				const index = newEffects.indexOf(vulnerable);
				if (index > -1) newEffects.splice(index, 1);
			}
		}
		if (typeof actorDistracted !== 'undefined') {
			if (actorDistracted && !newEffects.includes(distracted)) newEffects.push(distracted)
			if (!actorDistracted && newEffects.includes(distracted)) {
				const index = newEffects.indexOf(distracted);
				if (index > -1) newEffects.splice(index, 1);
			}
		}
		updateData.effects = [...new Set(newEffects)];
	}
});

Hooks.on('preCreateToken', async (scene: Scene, createData: any, options: any, userId: string) => {
	// return if the token has no linked actor
	if (!createData.actorLink) return;

	const actor = game.actors.get(createData.actorId) as Actor;

	// return if this token has no actor
	if (!actor) return;

	const shaken = CONFIG.SWADE.statusIcons.shaken;
	const vulnerable = CONFIG.SWADE.statusIcons.vulnerable;
	const distracted = CONFIG.SWADE.statusIcons.distracted;
	const actorData = actor.data as any;

	const createEffects = [];

	if (actorData.data.status.isShaken) createEffects.push(shaken);
	if (actorData.data.status.isVulnerable) createEffects.push(vulnerable);
	if (actorData.data.status.isDistracted) createEffects.push(distracted);

	createData.effects = createEffects;
});

Hooks.on('renderCombatTracker', (app, html: JQuery<HTMLElement>, data) => {
	const currentCombat = data.combats[data.combatCount - 1];
	html.find('.combatant').each((i, el) => {
		const combId = el.getAttribute('data-combatant-id');
		const combatant = currentCombat.data.combatants.find(c => c._id == combId);
		if (combatant.hasRolled) {
			el.getElementsByClassName('token-initiative')[0].innerHTML = `<span class="initiative">${combatant.flags.swade.cardString}</span>`
		}
	});
});

Hooks.on('preUpdateCombat', async (combat, updateData, options, userId) => {
	// Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
	const user = game.users.get(userId, { strict: true }) as User;
	if (!game.user.isGM || (game.userId !== userId && user.isGM)) {
		return
	}

	// Return if this update does not contains a round
	if (!updateData.round) {
		return;
	}

	if (combat instanceof CombatEncounters) {
		combat = game.combats.get(updateData._id, { strict: true });
	}

	// If we are not moving forward through the rounds, return
	if (updateData.round < 1 || updateData.round < combat.previous.round) {
		return;
	}

	// If Combat has just started, return
	if ((!combat.previous.round || combat.previous.round === 0) && updateData.round === 1) {
		return;
	}

	let jokerDrawn = false;

	// Reset the Initiative of all combatants
	combat.combatants.forEach((c) => {
		if (c.flags.swade && c.flags.swade.hasJoker) {
			jokerDrawn = true;
		}
	});

	const resetComs = combat.combatants.map(c => {
		c.initiative = null;
		c.hasRolled = false;
		c.flags.swade.cardValue = null
		c.flags.swade.suitValue = null
		c.flags.swade.hasJoker = null
		return c
	});

	updateData.combatants = resetComs;

	// Reset the deck if any combatant has had a Joker	
	if (jokerDrawn) {
		const deck = game.tables.getName(CONFIG.SWADE.init.cardTable) as RollTable;
		await deck.reset();
		ui.notifications.info('Card Deck automatically reset');
	}

	//Init autoroll
	if (game.settings.get('swade', 'autoInit')) {
		const combatantIds = combat.combatants.map(c => c._id);
		await combat.rollInitiative(combatantIds);
	}
});

// Add roll data to the message for formatting of dice pools
Hooks.on('renderChatMessage', async (chatMessage: ChatMessage, html: JQuery<HTMLHtmlElement>, data: any) => {
	if (chatMessage.isRoll && chatMessage.isRollVisible) {
		await formatRoll(chatMessage, html, data);
	}
});

Hooks.on('renderSettingsConfig', (settingsConfig: SettingsConfig, html: JQuery, data: any) => {



});
