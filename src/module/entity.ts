import { SwadeDice } from "./dice";
import { TilingSprite } from "pixi.js";

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
      exp = `{1d${abl.die.sides}x=, 1d${abl["wild-die"].sides}x=}kh`;
    } else {
      exp = `1d${abl.die.sides}x${abl.die.sides}`;
    }

    //Check and add Modifiers
    const rollParts = [exp] as any[];
    let ablMod = parseInt(abl.die.modifier);
    if (!isNaN(ablMod) && ablMod !== 0) {
      if (ablMod > 0) rollParts.push("+")
      rollParts.push(ablMod)
    }
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
      title: `${game.i18n.localize(label)} ${game.i18n.localize(
        "SWADE.AttributeTest"
      )}`
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
      exp = `{1d${itemData["die"].sides}x=, 1d${itemData["wild-die"].sides}x=}kh`;
    } else {
      exp = `1d${itemData["die"].sides}x=`;
    }

    //Check and add Modifiers
    const rollParts = [exp] as any[];
    let itemMod = parseInt(itemData["die"].modifier);
    if (!isNaN(itemMod) && itemMod !== 0) {
      if (itemMod > 0) rollParts.push("+")
      rollParts.push(itemMod)
    };
    const woundFatigePenalties = this.calcWoundFatigePenalties();
    if (woundFatigePenalties !== 0) rollParts.push(woundFatigePenalties);

    // Roll and return
    return SwadeDice.Roll({
      event: options.event,
      parts: rollParts,
      data: itemData,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${items[0].name} ${game.i18n.localize("SWADE.SkillTest")}`,
      title: `${items[0].name} ${game.i18n.localize("SWADE.SkillTest")}`
    });
  }

  //Calculated the wound and fatigue penalites
  calcWoundFatigePenalties(): number {
    let retVal = 0;
    const wounds = parseInt(this.data["data"]["wounds"]["value"]);
    const fatigue = parseInt(this.data["data"]["fatigue"]["value"]);

    if (!isNaN(wounds)) retVal = (wounds > 3) ? retVal += 3 : retVal += wounds;
    if (!isNaN(fatigue)) retVal += fatigue;

    return retVal * -1;
  }

  /**
  * Function for shorcut roll in item (@str + 1d6)
  * return something like : {agi: "1d8x8+1", sma: "1d6x6", spi: "1d6x6", str: "1d6x6-1", vig: "1d6x6"}
  */
  getRollShortcuts(bAddWildDie = false) {
    let out = {};

    // Attributes
    const attr = this.data.data.attributes;
    for (const name of ["agility", "smarts", "spirit", "strength", "vigor"]) {
      out[name.substring(0, 3)] = `1d${attr[name].die.sides}x=`
        + (attr[name].die.modifier[0] != 0 ? (["+", "-"].indexOf(attr[name].die.modifier[0]) < 0 ? "+" : "") + attr[name].die.modifier : "")
        // wild-die
        + (bAddWildDie && attr[name]["wild-die"].sides ? `+1d${attr[name]["wild-die"].sides}x=` : "")
        ;
    }//fr
    return out;
  }
}
