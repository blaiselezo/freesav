/* eslint-disable no-unused-vars */
import SwadeDice from '../dice';
import IRollOptions from '../../interfaces/IRollOptions';
import SwadeItem from './SwadeItem';
import { ActorType } from '../enums/ActorTypeEnum';
import { ItemType } from '../enums/ItemTypeEnum';

/**
 * @noInheritDoc
 */
export default class SwadeActor extends Actor {
  /**
   * @override
   * Extends data from base Actor class
   */
  prepareData() {
    this.data = duplicate(this['_data']);
    if (!this.data.img) this.data.img = CONST.DEFAULT_TOKEN;
    if (!this.data.name) this.data.name = 'New ' + this.entity;

    this.prepareBaseData();

    const shouldAutoCalcToughness =
      getProperty(this.data, 'data.details.autoCalcToughness') &&
      this.data.type !== ActorType.Vehicle;
    const toughnessKey = 'data.stats.toughness.value';
    const armorKey = 'data.stats.toughness.armor';

    this.prepareEmbeddedEntities();
    this.applyActiveEffects();

    if (shouldAutoCalcToughness) {
      const adjustedToughness = getProperty(this.data, toughnessKey);
      const adjustedArmor = getProperty(this.data, armorKey);
      setProperty(this.data, toughnessKey, adjustedToughness + adjustedArmor);
    }

    this.prepareDerivedData();
  }

  /**
   * @override
   */
  prepareBaseData() {
    //auto calculations
    const shouldAutoCalcToughness =
      getProperty(this.data, 'data.details.autoCalcToughness') &&
      this.data.type !== ActorType.Vehicle;

    if (shouldAutoCalcToughness) {
      const toughnessKey = 'data.stats.toughness.value';
      const armorKey = 'data.stats.toughness.armor';
      setProperty(this.data, toughnessKey, this.calcToughness(false));
      setProperty(this.data, armorKey, this.calcArmor());
    }
  }

  /**
   * @override
   */
  prepareDerivedData() {
    //return early for Vehicles
    if (this.data.type === ActorType.Vehicle) return;

    //modify pace with wounds
    if (game.settings.get('swade', 'enableWoundPace')) {
      const wounds = parseInt(getProperty(this.data, 'data.wounds.value'));
      const pace = parseInt(getProperty(this.data, 'data.stats.speed.value'));
      //bound maximum wound penalty to -3
      const woundsToUse = Math.min(wounds, 3);

      let adjustedPace = pace - woundsToUse;
      if (adjustedPace < 1) adjustedPace = 1;

      setProperty(this.data, 'data.stats.speed.value', adjustedPace);
    }

    //die type bounding for attributes
    let attributes = getProperty(this.data, 'data.attributes');
    for (let attribute in attributes) {
      let sides = getProperty(
        this.data,
        `data.attributes.${attribute}.die.sides`,
      );
      if (sides < 4 && sides !== 1) {
        setProperty(this.data, `data.attributes.${attribute}.die.sides`, 4);
      } else if (sides > 12) {
        setProperty(this.data, `data.attributes.${attribute}.die.sides`, 12);
      }
    }
  }

  /* -------------------------------------------- */
  /*  Getters
  /* -------------------------------------------- */
  get isWildcard(): boolean {
    if (this.data.type === ActorType.Vehicle) {
      return false;
    } else {
      return (
        getProperty(this.data, 'data.wildcard') ||
        this.data.type === ActorType.Character
      );
    }
  }

  get hasArcaneBackground(): boolean {
    return (
      this.items.filter(
        (i: SwadeItem) =>
          i.type === ItemType.Edge &&
          i.data.data['isArcaneBackground'] === true,
      ).length > 0
    );
  }

  /* -------------------------------------------- */
  /*  Socket Listeners and Handlers
  /* -------------------------------------------- */

  /** @override */
  static async create(data, options = {}) {
    let link = false;

    if (data.type === ActorType.Character) {
      link = true;
    }
    data.token = data.token || {};
    mergeObject(
      data.token,
      {
        vision: true,
        actorLink: link,
      },
      { overwrite: false },
    );

    return super.create(data, options);
  }

