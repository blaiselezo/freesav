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
import { WildcardSheet, ExtraSheet } from './module/character-sheet.js';
import { SwadeItemSheet } from './module/item-sheet.js';
import { SWADE } from './module/config.js'

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
		switch (item.type) {
			case "skill":
				item.img = 'systems/swade/icons/skill.svg';
				break;
			case "weapon":
				item.img = 'systems/swade/icons/saber-and-pistol.svg'
				break;
			case "edge":
				item.img = 'systems/swade/icons/ribbon-medal.svg'
				break;
			default:
				break;
		}
	}
});