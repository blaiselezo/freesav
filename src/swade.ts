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
import { SwadeCharacterSheet } from './module/character-sheet';
import { SwadeNPCSheet } from './module/npc-sheet';
import { SwadeItemSheet } from './module/item-sheet';
import { SWADE } from './module/config'
import { isIncapacitated, setIncapacitationSymbol } from './module/util';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log(`SWADE | Initializing Savage Worlds Adventure Edition\n${SWADE.ASCII}`);

	// CONFIG.debug.hooks = true;

	// Record Configuration Values
	CONFIG.SWADE = SWADE;
	//Register custom Handlebars helpers
	registerCustomHelpers();

	// Register custom system settings
	registerSettings();

	//TODO Replaces the normal rollInitiative method
	//Combat.prototype.rollInitiative = myClass.someMethod;

	// Register custom sheets (if any)
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('swade', SwadeCharacterSheet, { types: ['character'], makeDefault: true });
	Actors.registerSheet('swade', SwadeNPCSheet, { types: ['npc'], makeDefault: true });
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('swade', SwadeItemSheet, { makeDefault: true });

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
Hooks.once('ready', function () {

});

// Add any additional hooks if necessary
Hooks.on('preCreateItem', function (items: Items, item: any, options: any) {
	//Set default image if no image already exists
	if (!item.img) {
		item.img = `systems/swade/assets/icons/${item.type}.svg`;
	}
});

// Mark all Wildcards in the Actors sidebars with an icon
Hooks.on('renderActorDirectory', (app, html: JQuery<HTMLElement>, data) => {

	const wildcards: Actor[] = app.entities.filter((a: Actor) => a.data.type === 'character' || a.getFlag('swade', 'isWildcard'));
	const found = html.find(".entity-name");

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

Hooks.on('updateActor', (actor: Actor, updates: any, object: Object, id: string) => {
	if (actor.data.type === 'npc') {
		ui.actors.render();
	}
});
