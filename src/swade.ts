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
import { registerSettings } from './module/settings.js';
import { preloadHandlebarsTemplates } from './module/preloadTemplates.js';
import { WildcardSheet } from './module/wildcard-sheet.js';
import { ExtraSheet } from './module/extra-sheet.js'
import { SwadeItemSheet } from './module/item-sheet.js';
import { SWADE } from './module/config.js'
import { isIncapacitated, setIncapacitationSymbol } from './module/util';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
	console.log(`SWADE | Initializing Savage Worlds Adventure Edition\n${SWADE.ASCII}`);

	// Assign custom classes and constants here

	// Record Configuration Values
	CONFIG.SWADE = SWADE;

	// Register custom system settings
	registerSettings();

	// Register custom sheets (if any)
	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet('swade', WildcardSheet, { types: ['wildcard'], makeDefault: true });
	Actors.registerSheet('swade', ExtraSheet, { types: ['extra'], makeDefault: true });
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
	// Do anything once the system is ready
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
	app.entities.forEach(a => {
		if (a.data.type !== 'wildcard') {
			return;
		}
		let found = html.find(".entity-name");
		for (let i = 0; i < found.length; i++) {
			const element = found[i];
			if (element.innerText === a.data.name) {
				element.innerHTML = `
					<a><img src="systems/swade/assets/ui/wildcard.svg" class="wildcard-icon">${a.data.name}</a>
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
	const wildcards = content.filter(entity => entity.data.type === 'wildcard');
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
	const flags = actor.flags.swade;
	const wounds = actor.data.wounds;
	const fatigue = actor.data.fatigue;
	const isIncap = isIncapacitated(wounds, fatigue);
	const element = html.find('.incap-container');

	if (isIncap) {
		console.log(actor.flags);
		element.css('opacity', '1');
	}
});
