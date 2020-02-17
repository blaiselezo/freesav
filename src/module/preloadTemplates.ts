export const preloadHandlebarsTemplates = async function() {
	const templatePaths = [
		// Add paths to "systems/swade/templates"
		//Character Sheets
		'systems/swade/templates/actors/wildcard-sheet.html',
		'systems/swade/templates/actors/extra-sheet.html',

		//Actor partials
		'systems/swade/templates/actors/partials/weapon-card.html',
		'systems/swade/templates/actors/partials/armor-card.html',
		'systems/swade/templates/actors/partials/shield-card.html',

		//Item Sheets
		'systems/swade/templates/items/skill.html',
		'systems/swade/templates/items/weapon.html'
	];

	return loadTemplates(templatePaths);
}
