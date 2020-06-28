import { SwadeDice } from '../dice';
// eslint-disable-next-line no-unused-vars
import { SwadeActor } from './SwadeActor';

/**
 * Override and extend the basic :class:`Item` implementation
 */
export class SwadeItem extends Item {
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
    const actor = this.actor as SwadeActor;
    const actorData = actor.data.data;
    const label = this.name;

    // Intermediary roll to let it do the parsing for us
    let roll = new Roll(itemData.damage, actor.getRollShortcuts()).roll();
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
      actor.data.data['details']['conviction']['active'] &&
      game.settings.get('swade', 'enableConviction')
    ) {
      newParts.push('+1d6x=');
    }
    // Roll and return
    return SwadeDice.Roll({
      event: options.event,
      parts: newParts,
      data: actorData,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${game.i18n.localize(label)} ${game.i18n.localize('SWADE.Dmg')}`,
      title: `${game.i18n.localize(label)} ${game.i18n.localize('SWADE.Dmg')}`,
      item: true,
    });
  }
}
