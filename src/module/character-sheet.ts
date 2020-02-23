export class WildcardSheet extends ActorSheet {
  _sheetTab: string;
  data: any;

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
  }

  getData() {
    this.data = super.getData();
    // Add any special data that your template needs here.

    //not sure yet wether to use this
    //this.data.data.stats.toughness.value = this.calcToughness(this.data);

    this.data.itemsByType = {};
    for (const item of this.data.items) {
      let list = this.data.itemsByType[item.type];
      if (!list) {
        list = [];
        this.data.itemsByType[item.type] = list;
      }
      list.push(item);
    }
    this.data.data.equipments = this.data.itemsByType['equipment'];
    this.data.data.valuables = this.data.itemsByType['valuable'];
    this.data.data.weapons = this.data.itemsByType['weapon'];
    this.data.data.armors = this.data.itemsByType['armor'];
    this.data.data.shields = this.data.itemsByType['shield'];
    this.data.data.edges = this.data.itemsByType['edge'];
    this.data.data.hindrances = this.data.itemsByType['hindrance'];
    this.data.data.skills = this.data.itemsByType['skill'];
    this.data.data.powers = this.data.itemsByType['power'];

    this.data.data.inventory = [];

    if (this.data.data.equipments !== undefined) {
      this.data.data.inventory = this.data.data.inventory.concat(this.data.data.equipments);
    }
    if (this.data.data.valuables !== undefined) {
      this.data.data.inventory = this.data.data.inventory.concat(this.data.data.valuables);
    }
    if (this.data.data.weapons !== undefined) {
      this.data.data.inventory = this.data.data.inventory.concat(this.data.data.weapons);
    }
    if (this.data.data.armors !== undefined) {
      this.data.data.inventory = this.data.data.inventory.concat(this.data.data.armors);
    }
    if (this.data.data.shields !== undefined) {
      this.data.data.inventory = this.data.data.inventory.concat(this.data.data.shields);
    }

    //Sort Inventory items alphabetically
    this.data.data.inventory.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

    return this.data;
  }

  calcToughness(data: ActorSheetData) {

    let vigor = Number(this.data.data.attributes.vigor.value.substring(2));

    return (vigor / 2) + 2;
  }

  determineRank(xp: number): String {
    let retVal: String

    if (xp <= 19) {
      retVal = 'Novice';
    } else if (xp >= 20 && xp <= 39) {
      retVal = 'Seasoned';
    } else if (xp >= 40 && xp < 59) {
      retVal = 'Veteran';
    } else if (xp >= 60 && xp <= 79) {
      retVal = 'Heroic';
    } else if (xp >= 80) {
      retVal = 'Legendary';
    }
    return retVal;
  }

}

export class ExtraSheet extends ActorSheet {

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
    return 'systems/swade/templates/actors/extra-sheet.html';
  }

  activateListeners(html) {
    super.activateListeners(html);
    // This is called once your template has rendered.
    // You have access to the newly-rendered HTML and can
    // add event listeners here.
  }

  getData() {
    const data = super.getData();
    // Add any special data that your template needs here.
    return data;
  }
}