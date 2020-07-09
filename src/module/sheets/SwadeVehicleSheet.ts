import SwadeBaseActorSheet from './SwadeBaseActorSheet';
// eslint-disable-next-line no-unused-vars
import SwadeItem from '../entities/SwadeItem';

export default class SwadeVehicleSheet extends SwadeBaseActorSheet {
  /**
   * Extend and override the default options used by the Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['swade', 'sheet', 'actor', 'vehicle'],
      width: 600,
      height: 768,
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.sheet-body',
          initial: 'summary',
        },
      ],
    });
  }

  get template() {
    // Later you might want to return a different template
    // based on user permissions.
    return 'systems/swade/templates/actors/vehicle-sheet.html';
  }

  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    //Toggle collapsible
    html.find('.collapsible-header').click((ev) => {
      const container = $(ev.currentTarget).parents('.collapsible-container');
      const content = container.find('.collapsible-content');
      content.toggleClass('collapsed');
      if (content.hasClass('collapsed')) {
        content.slideUp();
      } else {
        content.slideDown();
      }
    });

    // Delete Item
    html.find('.item-delete').click(async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const ownedItem = this.actor.getOwnedItem(li.data('itemId'));
      const template = `
          <form>
            <div>
              <center>${game.i18n.localize('SWADE.Del')} 
                <strong>${ownedItem.name}</strong>?
              </center>
              <br>
            </div>
          </form>`;
      await Dialog.confirm({
        title: game.i18n.localize('SWADE.Del'),
        content: template,
        yes: async () => {
          await this.actor.deleteOwnedItem(ownedItem.id);
          li.slideUp(200, () => this.render(false));
        },
        no: () => {},
      });
    });

    // Add new cargo item
    html.find('.item-create').click((event) => {
      event.preventDefault();
      const header = event.currentTarget;
      let type = header.dataset.type;

      // item creation helper func
      let createItem = function (
        type: string,
        name: string = `New ${type.capitalize()}`,
      ): any {
        const itemData = {
          name: name ? name : `New ${type.capitalize()}`,
          type: type,
          data: duplicate(header.dataset),
        };
        delete itemData.data['type'];
        return itemData;
      };

      // Getting back to main logic
      if (type == 'choice') {
        this._chooseItemType().then((dialogInput: any) => {
          const itemData = createItem(dialogInput.type, dialogInput.name);
          this.actor.createOwnedItem(itemData, {});
        });
        return;
      } else {
        const itemData = createItem(type);
        this.actor.createOwnedItem(itemData, {});
      }
    });
  }

  getData(): ActorSheetData {
    let data: any = super.getData();

    data.config = CONFIG.SWADE;
    data.itemsByType = {};
    for (const item of data.items) {
      let list = data.itemsByType[item.type];
      if (!list) {
        list = [];
        data.itemsByType[item.type] = list;
      }
      list.push(item);
    }

    data.inventory = this._determineCargo(data.itemsByType).sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    data.inventoryWeight = 0;
    data.inventory.forEach((i: SwadeItem) => {
      data.inventoryWeight += i.data['weight'] * i.data['quantity'];
    });

    // Check for enabled optional rules
    data.settingrules = {
      vehicleEdges: game.settings.get('swade', 'vehicleEdges'),
      modSlots: game.settings.get('swade', 'vehicleMods'),
    };

    console.log(data);
    return data;
  }

  /**
   * Determines the cargo inventory of the vehicle, sorting out all the non-vehicular items
   * @param itemsByType an object with the items filtered by type
   */
  private _determineCargo(itemsByType) {
    return [
      ...this._checkNull(
        itemsByType['gear'].filter(
          (i) => !i.data.isVehicular || !i.data.equipped,
        ),
      ),
      ...this._checkNull(
        itemsByType['weapon'].filter(
          (i) => !i.data.isVehicular || !i.data.equipped,
        ),
      ),
      ...this._checkNull(itemsByType['armor']),
      ...this._checkNull(itemsByType['shield']),
    ];
  }
}
