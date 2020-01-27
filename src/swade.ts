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
import { preloadTemplates } from './module/preloadTemplates.js';
import { WildcardSheet, ExtraSheet} from './module/character-sheet.js';
import { SwadeItemSheet} from './module/item-sheet.js';

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	console.log('swade | Initializing swade');

	// Assign custom classes and constants here
	
	// Register custom system settings
	registerSettings();
	
	// Preload Handlebars templates
	await preloadTemplates();

  // Register custom sheets (if any)
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet('swade', WildcardSheet, {types: ["wildcard"], makeDefault: true});
  Actors.registerSheet('swade', ExtraSheet, {types: ["extra"], makeDefault: true});
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet('swade', SwadeItemSheet, {types: ["equipment"], makeDefault: true});
});

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once('setup', function() {
	// Do anything after initialization but before
	// ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function() {
	// Do anything once the system is ready
});

// Add any additional hooks if necessary