// eslint-disable-next-line no-unused-vars
import { SwadeActor } from './entity';
// eslint-disable-next-line no-unused-vars
import { SwadeItem } from './item-entity';

export class SwadeNPCSheet extends ActorSheet {


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['swade', 'sheet', 'actor', 'npc'],
            width: 600,
            height: 'auto',
            tabs: [{ navSelector: '.tabs', contentSelector: '.sheet-body', initial: 'summary' }]
        });
    }

    get template() {
        // Later you might want to return a different template
        // based on user permissions.
        if (!game.user.isGM && this.actor.limited) return 'systems/swade/templates/actors/limited-sheet.html';
        return 'systems/swade/templates/actors/npc-sheet.html';
    }

    async _chooseItemType() {
        const types = [
          'weapon',
          'armor',
          'shield',
          'gear'
        ];
        let templateData = {upper: '', lower: '', types: types},
            dlg = await renderTemplate('templates/sidebar/entity-create.html', templateData);
        //Create Dialog window
        return new Promise(resolve => {
          new Dialog({
            title: '',
            content: dlg,
            buttons: {
              ok: {
                label: game.i18n.localize('SWADE.Ok'),
                icon: '<i class="fas fa-check"></i>',
                callback: (html: JQuery) => {
                  resolve({type: html.find('select[name="type"]').val(), name: html.find('input[name="name"]').val()});
                }
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

    activateListeners(html: JQuery): void {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Update Item via reigh-click
        html.find('.contextmenu-edit').contextmenu(ev => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.getOwnedItem(li.data('itemId'));
            item.sheet.render(true);
        });

        // Update Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents('.item');
            const item = this.actor.getOwnedItem(li.data('itemId'));
            item.sheet.render(true);
        });

        // Delete Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents('.item');
            this.actor.deleteOwnedItem(li.data('itemId'));
            li.slideUp(200, () => this.render(false));
        });

        // Filter power list
        html.find('.power-filter').change((ev: any) => {
            const arcane = ev.target.value;
            html.find('.power').each( (id: number, pow: any) => {
              if (pow.dataset.arcane == arcane) {
                pow.style = '';
              } else {
                pow.style = 'display:none;';
              }
            })
        })

        //Add Benny
        html.find('.benny-add').click(() => {
            const currentBennies: any = html.find('.bennies-current').val();
            const newBennies = parseInt(currentBennies) + 1;
            this.actor.update({ 'data.bennies.value': newBennies });
        });

        //Remove Benny
        html.find('.benny-subtract').click(() => {
            const currentBennies: any = html.find('.bennies-current').val();
            const newBennies = parseInt(currentBennies) - 1;
            if (newBennies >= 0) {
                this.actor.update({ 'data.bennies.value': newBennies });
            }
        });

        //Toggle Conviction
        html.find('.convction-toggle').click(() => {
            if (!this.actor.getFlag('swade', 'convictionReady')) {
                this.actor.setFlag('swade', 'convictionReady', true);
            } else {
                //roll conviction
                this.actor.setFlag('swade', 'convictionReady', false);
            }
        });

        //Configre initiative Edges/Hindrances
        html.find('#initConfigButton').click(() => {
            let actorObject = this.actor as SwadeActor;
            actorObject.configureInitiative();
        });

        // Roll attribute
        html.find('.attribute-label a').click((event: any) => {
            let actorObject = this.actor as SwadeActor;
            let element = event.currentTarget as Element;
            let attribute = element.parentElement.parentElement.dataset.attribute;
            actorObject.rollAttribute(attribute, { event: event });
        });

        // Roll Skill
        html.find('.skill.item a').click(event => {
            let actorObject = this.actor as SwadeActor;
            let element = event.currentTarget as Element;
            let item = element.parentElement.dataset.itemId;
            actorObject.rollSkill(item, { event: event });
        });

        // Roll Damage
        html.find('.damage-roll').click((event) => {
            let element = event.currentTarget as Element;
            let itemId =
                element.parentElement.parentElement.parentElement.dataset.itemId;
            const item = this.actor.getOwnedItem(itemId) as SwadeItem;
            return item.rollDamage();
            // actorObject.rollSkill(item, {event: event});
        });

        // Add new object
        html.find('.item-create').click((event) => {
          event.preventDefault();
          const header = event.currentTarget;
          let type = header.dataset.type;
        
          // item creation helper func
          let createItem = function (type: string, name: string = `New ${type.capitalize()}`) : any {
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
                this.actor.createOwnedItem(itemData);
              });
              return;
          } else { 
            const itemData = createItem(type);
            this.actor.createOwnedItem(itemData);
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
        data.data.owned.skills = this._checkNull(data.itemsByType['skill']).sort((a, b) => a.name.localeCompare(b.name));
        data.data.owned.powers = this._checkNull(data.itemsByType['power']);

        data.arcanes = [];
        data.itemsByType['power'].forEach((pow: any) => {
          if (!pow.data.arcane) {pow.data.arcane = game.i18n.localize('SWADE.Default');}
          if (!data.arcanes.find((el: string) => el == pow.data.arcane)) {
            data.arcanes.push(pow.data.arcane);
        }})

        //Checks if an Actor has a Power Egde
        if (data.data.owned.edges && data.data.owned.edges.find(edge => edge.data.isArcaneBackground == true)) {
            this.actor.setFlag('swade', 'hasArcaneBackground', true);
        } else {
            this.actor.setFlag('swade', 'hasArcaneBackground', false);
        }
        // Check for enabled optional rules
        this.actor.setFlag('swade', 'enableConviction', game.settings.get('swade', 'enableConviction') && data.data.wildcard);

        data.config = CONFIG.SWADE;
        return data;
    }

    private _checkNull(items: Item[]): any[] {
        if (items && items.length) {
            return items;
        }
        return [];
    }
}