  /* -------------------------------------------- */
  /*  Rolls                                       */
  /* -------------------------------------------- */
  rollAttribute(
    abilityId: string,
    options: IRollOptions = { event: null },
  ): Promise<Roll> | Roll {
    const label = CONFIG.SWADE.attributes[abilityId].long;
    let actorData = this.data as any;
    const abl = actorData.data.attributes[abilityId];
    let finalRoll = new Roll('');
    let rollMods = this._buildTraitRollModifiers(abl, options);

    let attrRoll = new Roll('');
    attrRoll.terms.push(
      this._buildTraitDie(abl.die.sides, game.i18n.localize(label)),
    );
    if (rollMods.length !== 0) {
      rollMods.forEach((m) => attrRoll.terms.push(m.value));
    }

    //If the Actor is a wildcard the build a dicepool, otherwise build a Roll
    if (this.isWildcard) {
      let wildRoll = new Roll('');
      wildRoll.terms.push(this._buildWildDie(abl['wild-die'].sides));
      let wildCardPool = new DicePool({
        rolls: [attrRoll, wildRoll],
        modifiers: ['kh'],
      });
      if (rollMods.length !== 0) {
        rollMods.forEach((m) => wildRoll.terms.push(m.value));
      }
      finalRoll.terms.push(wildCardPool);
    } else {
      finalRoll = attrRoll;
    }

    if (options.suppressChat) {
      return finalRoll;
    }

    //Build Flavour
    let flavour = '';
    if (rollMods.length !== 0) {
      rollMods.forEach((v) => {
        flavour = flavour.concat(`<br>${v.label}: ${v.value}`);
      });
    }

    // Roll and return
    return SwadeDice.Roll({
      roll: finalRoll,
      data: actorData,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${game.i18n.localize(label)} ${game.i18n.localize(
        'SWADE.AttributeTest',
      )}${flavour}`,
      title: `${game.i18n.localize(label)} ${game.i18n.localize(
        'SWADE.AttributeTest',
      )}`,
      actor: this,
      allowGroup: true,
      flags: { swade: { colorMessage: true } },
    });
  }

  rollSkill(
    skillId: string,
    options: IRollOptions = { event: null },
    tempSkill?: SwadeItem,
  ): Promise<Roll> | Roll {
    if (!options.rof) options.rof = 1;
    let skill: SwadeItem;
    skill = this.items.find((i: SwadeItem) => i.id == skillId) as SwadeItem;
    if (tempSkill) {
      skill = tempSkill;
    }

    if (!skill) {
      return;
    }

    let skillData = getProperty(skill, 'data.data');
    let skillRoll = null;
    let rollMods = [];

    if (options.rof && options.rof > 1) {
      skillRoll = this._handleComplexSkill(skill, options);
      rollMods = skillRoll[1];
    } else {
      skillRoll = this._handleSimpleSkill(skill, options);
      rollMods = skillRoll[1];
    }

    //Build Flavour
    let flavour = '';
    if (options.flavour) {
      flavour = ` - ${options.flavour}`;
    }
    if (rollMods.length !== 0) {
      rollMods.forEach((v) => {
        flavour = flavour.concat(`<br>${v.label}: ${v.value}`);
      });
    }

    if (options.suppressChat) {
      return skillRoll[0];
    }

    // Roll and return
    return SwadeDice.Roll({
      roll: skillRoll[0],
      data: skillData,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${skill.name} ${game.i18n.localize(
        'SWADE.SkillTest',
      )}${flavour}`,
      title: `${skill.name} ${game.i18n.localize('SWADE.SkillTest')}`,
      actor: this,
      allowGroup: true,
      flags: { swade: { colorMessage: true } },
    });
  }

  async makeUnskilledAttempt(
    options: IRollOptions = { event: null },
  ): Promise<Roll> {
    let tempSkill = new Item(
      {
        name: game.i18n.localize('SWADE.Unskilled'),
        type: 'skill',
        flags: {},
        data: {
          die: {
            sides: 4,
            modifier: '-2',
          },
          'wild-die': {
            sides: 6,
          },
        },
      },
      { temporary: true },
    ) as SwadeItem;

    return this.rollSkill('', options, tempSkill);
  }

  async spendBenny() {
    let currentBennies = getProperty(this.data, 'data.bennies.value');
    //return early if there no bennies to spend
    if (currentBennies < 1) return;
    let message = await renderTemplate(CONFIG.SWADE.bennies.templates.spend, {
      target: this,
      speaker: game.user,
    });
    let chatData = {
      content: message,
    };
    if (game.settings.get('swade', 'notifyBennies')) {
      ChatMessage.create(chatData);
    }
    await this.update({ 'data.bennies.value': currentBennies - 1 });
    if (!!game.dice3d && game.settings.get('swade', 'dsnShowBennyAnimation')) {
      const benny = new Roll('1dB').roll();
      game.dice3d.showForRoll(benny, game.user, true, null, false);
    }
  }

