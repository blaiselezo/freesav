export const preloadHandlebarsTemplates = async function() {
	const templatePaths = [
		// Add paths to "systems/swade/templates"
		//Character Sheets
		'systems/swade/templates/wildcard-sheet.html',
		'systems/swade/templates/extra-sheet.html',

		//Actor partials
		'systems/swade/templates/weapon-card.html',
		'systems/swade/templates/armor-card.html',
		'systems/swade/templates/shield-card.html',

		//Item Sheets
		'systems/swade/templates/items/skill.html',
		'systems/swade/templates/items/weapon.html'
	];

	return loadTemplates(templatePaths);
}
