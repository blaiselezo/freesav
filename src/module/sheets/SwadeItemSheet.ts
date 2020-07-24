export default class SwadeItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 560,
      height: 'auto',
      classes: ['swade', 'sheet', 'item'],
      resizable: true,
    });
  }

  /**
   * Return a dynamic reference to the HTML template path used to render this Item Sheet
   * @return {string}
   */
  get template() {
    const path = 'systems/swade/templates/items';
    return `${path}/${this.item.data.type}.html`;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Delete Item from within Sheet. Only really used for Skills, Edges, Hindrances and Powers
    html.find('.item-delete').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemId = li.data('itemId');
      this.close();
      this.item.actor.deleteOwnedItem(itemId);
    });

    html.find('.profile-img').contextmenu((e) => {
      new ImagePopout(this.item.img, {
        title: this.item.name,
        shareable: true,
        entity: { type: 'Item', id: this.item.id },
      }).render(true);
    });
  }

  /**
   * Prepare item sheet data
   * Start with the base item data and extending with additional properties for rendering.
   */
  getData() {
    const data = super.getData();
    data.data.isOwned = this.item.isOwned;
    data.config = CONFIG.SWADE;
    const actor = this.item.actor;
    const ownerIsWildcard = actor && actor.data['data'].wildcard;
    if (ownerIsWildcard || !this.item.isOwned) {
      data.data.ownerIsWildcard = true;
    }

    // Check for enabled optional rules
    data['settingrules'] = {
      modSlots: game.settings.get('swade', 'vehicleMods'),
    };
    return data;
  }
}