  async getBenny() {
    let message = await renderTemplate(CONFIG.SWADE.bennies.templates.add, {
      target: this,
      speaker: game.user,
    });
    let chatData = {
      content: message,
    };
    if (game.settings.get('swade', 'notifyBennies')) {
      ChatMessage.create(chatData);
    }
    let actorData = this.data as any;
    await this.update({
      'data.bennies.value': actorData.data.bennies.value + 1,
    });
  }

  /**
   * Reset the bennies of the Actor to their default value
   * @param displayToChat display a message to chat
   */
  async refreshBennies(displayToChat = true) {
    if (displayToChat) {
      let message = await renderTemplate(
        CONFIG.SWADE.bennies.templates.refresh,
        {
          target: this,
          speaker: game.user,
        },
      );
      let chatData = {
        content: message,
      };
      ChatMessage.create(chatData);
    }
    let actorData = this.data as any;
    await this.update({ 'data.bennies.value': actorData.data.bennies.max });
  }

  /**
   * Calculates the total Wound Penalties
   */
  calcWoundPenalties(): number {
    let retVal = 0;
    const wounds = parseInt(getProperty(this.data, 'data.wounds.value'));
    let ignoredWounds = parseInt(getProperty(this.data, 'data.wounds.ignored'));
    if (isNaN(ignoredWounds)) ignoredWounds = 0;

    if (!isNaN(wounds)) {
      if (wounds > 3) {
        retVal += 3;
      } else {
        retVal += wounds;
      }
      if (retVal - ignoredWounds < 0) {
        retVal = 0;
      } else {
        retVal -= ignoredWounds;
      }
    }
    return retVal * -1;
  }

  /**
   * Calculates the total Fatigue Penalties
   */
  calcFatiguePenalties(): number {
    let retVal = 0;
    const fatigue = parseInt(getProperty(this.data, 'data.fatigue.value'));
    if (!isNaN(fatigue)) retVal -= fatigue;
    return retVal;
  }

  calcStatusPenalties(): number {
    let retVal = 0;
    const isDistracted = getProperty(this.data, 'data.status.isDistracted');
    const isEntangled = getProperty(this.data, 'data.status.isEntangled');
    if (isDistracted || isEntangled) {
      retVal -= 2;
    }
    return retVal;
  }

  /**
   * Function for shorcut roll in item (@str + 1d6)
   * return something like : {agi: "1d8x8+1", sma: "1d6x6", spi: "1d6x6", str: "1d6x6-1", vig: "1d6x6"}
   */
  getRollShortcuts(bAddWildDie = false) {
    let out = {};
    //return early if the actor is a vehicle
    if (this.data.type === 'vehicle') return out;
    // Attributes
    const attr = this.data.data.attributes;
    for (const name of ['agility', 'smarts', 'spirit', 'strength', 'vigor']) {
      out[name.substring(0, 3)] =
        `1d${attr[name].die.sides}x` +
        (attr[name].die.modifier && attr[name].die.modifier != 0
          ? (['+', '-'].indexOf(attr[name].die.modifier) < 0 ? '+' : '') +
            attr[name].die.modifier
          : '') +
        // wild-die
        (bAddWildDie && attr[name]['wild-die'].sides
          ? `+1d${attr[name]['wild-die'].sides}x`
          : '');
    } //fr
    return out;
  }

  /**
   * @override
   */
  getRollData() {
    let retVal = this.getRollShortcuts();
    let skills = this.items.filter((i: Item) => i.type === 'skill') as Item[];
    for (let skill of skills) {
      const skillDie = getProperty(skill.data, 'data.die.sides');
      let skillMod = getProperty(skill.data, 'data.die.modifier');
      skillMod = skillMod !== 0 ? parseInt(skillMod).signedString() : '';
      retVal[
        skill.name.slugify({ strict: true })
      ] = `1d${skillDie}x${skillMod}`;
    }
    retVal['wounds'] = getProperty(this.data, 'data.wounds.value') || 0;
    retVal['fatigue'] = getProperty(this.data, 'data.fatigue.value') || 0;
    return retVal;
  }

