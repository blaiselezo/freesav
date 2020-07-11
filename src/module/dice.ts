export class SwadeDice {
  // eslint-disable-next-line no-unused-vars
  static async Roll({
    parts = [],
    data = {},
    options = {},
    event = null,
    speaker = null,
    flavor = null,
    title = null,
    item = false,
  } = {}) {
    let rollMode = game.settings.get('core', 'rollMode');
    let rolled = false;
    let filtered = parts.filter(function (el) {
      return el != '' && el;
    });

    const _roll = (form = null, raise = false) => {
      // Optionally include a situational bonus
      if (form !== null) data['bonus'] = form.bonus.value;
      if (data['bonus']) filtered.push(data['bonus']);
      if (raise) filtered.push('+1d6x=');

      const roll = new Roll(filtered.join(''), data).roll();
      // Convert the roll to a chat message and return the roll
      rollMode = form ? form.rollMode.value : rollMode;
      roll.toMessage(
        {
          speaker: speaker,
          flavor: flavor,
        },
        { rollMode },
      );
      rolled = true;
      return roll;
    };

    const template = 'systems/swade/templates/chat/roll-dialog.html';
    let dialogData = {
      formula: filtered.join(' '),
      data: data,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };

    let buttons = {
      ok: {
        label: game.i18n.localize('SWADE.Roll'),
        icon: '<i class="fas fa-dice"></i>',
        callback: (html) => {
          roll = _roll(html[0].children[0]);
        },
      },
      raise: {
        label: game.i18n.localize('SWADE.RollRaise'),
        icon: '<i class="far fa-plus-square"></i>',
        callback: (html) => {
          roll = _roll(html[0].children[0], true);
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('SWADE.Cancel'),
      },
    };

    if (!item) delete buttons.raise;

    const html = await renderTemplate(template, dialogData);
    //Create Dialog window
    let roll: Roll;
    return new Promise((resolve) => {
      new Dialog({
        title: title,
        content: html,
        buttons: buttons,
        default: 'ok',
        close: () => {
          resolve(rolled ? roll : false);
        },
      }).render(true);
    });
  }
}
