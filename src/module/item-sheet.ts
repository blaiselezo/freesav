export class SwadeItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 560,
      height: "auto",
      classes: ["swade", "sheet", "item"],
      resizable: false
    });
  }

  /**
   * Return a dynamic reference to the HTML template path used to render this Item Sheet
   * @return {string}
   */
  get template() {
    const path = "systems/swade/templates/items";
    return `${path}/${this.item.data.type}.html`;
  }

  activateListeners(html) {
    super.activateListeners(html);


    // Delete Item from within Sheet. Only really used for Skills, Edges, Hindrances and Powers
    html.find('.item-delete').click(ev => {
      const item = $(ev.currentTarget).parents('.item');
      if (this.item.actor) {
        this.item.actor.deleteOwnedItem(item.data('itemId'));
        this.item.sheet.close();
      }
    });
  }

  /**
  * Prepare item sheet data
  * Start with the base item data and extending with additional properties for rendering.
  */
  getData() {
    const data = super.getData();
    data.data.isOwned = this.item.isOwned;

    const actor = this.item.actor;
    const ownerIsWildcard = actor && (actor.data.type === "character" || (actor.data.type === "npc" && actor.getFlag('swade', 'isWildcard')));
    if (ownerIsWildcard || !this.item.isOwned) {
      data.data.ownerIsWildcard = true;
    }
    return data;
  }
}