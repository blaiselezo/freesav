export const preloadHandlebarsTemplates = async function () {
	const templatePaths = [

		//Character Sheets
		'systems/swade/templates/actors/character-sheet.html',
		'systems/swade/templates/actors/npc-sheet.html',

		//Actor partials
		//Sheet tabs
		'systems/swade/templates/actors/partials/summary-tab.html',
		'systems/swade/templates/actors/partials/npc-summary-tab.html',
		'systems/swade/templates/actors/partials/edges-tab.html',
		'systems/swade/templates/actors/partials/inventory-tab.html',
		'systems/swade/templates/actors/partials/powers-tab.html',

		//Gear Cards
		'systems/swade/templates/actors/partials/weapon-card.html',
		'systems/swade/templates/actors/partials/armor-card.html',
		'systems/swade/templates/actors/partials/shield-card.html',

		//die type list
		'systems/swade/templates/die-sides-options.html',
		'systems/swade/templates/attribute-select.html',

		// Chat
		'/templates/dice/roll.html'
	];

	return loadTemplates(templatePaths);
}
