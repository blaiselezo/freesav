export class WildcardSheet extends ActorSheet {
  _sheetTab: string;

  constructor(...args) {
    super(...args);

    /**
     * Keep track of the currently active sheet tab
     * @type {string}
     */
    this._sheetTab = "description";
  }

  get template() {
    // Later you might want to return a different template
    // based on user permissions.
    return 'systems/swade/templates/wildcard-sheet.html';
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
      callback: clicked => this._sheetTab = clicked.data("tab")
    });
  }

  getData() {
    const data = super.getData();
    // Add any special data that your template needs here.
  
    return data;
  }

  determineRank(xp: number): String {
    let retVal: String

    if (xp <= 19) {
      retVal = "Novice";
    } else if (xp >= 20 && xp <= 39) {
      retVal = "Seasoned";
    } else if (xp >= 40 && xp < 59) {
      retVal = "Veteran";
    } else if (xp >= 60 && xp <= 79) {
      retVal = "Heroic";
    } else if (xp >= 80) {
      retVal = "Legendary";
    }
    return retVal;
  }

}

export class ExtraSheet extends ActorSheet {
  get template() {
    // Later you might want to return a different template
    // based on user permissions.
    return 'systems/swade/templates/extra-sheet.html';
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