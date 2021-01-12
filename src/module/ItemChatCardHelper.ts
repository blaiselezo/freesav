import SwadeActor from './entities/SwadeActor';
import SwadeItem from './entities/SwadeItem';
import { ItemType } from './enums/ItemTypeEnum';
import { notificationExists } from './util';

/**
 * A helper class for Item chat card logic
 */
export default class ItemChatCardHelper {
  static async onChatCardAction(event) {
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
      CONFIG.SWADE['itemCardMessageId'] = messageId;
    }

    // Validate permission to proceed with the roll
    const isTargetted = action === 'save';
    if (!(isTargetted || game.user.isGM || message.isAuthor)) return;

    // Get the Actor from a synthetic Token
    const actor = this.getChatCardActor(card);
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
      targets = this.getChatCardTargets(card);
    }

    let skill: SwadeItem = null;
    let roll: Promise<Roll> | Roll = null;
    // Attack and Damage Rolls

    const hasAutoReload = getProperty(item.data, 'data.autoReload');
    const ammo = actor.getOwnedItem(getProperty(item.data, 'data.ammo'));
    let canAutoReload =
      ammo && getProperty(actor.getOwnedItem(ammo.id), 'data.quantity') <= 0;
    const ammoManagement = game.settings.get('swade', 'ammoManagement');

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
          (ammoManagement && hasAutoReload && !canAutoReload) ||
          (ammoManagement &&
            !getProperty(item.data, 'data.autoReload') &&
            getProperty(item.data, 'data.currentShots') < 1)
        ) {
          //check to see we're not posting the message twice
          if (!notificationExists('SWADE.NotEnoughAmmo', true)) {
            ui.notifications.warn(game.i18n.localize('SWADE.NotEnoughAmmo'));
          }
        } else {
          roll = await this.doSkillAction(skill, item, actor);
        }
        if (roll) await this.subtractShots(actor, item.id, 1);
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
        await this.reloadWeapon(actor, item);
        break;
      default:
        roll = await this.handleAdditionalActions(item, actor, action);
        // No need to call the hook here, as _handleAdditionalActions already calls the hook
        // This is so an external API can directly use _handleAdditionalActions to use an action and still fire the hook
        break;
    }
    this.refreshItemCard();
    // Re-enable the button
    button.disabled = false;
  }

  static getChatCardActor(card): SwadeActor {
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

  static getChatCardTargets(card) {
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
  static async handleAdditionalActions(
    item: SwadeItem,
    actor: SwadeActor,
    action: string,
  ) {
    const availableActions = getProperty(item.data, 'data.actions.additional');
    const ammoManagement = game.settings.get('swade', 'ammoManagement');
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

      //do autoreload stuff if applicable
      const hasAutoReload = getProperty(item.data, 'data.autoReload');
      const ammo = actor.getOwnedItem(getProperty(item.data, 'data.ammo'));
      let canAutoReload =
        ammo && getProperty(actor.getOwnedItem(ammo.id), 'data.quantity') <= 0;
      if (
        (ammoManagement && hasAutoReload && !canAutoReload) ||
        (game.settings.get('swade', 'ammoManagement') &&
          !!actionToUse.shotsUsed &&
          currentShots < actionToUse.shotsUsed)
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
        await this.subtractShots(actor, item.id, actionToUse.shotsUsed || 0);
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

  static async doSkillAction(
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

  static async subtractShots(
    actor: SwadeActor,
    itemId: string,
    shotsUsed?: number,
  ): Promise<void> {
    if (!game.settings.get('swade', 'ammoManagement')) return;

    const item = actor.items.get(itemId) as SwadeItem;
    const currentShots = parseInt(getProperty(item.data, 'data.currentShots'));
    const hasAutoReload = getProperty(item.data, 'data.autoReload') as boolean;

    if (hasAutoReload) {
      const ammo = actor.getOwnedItem(getProperty(item.data, 'data.ammo'));
      if (!ammo) return;
      const current = getProperty(ammo.data, 'data.quantity');
      const newQuantity = current - (shotsUsed || 1);

      await actor.updateOwnedItem({
        _id: ammo.id,
        'data.quantity': newQuantity,
      });
    } else if (!!shotsUsed && currentShots - shotsUsed >= 0) {
      await actor.updateOwnedItem({
        _id: itemId,
        'data.currentShots': currentShots - shotsUsed,
      });
    }
  }

  static async reloadWeapon(actor: SwadeActor, weapon: SwadeItem) {
    const ammoId = getProperty(weapon.data, 'data.ammo') as string;
    const ammo = actor.getOwnedItem(ammoId);
    //return if there's no ammo set
    if (!ammoId || !ammo) {
      if (!notificationExists('SWADE.NoAmmoSet', true)) {
        ui.notifications.info(game.i18n.localize('SWADE.NoAmmoSet'));
      }
      return;
    }
    const ammoInInventory = getProperty(ammo.data, 'data.quantity') as number;
    const shots = parseInt(getProperty(weapon.data, 'data.shots'));
    const missingAmmo = shots - getProperty(weapon.data, 'data.currentShots');

    let leftoverAmmoInInventory = ammoInInventory - missingAmmo;
    let ammoInMagazine = shots;

    if (ammoInInventory < missingAmmo) {
      ammoInMagazine =
        getProperty(weapon.data, 'data.currentShots') + ammoInInventory;
      leftoverAmmoInInventory = 0;
      if (!notificationExists('SWADE.NotEnoughAmmoToReload', true)) {
        ui.notifications.warn('SWADE.NotEnoughAmmoToReload');
      }
    }

    //update the weapon
    await actor.updateOwnedItem({
      _id: weapon.id,
      'data.currentShots': ammoInMagazine,
    });
    //update the ammo item
    await actor.updateOwnedItem({
      _id: ammo.id,
      'data.quantity': leftoverAmmoInInventory,
    });
    //check to see we're not posting the message twice
    if (!notificationExists('SWADE.ReloadSuccess', true)) {
      ui.notifications.info(game.i18n.localize('SWADE.ReloadSuccess'));
    }
  }

  static async refreshItemCard() {
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
