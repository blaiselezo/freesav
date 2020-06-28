// eslint-disable-next-line no-unused-vars
import { SwadeActor } from '../entities/SwadeActor';
import * as chat from '../chat';
import { SwadeBaseActorSheet } from './SwadeBaseActorSheet';

export class SwadeNPCSheet extends SwadeBaseActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['swade', 'sheet', 'actor', 'npc'],
      width: 600,
      height: 600,
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
    if (!game.user.isGM && this.actor.limited)
      return 'systems/swade/templates/actors/limited-sheet.html';
    return 'systems/swade/templates/actors/npc-sheet.html';
  }

  _createEditor(target, editorOptions, initialContent) {
    // remove some controls to the editor as the space is lacking
    editorOptions.toolbar = 'styleselect bullist hr table removeFormat save';
    super._createEditor(target, editorOptions, initialContent);
  }

  // Override to set resizable initial size
  async _renderInner(...args: any[]) {
    const html = await super._renderInner(...args);
    this.form = html[0];

    // Resize resizable classes
    let resizable = (html as JQuery).find('.resizable');
    resizable.each((_, el) => {
      let heightDelta = this.position.height - (this.options.height as number);
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });
    return html;
  }

  activateListeners(html: JQuery): void {
    super.activateListeners(html);

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = (ev) => this._onDragItemStart(ev);
      // Find all items on the character sheet.
      html.find('span.item.skill').each((i, li) => {
        // Add draggable attribute and dragstart listener.
        li.setAttribute('draggable', 'true');
        li.addEventListener('dragstart', handler, false);
      });
      html.find('div.item.weapon').each((i, li) => {
        // Add draggable attribute and dragstart listener.
        li.setAttribute('draggable', 'true');
        li.addEventListener('dragstart', handler, false);
      });
    }

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Item via reigh-click
    html.find('.contextmenu-edit').contextmenu((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.getOwnedItem(li.data('itemId'));
      item.sheet.render(true);
    });

    // Delete Item
    html.find('.item-delete').click((ev) => {
      const li = $(ev.currentTarget).parents('.gear-card');
      this.actor.deleteOwnedItem(li.data('itemId'));
      li.slideUp(200, () => this.render(false));
    });

    // Roll Skill
    html.find('.skill.item a').click((event) => {
      let actorObject = this.actor as SwadeActor;
      let element = event.currentTarget as Element;
      let item = element.parentElement.dataset.itemId;
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

    //Toggle Equipmnent Card collapsible
    html.find('.gear-card .card-header .item-name').click((ev) => {
      const card = $(ev.currentTarget).parents('.gear-card');
      const content = card.find('.card-content');
      content.toggleClass('collapsed');
      if (content.hasClass('collapsed')) {
        content.slideUp();
      } else {
        content.slideDown();
      }
    });

    //Toggle Conviction
    html.find('.conviction-toggle').click(async () => {
      const current = this.actor.data.data['details']['conviction'][
        'value'
      ] as number;
      const active = this.actor.data.data['details']['conviction'][
        'active'
      ] as boolean;
      if (current > 0 && !active) {
        await this.actor.update({
          'data.details.conviction.value': current - 1,
          'data.details.conviction.active': true,
        });
        ChatMessage.create({
          speaker: {
            actor: this.actor,
            alias: this.actor.name,
          },
          content: game.i18n.localize('SWADE ConvictionActivate'),
        });
      } else {
        await this.actor.update({
          'data.details.conviction.active': false,
        });
        chat.createConvictionEndMessage(this.actor as SwadeActor);
      }
    });
  }

  getData() {
    let data: any = super.getData();

    // Everything below here is only needed if user is not limited
    if (this.actor.limited) return data;

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

    data.armor = (this.actor as SwadeActor).calcArmor();

    const shields = data.itemsByType['shield'];
    data.parry = 0;
    if (shields) {
      shields.forEach((shield: any) => {
        if (shield.data.equipped) {
          data.parry += shield.data.parry;
        }
      });
    }
    //Checks if an Actor has a Power Egde
    if (
      data.data.owned.edges &&
      data.data.owned.edges.find((edge) => edge.data.isArcaneBackground == true)
    ) {
      this.actor.setFlag('swade', 'hasArcaneBackground', true);
    } else {
      this.actor.setFlag('swade', 'hasArcaneBackground', false);
    }

    // Check for enabled optional rules
    data.data.settingrules = {
      conviction:
        game.settings.get('swade', 'enableConviction') && data.data.wildcard,
    };
    data.config = CONFIG.SWADE;
    return data;
  }
}
