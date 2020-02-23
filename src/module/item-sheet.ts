
export class SwadeItemSheet extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 560,
      height: 420,
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
    // This is called once your template has rendered.
    // You have access to the newly-rendered HTML and can
    // add event listeners here.


    // Delete Item from within Sheet. Only really used for skills Edges and Hindrances
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.sheet-body');
      if (this.item.actor) {
        this.item.actor.deleteOwnedItem(li.data('itemId'));
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
    // Add any special data that your template needs here.
    return data;
  }
}