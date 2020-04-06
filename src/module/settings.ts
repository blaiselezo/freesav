export const registerSettings = function () {
	// Register any custom system settings here

	game.settings.register('swade', 'initiativeSound', {
		name: 'Card Sound',
		hint: 'Play a short card sound when dealing Initiative',
		default: true,
		scope: 'world', //or 'client' for per-client settings
		type: Boolean, //or String, Object etc
		config: true, //adds it to the settings menu
		onChange: s => { //a function to execute when this setting changes
			// do something
		}
	});
}
