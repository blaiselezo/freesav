import SwadeEntityTweaks from '../dialog/entity-tweaks';
import SwadeItem from '../entities/SwadeItem';
import { ItemType } from '../enums/ItemTypeEnum';

/**
 * @noInheritDoc
 */
export default class SwadeItemSheet extends ItemSheet {
  get item(): SwadeItem {
    return super.item as SwadeItem;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 560,
      height: 'auto',
      classes: ['swade', 'sheet', 'item'],
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.sheet-body',
          initial: 'summary',
        },
      ],
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
    const canConfigure = game.user.isGM || this.item.owner;
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
    html.find('.item-delete').on('click', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const itemId = li.data('itemId');
      this.close();
      this.item.actor.deleteOwnedItem(itemId);
    });

    html.find('.profile-img').on('contextmenu', () => {
      new ImagePopout(this.item.img, {
        title: this.item.name,
        shareable: true,
        entity: { type: 'Item', id: this.item.id },
      }).render(true);
    });

    html.find('.action-create').on('click', () => {
      this.item.update(
        {
          _id: this.item._id,
          ['data.actions.additional.'.concat(randomID())]: {
            name: 'New Action',
            type: 'skill',
          },
        },
        {},
      );
    });
    html.find('.action-delete').on('click', (ev) => {
      const key = ev.currentTarget.dataset.actionKey;
      this.item.update(
        {
          _id: this.item._id,
          'data.actions.additional': {
            [`-=${key}`]: null,
          },
        },
        {},
      );
    });
  }

  /**
   * Prepare item sheet data
   * Start with the base item data and extending with additional properties for rendering.
   */
  getData() {
    let data: any = super.getData();
    data.data.isOwned = this.item.isOwned;
    data.config = CONFIG.SWADE;
    const actor = this.item.actor;
    const ownerIsWildcard = actor && actor.data['data'].wildcard;
    if (ownerIsWildcard || !this.item.isOwned) {
      data.data.ownerIsWildcard = true;
    }
    let additionalStats = data.data.additionalStats || {};
    for (let attr of Object.values(additionalStats)) {
      attr['isCheckbox'] = attr['dtype'] === 'Boolean';
    }
    data.hasAdditionalStatsFields = Object.keys(additionalStats).length > 0;

    // Check for enabled optional rules
    data['settingrules'] = {
      modSlots: game.settings.get('swade', 'vehicleMods'),
    };

    data['displayTabs'] = [
      ItemType.Weapon.toString(),
      ItemType.Power.toString(),
    ].includes(this.item.type);
    return data;
  }
}
