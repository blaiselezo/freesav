import { SwadeDice } from '../dice';
// eslint-disable-next-line no-unused-vars
import SwadeActor from './SwadeActor';

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class SwadeItem extends Item {
  /**
   * @override
   */
  get actor() {
    return (this.options.actor as SwadeActor) || null;
  }

  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  rollDamage(options = { event: Event }) {
    const itemData = this.data.data;
    const actor = this.actor;
    const actorIsVehicle = actor.data.type === 'vehicle';
    const actorData = actor.data.data;
    const label = this.name;
    let ap = getProperty(this.data, 'data.ap');

    if (ap) {
      ap = ` - ${game.i18n.localize('SWADE.Ap')} ${ap}`;
    } else {
      ap = ` - ${game.i18n.localize('SWADE.Ap')} 0`;
    }

    // Intermediary roll to let it do the parsing for us
    let roll;
    if (actorIsVehicle) {
      roll = new Roll(itemData.damage).roll();
    } else {
      roll = new Roll(itemData.damage, actor.getRollShortcuts()).roll();
    }
    let newParts = [];
    roll.parts.forEach((part) => {
      if (part instanceof Die) {
        let split = part.formula.split('d');
        newParts.push(`${split[0]}d${part.faces}x=`);
      } else {
        newParts.push(part);
      }
    });

    if (
      !actorIsVehicle &&
      game.settings.get('swade', 'enableConviction') &&
      getProperty(actor.data, 'data.details.conviction.active')
    ) {
      newParts.push('+1d6x=');
    }
    // Roll and return
    return SwadeDice.Roll({
      event: options.event,
      parts: newParts,
      data: actorData,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${game.i18n.localize(label)} ${game.i18n.localize(
        'SWADE.Dmg',
      )}${ap}`,
      title: `${game.i18n.localize(label)} ${game.i18n.localize('SWADE.Dmg')}`,
      item: this,
    });
  }
}
