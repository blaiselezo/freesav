export class ExtraSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['swade', 'sheet', 'character'],
            width: 600,
            height: 768
        });
    }

    get template() {
        // Later you might want to return a different template
        // based on user permissions.
        return 'systems/swade/templates/actors/extra-sheet.html';
    }

    activateListeners(html): void {
        super.activateListeners(html);

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

        data.data.gear = data.itemsByType['gear'];
        data.data.weapons = data.itemsByType['weapon'];
        data.data.armors = data.itemsByType['armor'];
        data.data.shields = data.itemsByType['shield'];
        data.data.edges = data.itemsByType['edge'];
        data.data.hindrances = data.itemsByType['hindrance'];
        data.data.skills = data.itemsByType['skill'];
        data.data.powers = data.itemsByType['power'];

        //Checks if an Actor has a Power Egde
        if (data.data.edges && data.data.edges.find(edge => edge.data.isArcaneBackground == true)) {
            this.actor.setFlag('swade', 'hasArcaneBackground', true);
        } else {
            this.actor.setFlag('swade', 'hasArcaneBackground', false);
        }

        return data;
    }
}