  /**
   * Calculates the correct armor value based on SWADE v5.5 and returns that value
   */
  calcArmor(): number {
    let totalArmorVal = 0;
    let armorList = this.data['items'].filter((i: SwadeItem) => {
      let isEquipped = getProperty(i.data, 'equipped');
      let coversTorso = getProperty(i.data, 'locations.torso');
      let isNaturalArmor = getProperty(i.data, 'isNaturalArmor');
      return i.type === 'armor' && isEquipped && !isNaturalArmor && coversTorso;
    });

    armorList.sort((a, b) => {
      const aValue = parseInt(a.data.armor);
      const bValue = parseInt(b.data.armor);
      if (aValue < bValue) {
        return 1;
      }
      if (aValue > bValue) {
        return -1;
      }
      return 0;
    });

    const naturalArmors = this.data['items'].filter((i: SwadeItem) => {
      return i.type === 'armor' && getProperty(i.data, 'isNaturalArmor');
    });

    for (const armor of naturalArmors) {
      totalArmorVal += parseInt(armor.data.armor);
    }

    if (armorList.length === 0) {
      return totalArmorVal;
    } else if (armorList.length === 1) {
      totalArmorVal = parseInt(armorList[0].data.armor);
    } else {
      totalArmorVal =
        parseInt(armorList[0].data.armor) +
        Math.floor(parseInt(armorList[1].data.armor) / 2);
    }

    return totalArmorVal;
  }

  /**
   * Calculates the Toughness value and returns it, optionally with armor
   * @param includeArmor include armor in final value (true/false). Default is true
   */
  calcToughness(includeArmor = true): number {
    let retVal = 0;
    let vigor = getProperty(this.data, 'data.attributes.vigor.die.sides');
    let vigMod = parseInt(
      getProperty(this.data, 'data.attributes.vigor.die.modifier'),
    );
    let toughMod = parseInt(
      getProperty(this.data, 'data.stats.toughness.modifier'),
    );

    let size = parseInt(getProperty(this.data, 'data.stats.size'));
    retVal = Math.round(vigor / 2) + 2;
    retVal += size;
    retVal += toughMod;
    if (vigMod > 0) {
      retVal += Math.floor(vigMod / 2);
    }
    if (includeArmor) {
      retVal += this.calcArmor();
    }
    return retVal;
  }

  /**
   * Calculates the maximum carry capacity based on the strength die and any adjustment steps
   */
  calcMaxCarryCapacity(): number {
    const strengthDie = getProperty(this.data, 'data.attributes.strength.die');

    let stepAdjust =
      getProperty(this.data, 'data.attributes.strength.encumbranceSteps') * 2;

    if (stepAdjust < 0) stepAdjust = 0;

    let encumbDie = strengthDie.sides + stepAdjust;

    if (encumbDie > 12) encumbDie > 12;

    let capacity = 20 + 10 * (encumbDie - 4);

    if (strengthDie.modifier > 0) {
      capacity = capacity + 20 * strengthDie.modifier;
    }

    return capacity;
  }

  /**
   * Helper Function for Vehicle Actors, to roll Maneuevering checks
   */
  rollManeuverCheck(event: any = null) {
    let driverId = getProperty(this.data, 'data.driver.id') as string;
    let driver = game.actors.get(driverId) as SwadeActor;

    //Return early if no driver was found
    if (!driverId || !driver) {
      return;
    }

    //Get skillname
    let skillName = getProperty(this.data, 'data.driver.skill');
    if (skillName === '') {
      skillName = getProperty(this.data, 'data.driver.skillAlternative');
    }

    let handling = getProperty(this.data, 'data.handling');
    let wounds = this.calcWoundPenalties();
    let totalHandling: number | string;
    totalHandling = handling + wounds;

    // Calculate handling

    //Handling is capped at a certain penalty
    if (totalHandling < CONFIG.SWADE.vehicles.maxHandlingPenalty) {
      totalHandling = CONFIG.SWADE.vehicles.maxHandlingPenalty;
    }
    if (totalHandling > 0) {
      totalHandling = `+${totalHandling}`;
    }

    let options = {
      event: event,
      additionalMods: [totalHandling],
    };

    //Find the operating skill
    let skill = driver.items.find(
      (i) => i.type === 'skill' && i.name === skillName,
    ) as SwadeItem;

    if (skill) {
      driver.rollSkill(skill.id, options);
    } else {
      driver.makeUnskilledAttempt(options);
    }
  }

