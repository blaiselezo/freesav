export const preloadHandlebarsTemplates = async function () {
	const templatePaths = [

		//Character Sheets
		'systems/swade/templates/actors/character-sheet.html',
		'systems/swade/templates/actors/npc-sheet.html',

		//Actor partials
		'systems/swade/templates/actors/partials/summary-tab.html',
		'systems/swade/templates/actors/partials/npc-summary-tab.html',
		'systems/swade/templates/actors/partials/edges-tab.html',
		'systems/swade/templates/actors/partials/inventory-tab.html',
		'systems/swade/templates/actors/partials/powers-tab.html',
		'systems/swade/templates/actors/partials/biography-tab.html',

		//Gear Cards
		'systems/swade/templates/actors/partials/weapon-card.html',
		'systems/swade/templates/actors/partials/armor-card.html',
		'systems/swade/templates/actors/partials/powers-card.html',
		'systems/swade/templates/actors/partials/shield-card.html',

		'systems/swade/templates/actors/partials/attributes.html',

		//die type list
		'systems/swade/templates/die-sides-options.html',
		'systems/swade/templates/attribute-select.html',

		// Chat
		'systems/swade/templates/chat/roll-formula.html',

		//Items
		'systems/swade/templates/items/partials/header.html',
		'systems/swade/templates/items/partials/header-delete.html',
		'systems/swade/templates/items/partials/description.html',
	];

	return loadTemplates(templatePaths);
}
