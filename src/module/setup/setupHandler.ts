import { createActionCardTable } from '../util';

export class SwadeSetup {
  static async setup(): Promise<void> {
    if (!game.tables.getName(CONFIG.SWADE.init.cardTable)) {
      await createActionCardTable(CONFIG.SWADE.init.defaultCardCompendium);
      ui.notifications.info('First-Time-Setup complete');
    }
  }
}
