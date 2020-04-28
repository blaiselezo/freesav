export const registerSettings = function () {
	game.settings.register('swade', 'hideNPCWildcards', {
		name: 'Hide NPC Wildcards',
		hint: 'Do not show which NPCs are Wildcards to players',
		default: true,
		scope: 'world',
		type: Boolean,
		config: true,
	});

	game.settings.register('swade', 'enableConviction', {
		name: 'Enable Conviction',
		hint: 'Enable the Conviction setting rule',
		default: false,
		scope: 'world',
		type: Boolean,
		config: true,
	});
}
