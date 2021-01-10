import IRollOptions from '../../interfaces/IRollOptions';
import SwadeDice from '../dice';
import { ItemType } from '../enums/ItemTypeEnum';
import { notificationExists } from '../util';
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

  rollDamage(options: IRollOptions = {}): Promise<Roll> | Roll {
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

    let roll;
    let rollParts = [itemData.damage];
    if (options.dmgOverride) {
      rollParts = [options.dmgOverride];
    }

    //Additional Mods
    if (options.additionalMods) {
      rollParts = rollParts.concat(options.additionalMods);
    }

    if (actorIsVehicle) {
      roll = new Roll(rollParts.join(''));
    } else {
      roll = new Roll(rollParts.join(''), actor.getRollShortcuts());
    }
    let newParts = [];
    roll.terms.forEach((term) => {
      if (term instanceof Die) {
        newParts.push(`${term['number']}d${term.faces}x`);
      } else {
        newParts.push(this.makeExplodable(term));
      }
    });

    //Conviction Modifier
    if (
      !actorIsVehicle &&
      game.settings.get('swade', 'enableConviction') &&
      getProperty(actor.data, 'data.details.conviction.active')
    ) {
      newParts.push('+1d6x');
    }

    roll = new Roll(newParts.join(''));

    let flavour = '';
    if (options.flavour) {
      flavour = ` - ${options.flavour}`;
    }

    if (options.suppressChat) {
      return new Roll(newParts.join(''));
    }

    // Roll and return
    return SwadeDice.Roll({
      roll: roll,
      data: actorData,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${game.i18n.localize(label)} ${game.i18n.localize(
        'SWADE.Dmg',
      )}${ap}${flavour}`,
      title: `${game.i18n.localize(label)} ${game.i18n.localize('SWADE.Dmg')}`,
      item: this,
      flags: { swade: { colorMessage: false } },
    });
  }

  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);

    // Rich text description
    data.description = TextEditor.enrichHTML(data.description, htmlOptions);
    data.notes = TextEditor.enrichHTML(data.notes, htmlOptions);

    // Item properties
    const props = [];

    switch (this.type) {
      case 'hindrance':
        props.push(data.major ? 'Major' : 'Minor');
        break;
      case 'shield':
        props.push(
          data.equipped
            ? '<i class="fas fa-tshirt"></i>'
            : '<i class="fas fa-tshirt" style="color:grey"></i>',
        );
        props.push(`<i class='fas fa-shield-alt'></i> ${data.parry}`);
        props.push(`<i class='fas fa-umbrella'></i> ${data.cover}`);
        props.push(
          data.notes ? `<i class="fas fa-sticky-note"></i> ${data.notes}` : '',
        );
        break;
      case 'armor':
        props.push(`<i class='fas fa-shield-alt'></i> ${data.armor}`);
        props.push(
          data.equipped
            ? '<i class="fas fa-tshirt"></i>'
            : '<i class="fas fa-tshirt" style="color:grey"></i>',
        );
        props.push(
          data.notes ? `<i class="fas fa-sticky-note"></i> ${data.notes}` : '',
        );
        props.push(data.locations.head ? game.i18n.localize('SWADE.Head') : '');
        props.push(
          data.locations.torso ? game.i18n.localize('SWADE.Torso') : '',
        );
        props.push(data.locations.arms ? game.i18n.localize('SWADE.Arms') : '');
        props.push(data.locations.legs ? game.i18n.localize('SWADE.Legs') : '');

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
          `<i class="fas fa-ruler"></i> ${data.range}`,
          data.damage ? `<i class='fas fa-tint'></i> ${data.damage}` : '',
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
        props.push(
          data.damage ? `<i class='fas fa-tint'></i> ${data.damage}` : '',
        );
        props.push(`<i class='fas fa-shield-alt'></i> ${data.ap}`);
        props.push(`<i class="fas fa-ruler"></i> ${data.range}`);
        props.push(
          data.notes ? `<i class="fas fa-sticky-note"></i> ${data.notes}` : '',
        );
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

    //Additional actions
    const actions = getProperty(this.data, 'data.actions.additional');
    data.hasAdditionalActions = !!actions && Object.keys(actions).length > 0;

    data.actions = [];
    for (let action in actions) {
      data.actions.push({
        key: action,
        type: actions[action].type,
        name: actions[action].name,
      });
    }
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
      hasAmmoManagement: game.settings.get('swade', 'ammoManagement'),
      hasReloadButton:
        game.settings.get('swade', 'ammoManagement') &&
        this.type === ItemType.Weapon &&
        getProperty(this.data, 'data.shots') > 0,
      hasDamage: !!this.data.data.damage,
      skill: getProperty(this.data, 'data.actions.skill'),
      hasSkillRoll:
        [
          ItemType.Weapon.toString(),
          ItemType.Power.toString(),
          ItemType.Shield.toString(),
        ].includes(this.data.type) &&
        !!getProperty(this.data, 'data.actions.skill'),
    };

    // Render the chat card template
    const template = 'systems/swade/templates/chat/item-card.html';
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
      flags: { 'core.canPopout': true },
    };

    // Toggle default roll mode
    let rollMode = game.settings.get('core', 'rollMode');
    if (['gmroll', 'blindroll'].includes(rollMode))
      chatData['whisper'] = ChatMessage.getWhisperRecipients('GM');
    if (rollMode === 'selfroll') chatData['whisper'] = [game.user._id];
    if (rollMode === 'blindroll') chatData['blind'] = true;

    // Create the chat message
    let ChatCard = await ChatMessage.create(chatData);
    Hooks.call('swadeChatCard', this.actor, this, ChatCard, game.user.id);
    return ChatCard;
  }

  private makeExplodable(expresion) {
    // Make all dice of a roll able to explode
    // Code from the SWADE system
    const reg_exp = /\d*d\d+[^kdrxc]/g;
    expresion = expresion + ' '; // Just because of my poor reg_exp foo
    let dice_strings = expresion.match(reg_exp);
    let used = [];
    if (dice_strings) {
      dice_strings.forEach((match) => {
        if (used.indexOf(match) === -1) {
          expresion = expresion.replace(
            new RegExp(match.slice(0, -1), 'g'),
            match.slice(0, -1) + 'x',
          );
          used.push(match);
        }
      });
    }
    return expresion;
  }

  getRollData() {
    return {};
  }

  static async _onChatCardAction(event) {
    event.preventDefault();

    // Extract card data
    const button = event.currentTarget;
    button.disabled = true;
    const card = button.closest('.chat-card');
    const messageId = card.closest('.message').dataset.messageId;
    const message = game.messages.get(messageId);
    const action = button.dataset.action;

    //save the message ID if we're doing automated ammo management
    if (game.settings.get('swade', 'ammoManagement')) {
      CONFIG.SWADE['itemCardMessageId'];
    }

    // Validate permission to proceed with the roll
    const isTargetted = action === 'save';
    if (!(isTargetted || game.user.isGM || message.isAuthor)) return;

    // Get the Actor from a synthetic Token
    const actor = this._getChatCardActor(card);
    if (!actor) return;

    // Get the Item
    const item = actor.getOwnedItem(card.dataset.itemId) as SwadeItem;
    if (!item) {
      return ui.notifications.error(
        `The requested item ${card.dataset.itemId} no longer exists on Actor ${actor.name}`,
      );
    }

    // Get card targets
    let targets = [];
    if (isTargetted) {
      targets = this._getChatCardTargets(card);
    }

    let skill: SwadeItem = null;
    let roll: Promise<Roll> | Roll = null;
    // Attack and Damage Rolls
    switch (action) {
      case 'damage':
        roll = await item.rollDamage({
          event,
          additionalMods: [getProperty(item.data, 'data.actions.dmgMod')],
        });
        Hooks.call('swadeAction', actor, item, action, roll, game.user.id);
        break;
      case 'formula':
        skill = actor.items.find(
          (i: SwadeItem) =>
            i.type === ItemType.Skill &&
            i.name === getProperty(item.data, 'data.actions.skill'),
        );
        if (
          game.settings.get('swade', 'ammoManagement') &&
          getProperty(item.data, 'data.currentShots') < 1
        ) {
          //check to see we're not posting the message twice
          if (!notificationExists('SWADE.NotEnoughAmmo', true)) {
            ui.notifications.warn(game.i18n.localize('SWADE.NotEnoughAmmo'));
          }
        } else {
          roll = await this._doSkillAction(skill, item, actor);
        }
        if (roll) await this._subtractShots(actor, item.id, 1);
        Hooks.call('swadeAction', actor, item, action, roll, game.user.id);
        break;
      case 'reload':
        if (
          getProperty(item.data, 'data.currentShots') >=
          getProperty(item.data, 'data.shots')
        ) {
          //check to see we're not posting the message twice
          if (!notificationExists('SWADE.ReloadUnneeded', true)) {
            ui.notifications.info(game.i18n.localize('SWADE.ReloadUnneeded'));
          }
          break;
        }
        await actor.updateOwnedItem({
          _id: item.id,
          'data.currentShots': getProperty(item.data, 'data.shots'),
        });
        //check to see we're not posting the message twice
        if (!notificationExists('SWADE.ReloadSuccess', true)) {
          ui.notifications.info(game.i18n.localize('SWADE.ReloadSuccess'));
        }
        break;
      default:
        roll = await this._handleAdditionalActions(item, actor, action);
        // No need to call the hook here, as _handleAdditionalActions already calls the hook
        // This is so an external API can directly use _handleAdditionalActions to use an action and still fire the hook
        break;
    }
    this._refreshItemCard();
    // Re-enable the button
    button.disabled = false;
  }

  static _getChatCardActor(card): SwadeActor {
    // Case 1 - a synthetic actor from a Token
    const tokenKey = card.dataset.tokenId;
    if (tokenKey) {
      const [sceneId, tokenId] = tokenKey.split('.');
      const scene = game.scenes.get(sceneId);
      if (!scene) return null;
      const tokenData = scene.getEmbeddedEntity('Token', tokenId);
      if (!tokenData) return null;
      const token = new Token(tokenData);
      return token.actor as SwadeActor;
    }

    // Case 2 - use Actor ID directory
    const actorId = card.dataset.actorId;
    return (game.actors.get(actorId) as SwadeActor) || (null as SwadeActor);
  }

  static _getChatCardTargets(card) {
    const character = game.user.character;
    const controlled = canvas.tokens.controlled;
    const targets = controlled.reduce(
      (arr, t) => (t.actor ? arr.concat([t.actor]) : arr),
      [],
    );
    if (character && controlled.length === 0) targets.push(character);
    return targets;
  }

  /**
   * Handles misc actions
   * @param item The item that this action is used on
   * @param actor The actor who has the item
   * @param action The action key
   */
  static async _handleAdditionalActions(
    item: SwadeItem,
    actor: SwadeActor,
    action: string,
  ) {
    const availableActions = getProperty(item.data, 'data.actions.additional');
    let actionToUse = availableActions[action];

    // if there isn't actually any action then return early
    if (!actionToUse) {
      return;
    }

    let roll = undefined;

    if (actionToUse.type === 'skill') {
      // Do skill stuff
      let skill = actor.items.find(
        (i: SwadeItem) =>
          i.type === ItemType.Skill &&
          i.name === getProperty(item.data, 'data.actions.skill'),
      );

      let altSkill = actor.items.find(
        (i: SwadeItem) =>
          i.type === ItemType.Skill && i.name === actionToUse.skillOverride,
      );

      //try to find the skill override. If the alternative skill is not available then trigger an unskilled attempt
      if (actionToUse.skillOverride) {
        if (altSkill) {
          skill = altSkill;
        } else {
          skill = null;
        }
      }

      let actionSkillMod = '';
      if (actionToUse.skillMod && parseInt(actionToUse.skillMod) !== 0) {
        actionSkillMod = actionToUse.skillMod;
      }
      const currentShots = getProperty(item.data, 'data.currentShots');
      if (
        game.settings.get('swade', 'ammoManagement') &&
        !!actionToUse.shotsUsed &&
        currentShots < actionToUse.shotsUsed
      ) {
        //check to see we're not posting the message twice
        if (!notificationExists('SWADE.NotEnoughAmmo', true)) {
          ui.notifications.warn(game.i18n.localize('SWADE.NotEnoughAmmo'));
        }
        return null;
      }
      if (skill) {
        roll = await actor.rollSkill(skill.id, {
          flavour: actionToUse.name,
          rof: actionToUse.rof,
          additionalMods: [
            getProperty(item.data, 'data.actions.skillMod'),
            actionSkillMod,
          ],
        });
      } else {
        roll = await actor.makeUnskilledAttempt({
          flavour: actionToUse.name,
          rof: actionToUse.rof,
          additionalMods: [
            getProperty(item.data, 'data.actions.skillMod'),
            actionSkillMod,
          ],
        });
      }
      if (roll)
        await this._subtractShots(actor, item.id, actionToUse.shotsUsed || 0);
    } else if (actionToUse.type === 'damage') {
      //Do Damage stuff
      roll = await item.rollDamage({
        dmgOverride: actionToUse.dmgOverride,
        flavour: actionToUse.name,
        additionalMods: [
          getProperty(item.data, 'data.actions.dmgMod'),
          actionToUse.dmgMod,
        ],
      });
    }
    Hooks.call('swadeAction', actor, item, action, roll, game.user.id);
    return roll;
  }

  static async _doSkillAction(
    skill: SwadeItem,
    item: SwadeItem,
    actor: SwadeActor,
  ): Promise<Roll> {
    if (skill) {
      return actor.rollSkill(skill.id, {
        additionalMods: [getProperty(item.data, 'data.actions.skillMod')],
      });
    } else {
      return actor.makeUnskilledAttempt({
        additionalMods: [getProperty(item.data, 'data.actions.skillMod')],
      });
    }
  }

  static async _subtractShots(
    actor: SwadeActor,
    itemId: string,
    shotsUsed?: number,
  ): Promise<void> {
    if (!game.settings.get('swade', 'ammoManagement')) return;

    const item = actor.items.get(itemId) as SwadeItem;
    const currentShots = parseInt(getProperty(item.data, 'data.currentShots'));

    if (!!shotsUsed && currentShots - shotsUsed >= 0) {
      await actor.updateOwnedItem({
        _id: itemId,
        'data.currentShots': currentShots - shotsUsed,
      });
    }
  }

  static async _refreshItemCard() {
    //get ChatMessage and remove temporarily stored id from CONFIG object
    const message = game.messages.get(CONFIG.SWADE['itemCardMessageId']);
    delete CONFIG.SWADE['itemCardMessageId'];

    const messageContent = new DOMParser().parseFromString(
      getProperty(message, 'data.content'),
      'text/html',
    );

    const messageData = $(messageContent)
      .find('.chat-card.item-card')
      .first()
      .data();

    const item = game.actors
      .get(messageData.actorId)
      .getOwnedItem(messageData.itemId);

    const currentShots = getProperty(item.data, 'data.currentShots');
    const maxShots = getProperty(item.data, 'data.shots');

    //update message content
    $(messageContent)
      .find('.ammo-counter .current-shots')
      .first()
      .text(currentShots);
    $(messageContent).find('.ammo-counter .max-shots').first().text(maxShots);

    //update the message and render the chatlog/chat popout
    await message.update({ content: messageContent.body.innerHTML });
    ui['chat'].render(true);
    for (const app in message.apps) {
      message.apps[app].render(true);
    }
  }
}
