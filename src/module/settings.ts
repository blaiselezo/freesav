export const registerSettings = function () {
	game.settings.register('swade', 'initiativeSound', {
		name: 'Card Sound',
		hint: 'Play a short card sound when dealing Initiative',
		default: true,
		scope: 'world',
		type: Boolean,
		config: true
	});
}
