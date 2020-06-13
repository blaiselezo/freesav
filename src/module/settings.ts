export const registerSettings = function () {
  game.settings.register('swade', 'initiativeSound', {
    name: game.i18n.localize('SWADE.CardSound'),
    hint: game.i18n.localize('SWADE.CardSoundDesc'),
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
  });

  game.settings.register('swade', 'autoInit', {
    name: game.i18n.localize('SWADE.AutoInit'),
    hint: game.i18n.localize('SWADE.AutoInitDesc'),
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
  });

  game.settings.register('swade', 'initMessage', {
    name: game.i18n.localize('SWADE.CreateInitChat'),
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
  });

  game.settings.register('swade', 'hideNPCWildcards', {
    name: game.i18n.localize('SWADE.HideWC'),
    hint: game.i18n.localize('SWADE.HideWCDesc'),
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
  });

  game.settings.register('swade', 'autoLinkWildcards', {
    name: game.i18n.localize('SWADE.AutoLink'),
    hint: game.i18n.localize('SWADE.AutoLinkDesc'),
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
  });

  game.settings.register('swade', 'enableConviction', {
    name: game.i18n.localize('SWADE.EnableConv'),
    hint: game.i18n.localize('SWADE.EnableConvDesc'),
    default: false,
    scope: 'world',
    type: Boolean,
    config: true,
  });

  game.settings.register('swade', 'notifyBennies', {
    name: game.i18n.localize('SWADE.EnableBennyNotify'),
    hint: game.i18n.localize('SWADE.EnableBennyNotifyDesc'),
    default: true,
    scope: 'world',
    type: Boolean,
    config: true,
  });
};
