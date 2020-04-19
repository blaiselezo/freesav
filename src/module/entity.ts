import { SwadeDice } from "./dice";

export class SwadeActor extends Actor {
  /**
   * Extends data from base Actor class
   */
  prepareData() {
    super.prepareData();
    return this.data;
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /** @override */
  static async create(data, options = {}) {
    data.token = data.token || {};
    mergeObject(data.token, {
      vision: true,
      dimSight: 30,
      brightSight: 0,
      actorLink: true,
      disposition: 1,
    });
    return super.create(data, options);
  }

  /* -------------------------------------------- */

  /** @override */
  async update(data, options = {}) {
    return super.update(data, options);
  }

  /* -------------------------------------------- */

  /** @override */
  async createOwnedItem(itemData, options) {
    return super.createOwnedItem(itemData, options);
  }

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */
  rollAttribute(abilityId, options = { event: null }) {
    const label = CONFIG.SWADE.attributes[abilityId];
    let actorData = this.data as any;
    const abl = actorData.data.attributes[abilityId];
    let exp = "";
    if (this.data["data"].wildcard) {
      exp = `{1d${abl.die.sides}x${abl.die.sides}, 1d${abl["wild-die"].sides}x${abl["wild-die"].sides}}kh`;
    } else {
      exp = `1d${abl.die.sides}x${abl.die.sides}`;
    }

    //Check and add Modifiers
    const rollParts = [exp] as any[];
    const ablMod = parseInt(abl.die.modifier);
    if (ablMod !== NaN && ablMod !== 0) rollParts.push(ablMod);
    const woundFatigePenalties = this.calcWoundFatigePenalties();
    if (woundFatigePenalties !== 0) rollParts.push(woundFatigePenalties);

    // Roll and return
    return SwadeDice.Roll({
      event: options.event,
      parts: rollParts,
      data: actorData,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize(label)} ${game.i18n.localize(
        "SWADE.AttributeTest"
      )}`,
    });
  }

  rollSkill(abilityId, options = { event: null }) {
    let items = this.items.filter((i: Item) => i.id == abilityId);
    if (!items.length) {
      return;
    }
    let itemData = items[0].data["data"];
    let exp = "";
    if (this.data["data"].wildcard) {
      exp = `{1d${itemData["die"].sides}x${itemData["die"].sides}, 1d${itemData["wild-die"].sides}x${itemData["wild-die"].sides}}kh`;
    } else {
      exp = `1d${itemData["die"].sides}x${itemData["die"].sides}`;
    }

    //Check and add Modifiers
    const rollParts = [exp] as any[];
    const itemMod = parseInt(itemData["die"].modifier);
    if (itemMod !== NaN && itemMod !== 0) rollParts.push(itemMod);
    const woundFatigePenalties = this.calcWoundFatigePenalties();
    if (woundFatigePenalties !== 0) rollParts.push(woundFatigePenalties);

    // Roll and return
    return SwadeDice.Roll({
      event: options.event,
      parts: rollParts,
      data: itemData,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${items[0].name} ${game.i18n.localize("SWADE.SkillTest")}`,
    });
  }

  calcWoundFatigePenalties(): number {
    let retVal = 0;
    const wounds = parseInt(this.data["data"]["wounds"]["value"]);
    const fatigue = parseInt(this.data["data"]["fatigue"]["value"]);

    if (wounds !== NaN) retVal = (wounds > 3) ? retVal += 3 : retVal += wounds;
    if (fatigue !== NaN) retVal += fatigue;

    return retVal * -1;
  }
}
