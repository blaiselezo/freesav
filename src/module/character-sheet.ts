export class WildcardSheet extends ActorSheet {
  _sheetTab: string;
  data:any;

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
      classes: ['swade', 'sheet', 'wildcard'],
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

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.getOwnedItem(li.data('itemId'));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item');
      this.actor.deleteOwnedItem(li.data('itemId'));
      li.slideUp(200, () => this.render(false));
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
    this.data.data.skills = this.data.itemsByType['skill'];
    this.data.data.weapons = this.data.itemsByType['weapon'];
    console.log(this.data);
    return this.data;
  }
  
  calcToughness(data: ActorSheetData){

    let vigor = Number(this.data.data.attributes.vigor.value.substring(2));

    return (vigor/2)+2;
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
      classes: ['swade', 'sheet', 'extra'],
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