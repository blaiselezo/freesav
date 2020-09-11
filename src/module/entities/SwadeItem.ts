import { SwadeDice } from '../dice';
// eslint-disable-next-line no-unused-vars
import SwadeActor from './SwadeActor';

/**
 * Override and extend the basic :class:`Item` implementation
 * @noInheritDoc
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

  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);

    // Rich text description
    data.description = TextEditor.enrichHTML(data.description, htmlOptions);

    // Item properties
    const props = [];

    switch (this.data.type) {
      case 'hindrance':
        props.push(data.major ? 'Major' : 'minor');
        break;
      case 'shield':
        props.push(
          data.equipped
            ? '<i class="fas fa-tshirt"></i>'
            : '<i class="fas fa-tshirt" style="color:grey"></i>',
        );
        props.push(`<i class='fas fa-shield-alt'></i> ${data.parry}`);
        props.push(`<i class='fas fa-umbrella'></i> ${data.cover}`);
        break;
      case 'armor':
        props.push(`<i class='fas fa-shield-alt'></i> ${data.armor}`);
        props.push(
          data.equipped
            ? '<i class="fas fa-tshirt"></i>'
            : '<i class="fas fa-tshirt" style="color:grey"></i>',
        );
        props.push(data.locations.head ? 'Head' : '');
        props.push(data.locations.torso ? 'Torso' : '');
        props.push(data.locations.arms ? 'Arms' : '');
        props.push(data.locations.legs ? 'Legs' : '');
        break;
      case 'edge':
        props.push(data.requirements.value);
        props.push(data.isArcaneBackground ? 'Arcane' : '');
        break;
      case 'power':
        props.push(
          data.rank,
          data.arcane,
          `${data.pp}PP`,
          `<i class='fas fa-bullseye'></i> ${data.range}`,
          `<i class='fas fa-tint'></i> ${data.damage}`,
          `<i class='fas fa-hourglass-half'></i> ${data.duration}`,
          data.trapping,
        );
        break;
      case 'weapon':
        props.push(
          data.equipped
            ? '<i class="fas fa-tshirt"></i>'
            : '<i class="fas fa-tshirt" style="color:grey"></i>',
        );
        props.push(`<i class='fas fa-tint'></i> ${data.damage}`);
        props.push(`<i class='fas fa-shield-alt'></i> ${data.ap}`);
        props.push(`<i class='fas fa-bullseye'></i> ${data.range}`);
        break;
      case 'item':
        props.push(
          data.equipped
            ? '<i class="fas fa-tshirt"></i>'
            : '<i class="fas fa-tshirt" style="color:grey"></i>',
        );
        break;
    }

    // Filter properties and return
    data.properties = props.filter((p) => !!p);
    return data;
  }

  async show() {
    // Basic template rendering data
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token ? `${token.scene._id}.${token.id}` : null,
      item: this.data,
      data: this.getChatData({}),
      config: CONFIG.SWADE,
    };

    // Render the chat card template
    const template = `systems/swade/templates/chat/item-card.html`;
    const html = await renderTemplate(template, templateData);

    // Basic chat message data
    const chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: this.actor._id,
        token: this.actor.token,
        alias: this.actor.name,
      },
    };

    // Toggle default roll mode
    let rollMode = game.settings.get('core', 'rollMode');
    if (['gmroll', 'blindroll'].includes(rollMode))
      chatData['whisper'] = ChatMessage.getWhisperRecipients('GM');
    if (rollMode === 'selfroll') chatData['whisper'] = [game.user._id];
    if (rollMode === 'blindroll') chatData['blind'] = true;

    // Create the chat message
    return ChatMessage.create(chatData);
  }
}
