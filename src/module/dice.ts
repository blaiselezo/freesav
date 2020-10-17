import SwadeItem from './entities/SwadeItem';
import SwadeActor from './entities/SwadeActor';

/**
 * A helper class for dice interactions
 */
export default class SwadeDice {
  // eslint-disable-next-line no-unused-vars
  static async Roll({
    parts = [],
    data = {},
    event = null,
    speaker = null,
    flavor = null,
    title = null,
    item = null as SwadeItem,
    actor = null as SwadeActor,
    allowGroup = false,
  } = {}): Promise<Roll> {
    let rolled = false;
    let filtered = parts.filter(function (el) {
      return el != '' && el;
    });

    const template = 'systems/swade/templates/chat/roll-dialog.html';
    let dialogData = {
      formula: filtered.join(' '),
      data: data,
      rollMode: game.settings.get('core', 'rollMode'),
      rollModes: CONFIG.Dice.rollModes,
    };

    let buttons = {
      ok: {
        label: game.i18n.localize('SWADE.Roll'),
        icon: '<i class="fas fa-dice"></i>',
        callback: (html) => {
          roll = this._handleRoll({
            form: html,
            rollParts: filtered,
            speaker,
            flavor,
          });
          rolled = true;
        },
      },
      extra: {
        label: '',
        icon: '<i class="far fa-plus-square"></i>',
        callback: (html) => {
          roll = this._handleRoll({
            form: html,
            raise: true,
            actor: actor,
            rollParts: filtered,
            allowGroup: actor && !actor.isWildcard && allowGroup,
            speaker,
            flavor,
          });
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('SWADE.Cancel'),
      },
    };

    if (item) {
      buttons.extra.label = game.i18n.localize('SWADE.RollRaise');
    } else if (actor && !actor.isWildcard && allowGroup) {
      buttons.extra.label = game.i18n.localize('SWADE.GroupRoll');
    } else {
      delete buttons.extra;
    }

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
          resolve(rolled ? roll : null);
        },
      }).render(true);
    });
  }

  static _handleRoll({
    form = null,
    raise = false,
    actor = null as SwadeActor,
    rollParts = [],
    data = {},
    speaker = null,
    flavor = '',
    allowGroup = false,
  }): Roll {
    let rollMode = game.settings.get('core', 'rollMode');
    let groupRoll = actor && raise;
    // Optionally include a situational bonus
    if (form !== null) data['bonus'] = form.find('#bonus').val();
    if (data['bonus']) rollParts.push(data['bonus']);
    if (groupRoll && allowGroup) {
      rollParts[0] = `{${rollParts[0]}, 1d6x=[${game.i18n.localize(
        'SWADE.WildDie',
      )}]}kh`;
      flavor = `${flavor} ${game.i18n.localize('SWADE.GroupRoll')}`;
    } else if (raise) {
      rollParts.push('+1d6x=');
    }

    const roll = new Roll(rollParts.join(''), data).roll();
    // Convert the roll to a chat message and return the roll
    rollMode = form ? form.find('#rollMode').val() : rollMode;
    roll.toMessage(
      {
        speaker: speaker,
        flavor: flavor,
      },
      { rollMode },
    );
    return roll;
  }
}
