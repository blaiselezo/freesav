export class SwadeNPCSheet extends ActorSheet {
    _sheetTab: string;

    constructor(...args) {
        super(...args);

        /**
         * Keep track of the currently active sheet tab
         * @type {string}
         */
        this._sheetTab = 'summary';
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['swade', 'sheet', 'npc'],
            width: 600,
            height: 'auto'
        });
    }

    get template() {
        // Later you might want to return a different template
        // based on user permissions.
        return 'systems/swade/templates/actors/npc-sheet.html';
    }

    activateListeners(html): void {
        super.activateListeners(html);

        // Activate tabs
        let tabs = html.find('.tabs');
        let initial = this._sheetTab;
        new Tabs(tabs, {
            initial: initial,
            callback: clicked => this._sheetTab = clicked.data('tab')
        });

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

        //Add Benny
        html.find('.benny-add').click(ev => {
            const currentBennies: any = html.find('.bennies-current').val();
            const newBennies = parseInt(currentBennies) + 1;
            this.actor.update({ "data.bennies.value": newBennies });
        });

        //Remove Benny
        html.find('.benny-subtract').click(ev => {
            const currentBennies: any = html.find('.bennies-current').val();
            const newBennies = parseInt(currentBennies) - 1;
            if (newBennies >= 0) {
                this.actor.update({ "data.bennies.value": newBennies });
            }
        });

        //Toggle Conviction
        html.find('.convction-toggle').click(ev => {
            if (!this.actor.getFlag('swade', 'convictionReady')) {
                this.actor.setFlag('swade', 'convictionReady', true);
            } else {
                //roll conviction
                this.actor.setFlag('swade', 'convictionReady', false);
            }
        });
    }

    getData() {
        let data: any = super.getData();

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
        data.data.owned.skills = this._checkNull(data.itemsByType['skill']).sort((a, b) => a.name.localeCompare(b.name));;
        data.data.owned.powers = this._checkNull(data.itemsByType['power']);

        //Checks if an Actor has a Power Egde
        if (data.data.owned.edges && data.data.owned.edges.find(edge => edge.data.isArcaneBackground == true)) {
            this.actor.setFlag('swade', 'hasArcaneBackground', true);
        } else {
            this.actor.setFlag('swade', 'hasArcaneBackground', false);
        }

        return data;
    }

    private _checkNull(items: Item[]): any[] {
        if (items && items.length) {
            return items;
        }
        return [];
    }
}