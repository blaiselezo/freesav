import { createActionCardTable } from '../util'

export class SwadeSetup {

    static async setup(): Promise<void> {

        if (!game.tables.getName(CONFIG.SWADE.init.cardTable)) {
            await createActionCardTable();
            ui.notifications.info('First-Time-Setup complete');
        }
    }

}