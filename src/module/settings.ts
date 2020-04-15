export const registerSettings = function () {
	game.settings.register('swade', 'initiativeSound', {
		name: game.i18n.localize("SWADE.CardSound"),
		hint: game.i18n.localize("SWADE.CardSoundDesc"),
		default: true,
		scope: 'world',
		type: Boolean,
		config: true
	});

	game.settings.register('swade', 'autoInit', {
		name: game.i18n.localize("SWADE.AutoInit"),
		hint: game.i18n.localize("SWADE.AutoInitDesc"),
		default: false,
		scope: 'world',
		type: Boolean,
		config: true
	});

	game.settings.register("swade", "hideNPCWildcards", {
		name: "Hide NPC Wildcards",
		hint: "Do not show which NPCs are Wildcards to players",
		default: true,
		scope: "world",
		type: Boolean,
		config: true,
	});
}
