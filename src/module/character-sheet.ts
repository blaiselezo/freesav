import { SwadeActor } from "./entity";
import { SwadeItem } from "./item-entity";

export class SwadeCharacterSheet extends ActorSheet {
  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["swade", "sheet", "character"],
      width: 600,
      height: 768,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheet-body",
          initial: "summary",
        },
      ],
    });
  }

  get template() {
    // Later you might want to return a different template
    // based on user permissions.
    return "systems/swade/templates/actors/character-sheet.html";
  }

  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Item
    html.find(".item-delete").click(async (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const ownedItem = this.actor.getOwnedItem(li.data("itemId"))
      await Dialog.confirm({
        title: game.i18n.localize("SWADE.Del"),
        content: `<p><center>${game.i18n.localize("SWADE.Del")} <strong>${ownedItem.name}</strong>?</center></p>`,
        yes: () => {
          this.actor.deleteOwnedItem(ownedItem.id);
          li.slideUp(200, () => this.render(false));
        },
        no: () => { }
      }, {});
    });

    //Show Description of an Edge/Hindrance
    html.find(".edge").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item: any = this.actor.getOwnedItem(li.data("itemId")).data;
      html.find("#edge-description")[0].innerHTML = item.data.description;
    });

    //Toggle Equipment
    html.find(".item-equipped").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item: any = this.actor.getOwnedItem(li.data("itemId"));
      this.actor.updateOwnedItem(this._toggleEquipped(li.data("itemId"), item));
    });

    //Input Synchronization
    html.find(".wound-input").keyup((ev) => {
      html.find(".wound-slider").val($(ev.currentTarget).val());
    });

    html.find(".wound-slider").change((ev) => {
      html.find(".wound-input").val($(ev.currentTarget).val());
    });

    html.find(".fatigue-input").keyup((ev) => {
      html.find(".fatigue-slider").val($(ev.currentTarget).val());
    });

    html.find(".fatigue-slider").change((ev) => {
      html.find(".fatigue-input").val($(ev.currentTarget).val());
    });

    //Add Benny
    html.find(".benny-add").click((ev) => {
      const currentBennies: any = html.find(".bennies-current").val();
      const newBennies = parseInt(currentBennies) + 1;
      this.actor.update({ "data.bennies.value": newBennies });
    });

    //Remove Benny
    html.find(".benny-subtract").click((ev) => {
      const currentBennies: any = html.find(".bennies-current").val();
      const newBennies = parseInt(currentBennies) - 1;
      if (newBennies >= 0) {
        this.actor.update({ "data.bennies.value": newBennies });
      }
    });

    //Toggle Conviction
    html.find(".convction-toggle").click((ev) => {
      if (!this.actor.getFlag("swade", "convictionReady")) {
        this.actor.setFlag("swade", "convictionReady", true);
      } else {
        //roll conviction
        this.actor.setFlag("swade", "convictionReady", false);
      }
    });

    // Roll attribute
    html.find(".attribute-label a").click((event) => {
      let actorObject = this.actor as SwadeActor;
      let element = event.currentTarget as Element;
      let attribute = element.parentElement.parentElement.dataset.attribute;
      actorObject.rollAttribute(attribute, { event: event });
    });

    // Roll Skill
    html.find(".skill-label a").click((event) => {
      let actorObject = this.actor as SwadeActor;
      let element = event.currentTarget as Element;
      let item = element.parentElement.parentElement.dataset.itemId;
      actorObject.rollSkill(item, { event: event });
    });

    // Roll Damage
    html.find(".damage-roll").click((event) => {
      let element = event.currentTarget as Element;
      let itemId =
        element.parentElement.parentElement.parentElement.dataset.itemId;
      const item = this.actor.getOwnedItem(itemId) as SwadeItem;
      return item.rollDamage();
      // actorObject.rollSkill(item, {event: event});
    });
  }

  getData(): ActorSheetData {
    let data: any = super.getData();

    data.itemsByType = {};
    for (const item of data.items) {
      let list = data.itemsByType[item.type];
      if (!list) {
        list = [];
        data.itemsByType[item.type] = list;
      }
      list.push(item);
    }

    data.data.owned.gear = this._checkNull(data.itemsByType["gear"]);
    data.data.owned.weapons = this._checkNull(data.itemsByType["weapon"]);
    data.data.owned.armors = this._checkNull(data.itemsByType["armor"]);
    data.data.owned.shields = this._checkNull(data.itemsByType["shield"]);
    data.data.owned.edges = this._checkNull(data.itemsByType["edge"]);
    data.data.owned.hindrances = this._checkNull(data.itemsByType["hindrance"]);
    data.data.owned.skills = this._checkNull(
      data.itemsByType["skill"]
    ).sort((a, b) => a.name.localeCompare(b.name));
    data.data.owned.powers = this._checkNull(data.itemsByType["power"]);

    //Checks if relevant arrays are not null and combines them into an inventory array
    data.data.owned.inventory = [
      ...data.data.owned.gear,
      ...data.data.owned.weapons,
      ...data.data.owned.armors,
      ...data.data.owned.shields,
    ];

    data.inventoryWeight = this._calcInventoryWeight(data.data.owned.inventory);
    data.maxCarryCapacity = this._calcMaxCarryCapacity(data);

    //Checks if an Actor has a Power Egde
    if (
      data.data.owned.edges &&
      data.data.owned.edges.find((edge) => edge.data.isArcaneBackground == true)
    ) {
      this.actor.setFlag("swade", "hasArcaneBackground", true);
    } else {
      this.actor.setFlag("swade", "hasArcaneBackground", false);
    }

    data.bennyPercetange = this._calcBennyPercentage(data.data.bennies);
    return data;
  }

  private _calcMaxCarryCapacity(data: any): number {
    const strengthDie = data.data.attributes.strength.die;
    let capacity = 0;

    if (strengthDie.sides === 4) {
      capacity = 20;
    }
    if (strengthDie.sides === 6) {
      capacity = 40;
    }
    if (strengthDie.sides === 8) {
      capacity = 60;
    }
    if (strengthDie.sides === 10) {
      capacity = 80;
    }
    if (strengthDie.sides === 12) {
      capacity = 100;
    }

    if (strengthDie.modifier > 0) {
      capacity = capacity + 20 * strengthDie.modifier;
    }

    return capacity;
  }

  private _calcInventoryWeight(items): number {
    let retVal = 0;

    items.forEach((i) => {
      retVal += i.data.weight * i.data.quantity;
    });
    return retVal;
  }

  private _calcBennyPercentage(bennies: any): number {
    const per = (bennies.value / bennies.max) * 100;
    return (per - 100) * -1;
  }

  private _checkNull(items: Item[]): any[] {
    if (items && items.length) {
      return items;
    }
    return [];
  }

  private _toggleEquipped(id: number, item: any): any {
    return {
      _id: id,
      data: {
        equipped: !item.data.data.equipped,
      },
    };
  }
}
