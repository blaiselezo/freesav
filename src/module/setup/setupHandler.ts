import { createActionCardTable } from '../util'

export class SwadeSetup {

    static async setup(): Promise<void> {

        let packChoices = {}
        game.packs.filter(p => p.entity === 'JournalEntry').forEach(p => {
            packChoices[p.collection] = p.metadata.label;
        })
        //CONFIG.SWADE.packChoices = packChoices;

        game.settings.register('swade', 'cardDeck', {
            name: 'Card Deck to use for Initiative',
            scope: 'world',
            type: String,
            config: true,
            default: CONFIG.SWADE.init.cardCompendium,
            choices: packChoices,
            onChange: (choice) => {
                console.log(`Repopulating action cards Table with cards from deck ${choice}`);
                createActionCardTable(true, choice).then(ui.notifications.info('Table re-population complete'));
            }
        });

        if (!game.tables.getName(CONFIG.SWADE.init.cardTable)) {
            await createActionCardTable();
            ui.notifications.info('First-Time-Setup complete');
        }
    }

}