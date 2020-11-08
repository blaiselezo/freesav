import SwadeItem from './entities/SwadeItem';
import SwadeActor from './entities/SwadeActor';

interface RollHelperData {
  roll: Roll;
  bonusDamage?: Die;
  data?: any;
  speaker?: any;
  flavor?: string;
  title?: string;
  item?: SwadeItem;
  actor?: SwadeActor;
  allowGroup?: boolean;
}

interface RollHandlerData {
  form: any;
  roll: Roll;
  speaker: any;
  flavor: string;
  raise?: boolean;
  actor?: SwadeActor;
  data?: object;
  allowGroup?: boolean;
}

/**
 * A helper class for dice interactions
 */
export default class SwadeDice {
  static async Roll({
    roll,
    data,
    speaker,
    flavor,
    title,
    item,
    actor,
    allowGroup,
  }: RollHelperData): Promise<Roll> {
    const template = 'systems/swade/templates/chat/roll-dialog.html';
    let dialogData = {
      formula: roll.formula,
      data: data,
      rollMode: game.settings.get('core', 'rollMode'),
      rollModes: CONFIG.Dice.rollModes,
    };

    let buttons = {
      ok: {
        label: game.i18n.localize('SWADE.Roll'),
        icon: '<i class="fas fa-dice"></i>',
        callback: (html) => {
          finalRoll = this._handleRoll({
            form: html,
            roll: roll,
            speaker,
            flavor,
          });
          console.log('********************');
        },
      },
      extra: {
        label: '',
        icon: '<i class="far fa-plus-square"></i>',
        callback: (html) => {
          finalRoll = this._handleRoll({
            form: html,
            raise: true,
            actor: actor,
            roll: roll,
            allowGroup: actor && !actor.isWildcard && allowGroup,
            speaker,
            flavor,
          });
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('Cancel'),
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
    let finalRoll: Roll = null;
    return new Promise((resolve) => {
      new Dialog({
        title: title,
        content: html,
        buttons: buttons,
        default: 'ok',
        close: () => {
          console.log('#####################');
          resolve(finalRoll);
        },
      }).render(true);
    });
  }

  static _handleRoll({
    form = null,
    raise = false,
    actor = null,
    roll = null,
    data = {},
    speaker = null,
    flavor = '',
    allowGroup = false,
  }: RollHandlerData): Roll {
    let rollMode = game.settings.get('core', 'rollMode');
    let groupRoll = actor && raise;
    // Optionally include a situational bonus
    if (form) data['bonus'] = form.find('#bonus').val();
    if (data['bonus']) roll.terms.push(data['bonus']);

    if (groupRoll && allowGroup) {
      //TODO Group roll
      flavor = `${flavor} ${game.i18n.localize('SWADE.GroupRoll')}`;
    } else if (raise) {
      roll.terms.push('+1d6x=');
    }
    console.info('before roll', roll);
    let retVal;
    try {
      retVal = roll.roll();
    } catch (error) {
      console.error(error);
    }
    console.log('after roll', roll);
    // Convert the roll to a chat message and return the roll
    rollMode = form ? form.find('#rollMode').val() : rollMode;
    retVal.toMessage(
      {
        speaker: speaker,
        flavor: flavor,
      },
      { rollMode },
    );
    return retVal;
  }
}
