// eslint-disable-next-line no-unused-vars
import SwadeActor from '../entities/SwadeActor';
// eslint-disable-next-line no-unused-vars
import SwadeItem from '../entities/SwadeItem';
import SwadeBaseActorSheet from './SwadeBaseActorSheet';

export default class SwadeCharacterSheet extends SwadeBaseActorSheet {
  /**
   * Extend and override the default options used by the Actor Sheet
   * @returns {Object}
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['swade', 'sheet', 'actor', 'character'],
      width: 600,
      height: 768,
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.sheet-body',
          initial: 'summary',
        },
      ],
      scrollY: [
        '.skills .skills-list',
        '.quickaccess-list',
        '.inventory .inventory-categories',
      ],
      activeArcane: 'All',
    });
  }

  _createEditor(target, editorOptions, initialContent) {
    // remove some controls to the editor as the space is lacking
    if (target == 'data.advances.details') {
      editorOptions.toolbar = 'styleselect bullist hr table removeFormat save';
    }
    super._createEditor(target, editorOptions, initialContent);
  }

  get template() {
    // Later you might want to return a different template
    // based on user permissions.
    return 'systems/swade/templates/actors/character-sheet.html';
  }

  // Override to set resizable initial size
  async _renderInner(...args: any[]) {
    const html = await super._renderInner(...args);
    this.form = html[0];

    // Resize resizable classes
    let resizable = (html as JQuery).find('.resizable');
    resizable.each((_, el) => {
      let heightDelta =
        (this.position.height as number) - (this.options.height as number);
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });

    // Filter power list
    const arcane = !this.options.activeArcane
      ? 'All'
      : this.options.activeArcane;
    (html as JQuery).find('.arcane-tabs .arcane').removeClass('active');
    (html as JQuery).find(`[data-arcane='${arcane}']`).addClass('active');
    this._filterPowers(html as JQuery, arcane);
    return html;
  }

  _filterPowers(html: JQuery, arcane: string) {
    this.options.activeArcane = arcane;
    // Show, hide powers
    html.find('.power').each((id: number, pow: any) => {
      if (pow.dataset.arcane == arcane || arcane == 'All') {
        pow.classList.add('active');
      } else {
        pow.classList.remove('active');
      }
    });
    // Show, Hide powerpoints
    html.find('.power-counter').each((id: number, ct: any) => {
      if (ct.dataset.arcane == arcane) {
        ct.classList.add('active');
      } else {
        ct.classList.remove('active');
      }
    });
  }

  activateListeners(html: JQuery<HTMLElement>) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = (ev) => this._onDragItemStart(ev);
      // Find all items on the character sheet.
      html.find('li.item.skill').each((i, li) => {
        // Add draggable attribute and dragstart listener.
        li.setAttribute('draggable', 'true');
        li.addEventListener('dragstart', handler, false);
      });
      html.find('li.item.weapon').each((i, li) => {
        // Add draggable attribute and dragstart listener.
        li.setAttribute('draggable', 'true');
        li.addEventListener('dragstart', handler, false);
      });
    }

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

    //Show Description of an Edge/Hindrance
    html.find('.edge').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item: any = this.actor.getOwnedItem(li.data('itemId')).data;
      html.find('#edge-description')[0].innerHTML = TextEditor.enrichHTML(
        item.data.description,
        {},
      );
    });

    //Toggle Equipment
    html.find('.item-toggle').click(async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.getOwnedItem(li.data('itemId')) as SwadeItem;
      await this.actor.updateOwnedItem(
        this._toggleEquipped(li.data('itemId'), item),
      );
    });

    //Toggle Equipmnent Card collapsible
    html.find('.gear-card .card-header').click((ev) => {
      const card = $(ev.currentTarget).parents('.gear-card');
      const content = card.find('.card-content');
      content.toggleClass('collapsed');
      if (content.hasClass('collapsed')) {
        content.slideUp();
      } else {
        content.slideDown();
      }
    });

    // Filter power list
    html.find('.arcane-tabs .arcane').click((ev: any) => {
      const arcane = ev.currentTarget.dataset.arcane;
      html.find('.arcane-tabs .arcane').removeClass('active');
      ev.currentTarget.classList.add('active');
      this._filterPowers(html, arcane);
    });

    //Input Synchronization
    html.find('.wound-input').keyup((ev) => {
      html.find('.wound-slider').val($(ev.currentTarget).val());
    });

    html.find('.wound-slider').change((ev) => {
      html.find('.wound-input').val($(ev.currentTarget).val());
    });

    html.find('.fatigue-input').keyup((ev) => {
      html.find('.fatigue-slider').val($(ev.currentTarget).val());
    });

    html.find('.fatigue-slider').change((ev) => {
      html.find('.fatigue-input').val($(ev.currentTarget).val());
    });

    // Roll Skill
    html.find('.skill-label a').click((event) => {
      let actorObject = this.actor as SwadeActor;
      let element = event.currentTarget as Element;
      let item = element.parentElement.parentElement.dataset.itemId;
      actorObject.rollSkill(item, { event: event });
    });

    // Add new object
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
        const choices = header.dataset.choices.split(',');
        this._chooseItemType(choices).then((dialogInput: any) => {
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

    data.data.owned.gear = this._checkNull(data.itemsByType['gear']);
    data.data.owned.weapons = this._checkNull(data.itemsByType['weapon']);
    data.data.owned.armors = this._checkNull(data.itemsByType['armor']);
    data.data.owned.shields = this._checkNull(data.itemsByType['shield']);
    data.data.owned.edges = this._checkNull(data.itemsByType['edge']);
    data.data.owned.hindrances = this._checkNull(data.itemsByType['hindrance']);
    data.data.owned.skills = this._checkNull(
      data.itemsByType['skill'],
    ).sort((a, b) => a.name.localeCompare(b.name));
    data.data.owned.powers = this._checkNull(data.itemsByType['power']);

    // Display the current active arcane
    data.activeArcane = this.options.activeArcane;
    data.arcanes = [];
    const powers = data.itemsByType['power'];
    if (powers) {
      powers.forEach((pow: any) => {
        if (!pow.data.arcane) return;
        if (
          data.arcanes.find((el: string) => el == pow.data.arcane) === undefined
        ) {
          data.arcanes.push(pow.data.arcane);
          // Add powerpoints data relevant to the detected arcane
          if (data.data.powerPoints[pow.data.arcane] === undefined) {
            data.data.powerPoints[pow.data.arcane] = { value: 0, max: 0 };
          }
        }
      });
    }

    const shields = data.itemsByType['shield'];
    data.parry = 0;
    if (shields) {
      shields.forEach((shield: any) => {
        if (shield.data.equipped) {
          data.parry += shield.data.parry;
        }
      });
    }

    data.armor = this.actor.calcArmor();

    //Checks if relevant arrays are not null and combines them into an inventory array
    data.data.owned.inventory = {
      gear: data.data.owned.gear,
      weapons: data.data.owned.weapons,
      armors: data.data.owned.armors,
      shields: data.data.owned.shields,
    };

    data.inventoryWeight = this._calcInventoryWeight(
      Object.values(data.data.owned.inventory),
    );
    data.maxCarryCapacity = this._calcMaxCarryCapacity(data);

    //Checks if an Actor has a Power Egde
    if (
      data.data.owned.edges &&
      data.data.owned.edges.find((edge) => edge.data.isArcaneBackground == true)
    ) {
      this.actor.setFlag('swade', 'hasArcaneBackground', true);
      data.data.hasArcaneBackground = true;
    } else {
      this.actor.setFlag('swade', 'hasArcaneBackground', false);
      data.data.hasArcaneBackground = false;
    }

    // Check for enabled optional rules
    data.data.settingrules = {
      conviction: game.settings.get('swade', 'enableConviction'),
    };
    return data;
  }

  private _calcMaxCarryCapacity(data: any): number {
    const strengthDie = data.data.attributes.strength.die;
    let capacity = 20 + 10 * (strengthDie.sides - 4);

    if (strengthDie.modifier > 0) {
      capacity = capacity + 20 * strengthDie.modifier;
    }

    return capacity;
  }

  private _calcInventoryWeight(items): number {
    let retVal = 0;
    items.forEach((category: any) => {
      category.forEach((i: any) => {
        retVal += i.data.weight * i.data.quantity;
      });
    });
    return retVal;
  }

  private _toggleEquipped(id: string, item: any): any {
    return {
      _id: id,
      data: {
        equipped: !item.data.data.equipped,
      },
    };
  }
}
