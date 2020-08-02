import SwadeEntityTweaks from '../dialog/entity-tweaks';
import SwadeItem from '../entities/SwadeItem';

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

  /**
   * Extend and override the sheet header buttons
   * @override
   */
  protected _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.owner;
    if (this.options.editable && canConfigure) {
      buttons = [
        {
          label: 'Tweaks',
          class: 'configure-actor',
          icon: 'fas fa-dice',
          onclick: (ev) => this._onConfigureEntity(ev),
        },
      ].concat(buttons);
    }
    return buttons;
  }

  protected _onConfigureEntity(event: Event) {
    event.preventDefault();
    new SwadeEntityTweaks(this.item as SwadeItem, {
      top: this.position.top + 40,
      left: this.position.left + ((this.position.height as number) - 400) / 2,
    }).render(true);
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