  protected _handleSimpleSkill(
    skill: SwadeItem,
    options: IRollOptions,
  ): [Roll, any[]] {
    const skillData = getProperty(skill, 'data.data');

    let skillRoll = new Roll('');
    skillRoll.terms.push(this._buildTraitDie(skillData.die.sides, skill.name));

    if (this.isWildcard) {
      return this._handleComplexSkill(skill, options);
    } else {
      let rollMods = this._buildTraitRollModifiers(skillData, options);
      rollMods.forEach((m) => skillRoll.terms.push(m.value));
      return [skillRoll, rollMods];
    }
  }

  protected _handleComplexSkill(
    skill: SwadeItem,
    options: IRollOptions,
  ): [Roll, any[]] {
    if (!options.rof) options.rof = 1;
    const skillData = getProperty(skill, 'data.data');

    const rolls: Roll[] = [];
    const rollMods = this._buildTraitRollModifiers(skillData, options);
    for (let i = 0; i < options.rof; i++) {
      let skillRoll = new Roll('');
      let traitDie = this._buildTraitDie(skillData.die.sides, skill.name);
      skillRoll.terms.push(traitDie);

      rollMods.forEach((m) => skillRoll.terms.push(m.value));
      rolls.push(skillRoll);
    }

    let kh = options.rof > 1 ? `kh${options.rof}` : 'kh';

    let dicePool = new DicePool({
      rolls: rolls,
      modifiers: [kh],
    });

    if (this.isWildcard) {
      let wildRoll = new Roll('');
      wildRoll.terms.push(this._buildWildDie(skillData['wild-die'].sides));
      rollMods.forEach((m) => wildRoll.terms.push(m.value));
      dicePool.rolls.push(wildRoll);
    }

    //Conviction Modifier
    if (
      this.isWildcard &&
      game.settings.get('swade', 'enableConviction') &&
      getProperty(this.data, 'data.details.conviction.active')
    ) {
      for (const r of dicePool.rolls) {
        r.terms.push('+');
        r.terms.push(this._buildTraitDie(6, game.i18n.localize('SWADE.Conv')));
      }
    }

    const finalRoll = new Roll('');
    finalRoll.terms.push(dicePool);

    return [finalRoll, rollMods];
  }

  private _buildTraitDie(
    sides: number,
    flavor: string,
    modifiers: any[] = [],
  ): Die {
    return new Die({
      faces: sides,
      modifiers: ['x', ...modifiers],
      options: { flavor: flavor },
    });
  }

  private _buildWildDie(sides = 6, modifiers: any[] = []): Die {
    let die = new Die({
      faces: sides,
      modifiers: ['x', ...modifiers],
      options: { flavor: game.i18n.localize('SWADE.WildDie') },
    });
    if (game.dice3d) {
      /**
       * TODO
       * This doesn't seem to currently work due to an apparent bug in the Foundry roll API
       * which removes property from the options object during the roll evaluation
       * I'll keep it here anyway so we have it ready when the bug is fixed
       */
      const colorPreset = game.settings.get('swade', 'dsnWildDie');
      if (colorPreset !== 'none') {
        die.options['colorset'] = colorPreset;
      }
    }
    return die;
  }

  private _buildTraitRollModifiers(data: any, options: IRollOptions) {
    const mods = [];

    //Skill modifier
    let itemMod = parseInt(data.die.modifier);
    if (!isNaN(itemMod) && itemMod !== 0) {
      mods.push({
        label: game.i18n.localize('SWADE.TraitMod'),
        value: itemMod.signedString(),
      });
    }

    // Wound and Fatigue Penalties
    const woundPenalties = this.calcWoundPenalties();
    if (woundPenalties !== 0)
      mods.push({
        label: game.i18n.localize('SWADE.Wounds'),
        value: woundPenalties.signedString(),
      });

    const fatiguePenalties = this.calcFatiguePenalties();
    if (fatiguePenalties !== 0)
      mods.push({
        label: game.i18n.localize('SWADE.Fatigue'),
        value: fatiguePenalties.signedString(),
      });

    const statusPenalties = this.calcStatusPenalties();
    if (statusPenalties !== 0)
      mods.push({
        label: game.i18n.localize('SWADE.Status'),
        value: statusPenalties.signedString(),
      });

    //Additional Mods
    if (options.additionalMods) {
      options.additionalMods.forEach((v) => {
        let value;
        if (typeof v === 'string') {
          value = v;
        } else {
          value = v.signedString();
        }
        mods.push({ label: game.i18n.localize('SWADE.Addi'), value });
      });
    }
    return [...mods.filter((m) => m.value)];
  }
}
