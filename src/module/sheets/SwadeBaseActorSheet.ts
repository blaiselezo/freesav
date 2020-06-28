// eslint-disable-next-line no-unused-vars
import { SwadeActor } from '../entities/SwadeActor';
// eslint-disable-next-line no-unused-vars
import { SwadeItem } from '../entities/SwadeItem';
import { SwadeEntityTweaks } from '../dialog/entity-tweaks';
import * as chat from '../chat';

export class SwadeBaseActorSheet extends ActorSheet {
  actor: SwadeActor;

  activateListeners(html: JQuery): void {
    super.activateListeners(html);

    // Update Item
    html.find('.item-edit').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.getOwnedItem(li.data('itemId'));
      item.sheet.render(true);
    });

    // Edit armor modifier
    html.find('.armor-value').click((ev) => {
      var target = ev.currentTarget.id == 'parry-value' ? 'parry' : 'toughness';
      this._modifyDefense(target);
    });

    // Roll attribute
    html.find('.attribute-label a').click((event) => {
      let element = event.currentTarget as Element;
      let attribute = element.parentElement.parentElement.dataset.attribute;
      this.actor.rollAttribute(attribute, { event: event });
    });

    // Roll Damage
    html.find('.damage-roll').click((event) => {
      let element = event.currentTarget as Element;
      let itemId = $(element).parents('[data-item-id]').attr('data-item-id');
      const item = this.actor.getOwnedItem(itemId) as SwadeItem;
      return item.rollDamage();
    });

    //Add Benny
    html.find('.benny-add').click(() => {
      this.actor.getBenny();
    });

    //Remove Benny
    html.find('.benny-subtract').click(() => {
      this.actor.spendBenny();
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
          onclick: (ev) => this._onConfigureActor(ev),
        },
      ].concat(buttons);
    }
    return buttons;
  }

  protected _onConfigureActor(event: Event) {
    event.preventDefault();
    new SwadeEntityTweaks(this.actor, {
      top: this.position.top + 40,
      left: this.position.left + (this.position.width - 400) / 2,
    }).render(true);
  }

  protected async _chooseItemType(
    choices = ['weapon', 'armor', 'shield', 'gear'],
  ) {
    let templateData = { upper: '', lower: '', types: choices },
      dlg = await renderTemplate(
        'templates/sidebar/entity-create.html',
        templateData,
      );
    //Create Dialog window
    return new Promise((resolve) => {
      new Dialog({
        title: '',
        content: dlg,
        buttons: {
          ok: {
            label: game.i18n.localize('SWADE.Ok'),
            icon: '<i class="fas fa-check"></i>',
            callback: (html: JQuery) => {
              resolve({
                type: html.find('select[name="type"]').val(),
                name: html.find('input[name="name"]').val(),
              });
            },
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize('SWADE.Cancel'),
          },
        },
        default: 'ok',
      }).render(true);
    });
  }

  protected _checkNull(items: Item[]): Item[] {
    if (items && items.length) {
      return items;
    }
    return [];
  }

  protected async _onResize(event: any) {
    super._onResize(event);
    let html = $(event.path);
    let resizable = html.find('.resizable');
    resizable.each((_, el) => {
      let heightDelta = this.position.height - (this.options.height as number);
      el.style.height = `${heightDelta + parseInt(el.dataset.baseSize)}px`;
    });
  }

  protected _modifyDefense(target: string) {
    const targetLabel =
      target == 'parry'
        ? game.i18n.localize('SWADE.Parry')
        : game.i18n.localize('SWADE.Tough');
    const template = `
      <form><div class="form-group">
        <label>${game.i18n.localize('SWADE.Mod')}</label> 
        <input name="modifier" value="${
          this.actor.data.data.stats[target].modifier
        }" placeholder="0" type="text"/>
      </div></form>`;
    new Dialog({
      title: `${game.i18n.localize('SWADE.Ed')} ${
        this.actor.name
      } ${targetLabel} ${game.i18n.localize('SWADE.Mod')}`,
      content: template,
      buttons: {
        set: {
          icon: '<i class="fas fa-shield"></i>',
          label: game.i18n.localize('SWADE.Ok'),
          callback: (html: JQuery) => {
            let mod = html.find('input[name="modifier"]').val();
            let newData = {};
            newData[`data.stats.${target}.modifier`] = parseInt(mod as string);
            this.actor.update(newData);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('SWADE.Cancel'),
        },
      },
      default: 'set',
    }).render(true);
  }
}
