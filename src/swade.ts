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
import { registerSettings } from './module/settings';
import { registerCustomHelpers } from './module/handlebarsHelpers'
import { preloadHandlebarsTemplates } from './module/preloadTemplates';
import { listenJournalDrop } from './module/journalDrop';
import { SwadeCharacterSheet } from './module/character-sheet';
import { SwadeNPCSheet } from './module/npc-sheet';
import { SwadeItemSheet } from './module/item-sheet';
import { SWADE } from './module/config'
import { isIncapacitated } from './module/util';
import { swadeSetup } from './module/setup/setupHandler';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log(`SWADE | Initializing Savage Worlds Adventure Edition\n${SWADE.ASCII}`);

	// Record Configuration Values
	CONFIG.SWADE = SWADE;
	//CONFIG.debug.hooks = true;

	//Register custom Handlebars helpers
	registerCustomHelpers();

	// Register custom system settings
	registerSettings();

	// Register custom sheets (if any)
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('swade', SwadeCharacterSheet, { types: ['character'], makeDefault: true });
	Actors.registerSheet('swade', SwadeNPCSheet, { types: ['npc'], makeDefault: true });
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
	// Do anything after initialization but before
	// ready

});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', async () => {
	await swadeSetup();
});

// Add any additional hooks if necessary
Hooks.on('preCreateItem', function (items: Items, item: any, options: any) {
	//Set default image if no image already exists
	if (!item.img) {
		item.img = `systems/swade/assets/icons/${item.type}.svg`;
	}
});

// Mark all Wildcards in the Actors sidebars with an icon
Hooks.on('renderActorDirectory', (app, html: JQuery<HTMLElement>, options: any) => {
	const found = html.find(".entity-name");

	let wildcards: Actor[] = app.entities.filter((a: Actor) => a.data.type === 'character');

	//if the player is not a GM, then don't mark the NPC wildcards
	if (!game.settings.get('swade', 'hideNPCWildcards') || options.user.isGM) {
		wildcards = wildcards.concat(app.entities.filter((a: Actor) => a.getFlag('swade', 'isWildcard')));
	}

	wildcards.forEach((wc: Actor) => {
		for (let i = 0; i < found.length; i++) {
			const element = found[i];
			if (element.innerText === wc.data.name) {
				element.innerHTML = `
					<a><img src="systems/swade/assets/ui/wildcard.svg" class="wildcard-icon">${wc.data.name}</a>
					`
			}
		}
	});
});

Hooks.on('renderCompendium', async (app, html: JQuery<HTMLElement>, data) => {
	if (app.metadata.entity !== 'Actor') {
		return
	}
	const content = await app.getContent();
	const wildcards = content.filter((entity: Actor) => entity.data.type === 'character' || entity.getFlag('swade', 'isWildcard'));
	const names: string[] = wildcards.map(e => e.data.name);

	const found = html.find('.entry-name');
	found.each((i, el) => {
		const name = names.find(name => name === el.innerText)
		if (!name) {
			return;
		}
		el.innerHTML = `<a><img src="systems/swade/assets/ui/wildcard-dark.svg" class="wildcard-icon">${name}</a>`
	});
});

Hooks.on('renderActorSheet', (app, html: JQuery<HTMLElement>, data) => {
	const actor = data.actor;
	const wounds = actor.data.wounds;
	const fatigue = actor.data.fatigue;
	const isIncap = isIncapacitated(wounds, fatigue);

	if (isIncap) {
		html.find('.incap-img').addClass('fade-in-05');
	}
});

Hooks.on('updateActor', (actor: Actor, updates: any, options: any, userId: string) => {
	if (actor.data.type === 'npc' && updates.flags) {
		ui.actors.render();
	}

	//if it's a status update, update the token
	if (updates.data && updates.data.status) {

		const shaken = "icons/svg/daze.svg";
		const vulnerable = "icons/svg/degen.svg";
		const distracted = "icons/svg/stoned.svg";
		const actorData = actor.data as any;

		actor.getActiveTokens().forEach(async (t: any) => {
			if (t.data.actorLink && t.scene.id === game.scenes.active.id) {
				if (actorData.data.status.isShaken && !t.data.effects.includes(shaken)) await t.toggleEffect(shaken);
				if (!actorData.data.status.isShaken && t.data.effects.includes(shaken)) await t.toggleEffect(shaken);
				if (actorData.data.status.isVulnerable && !t.data.effects.includes(vulnerable)) await t.toggleEffect(vulnerable);
				if (!actorData.data.status.isVulnerable && t.data.effects.includes(vulnerable)) await t.toggleEffect(vulnerable);
				if (actorData.data.status.isDistracted && !t.data.effects.includes(distracted)) await t.toggleEffect(distracted);
				if (!actorData.data.status.isDistracted && t.data.effects.includes(distracted)) await t.toggleEffect(distracted);
				await t.drawEffects();
			}
		});
	}
});

Hooks.on('preUpdateToken', async (scene: Scene, sceneId: string, updates: any, tokenData: any) => {
	// if the update has no effects, return
	if (!updates.effects) return;

	//if the token has no linked actor, return
	if (!tokenData.currentData.actorLink) return;

	const tokenActor = game.actors.entities.find(a => a.id == tokenData.currentData.actorId) as Actor;

	// If this token has no actor, return
	if (!tokenActor) return;

	const shaken = "icons/svg/daze.svg";
	const vulnerable = "icons/svg/degen.svg";
	const distracted = "icons/svg/stoned.svg";

	await tokenActor.update({ "data.status.isShaken": updates.effects.includes(shaken) });
	await tokenActor.update({ "data.status.isVulnerable": updates.effects.includes(vulnerable) });
	await tokenActor.update({ "data.status.isDistracted": updates.effects.includes(distracted) });
});
