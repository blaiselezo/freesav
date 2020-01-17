export const preloadTemplates = async function() {
	const templatePaths = [
		// Add paths to "systems/swade/templates"
		'systems/swade/templates/wildcard-sheet.html',
		'systems/swade/templates/extra-sheet.html',
		'systems/swade/templates/item-sheet.html'
	];

	return loadTemplates(templatePaths);
}
