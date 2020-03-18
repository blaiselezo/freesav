export class WildcardSheet extends ActorSheet {
  _sheetTab: string;

  constructor(...args) {
    super(...args);

    /**
     * Keep track of the currently active sheet tab
     * @type {string}
     */
    this._sheetTab = 'summary';
  }

  /* -------------------------------------------- */

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['swade', 'sheet', 'character'],
      width: 600,
      height: 768
    });
  }

  get template() {
    // Later you might want to return a different template
    // based on user permissions.
    return 'systems/swade/templates/actors/wildcard-sheet.html';
  }

  activateListeners(html) {
    super.activateListeners(html);
    // This is called once your template has rendered.
    // You have access to the newly-rendered HTML and can
    // add event listeners here.

    // Activate tabs
    let tabs = html.find('.tabs');
    let initial = this._sheetTab;
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this._sheetTab = clicked.data('tab')
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.getOwnedItem(li.data('itemId'));
      item.sheet.render(true);
    });

    // Delete Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      this.actor.deleteOwnedItem(li.data('itemId'));
      li.slideUp(200, () => this.render(false));
    });

    //Show Description of an Edge/Hindrance
    html.find('.edge').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item: any = this.actor.getOwnedItem(li.data('itemId')).data;
      document.getElementById('edge-description').innerHTML = item.data.description;
    });

    html.find('.item-equipped').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item: any = this.actor.getOwnedItem(li.data('itemId'));
      this.actor.updateOwnedItem(this._toggleEquipped(li.data('itemId'), item));
    });
  }

  getData(): ActorSheetData {
    let data: any = super.getData();
    // Add any special data that your template needs here.

    //not sure yet wether to use this
    //data.data.stats.toughness.value = this.calcToughness(data);

    data.itemsByType = {};
    for (const item of data.items) {
      let list = data.itemsByType[item.type];
      if (!list) {
        list = [];
        data.itemsByType[item.type] = list;
      }
      list.push(item);
    }

    data.data.gear = data.itemsByType['gear'];
    data.data.weapons = data.itemsByType['weapon'];
    data.data.armors = data.itemsByType['armor'];
    data.data.shields = data.itemsByType['shield'];
    data.data.edges = data.itemsByType['edge'];
    data.data.hindrances = data.itemsByType['hindrance'];
    data.data.skills = data.itemsByType['skill'];
    data.data.powers = data.itemsByType['power'];

    //Checks if relevant arrays are not null and combines them into an inventory array
    data.data.inventory = [...this._checkNull(data.data.gear),
    ...this._checkNull(data.data.weapons),
    ...this._checkNull(data.data.armors),
    ...this._checkNull(data.data.shields)];

    data.inventoryWeight = this._calcInventoryWeight(data.data.inventory);
    data.maxCarryCapacity = this._calcMaxCarryCapacity(data);

    //Checks if an Actor has a Power Egde
    if (data.data.edges && data.data.edges.find(edge => edge.data.isArcaneBackground == true)) {
      this.actor.setFlag('swade', 'hasArcaneBackground', true);
    } else {
      this.actor.setFlag('swade', 'hasArcaneBackground', false);
    }
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
      capacity = capacity + (20 * strengthDie.modifier);
    }

    return capacity;

  }

  private _calcInventoryWeight(items): number {
    let retVal = 0;

    items.forEach(i => {
      retVal += i.data.weight * i.data.quantity;
    });
    return retVal;
  }

  private _sortInventoryByName(inventory: Item[]): Item[] {
    return inventory.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
        equipped: !item.data.data.equipped
      }
    }
  }

}
