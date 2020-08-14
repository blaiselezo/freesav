/* eslint-disable no-unused-vars */
/**
 * This is the TypeScript entry file for Foundry VTT.
 * Author: FloRad
 * Content License: Savage Worlds Fan License
 * Software License: GNU GENERAL PUBLIC LICENSE Version 3
 */

import Bennies from './module/bennies';
import * as chat from './module/chat';
import { formatRoll } from './module/chat';
import { getSwadeConeShape } from './module/cone';
import { SWADE } from './module/config';
import SwadeActor from './module/entities/SwadeActor';
import SwadeItem from './module/entities/SwadeItem';
import SwadeTemplate from './module/entities/SwadeTemplate';
import { TemplatePreset } from './module/enums/TemplatePreset';
import { registerCustomHelpers } from './module/handlebarsHelpers';
import { listenJournalDrop } from './module/journalDrop';
import { preloadHandlebarsTemplates } from './module/preloadTemplates';
import { registerSettings } from './module/settings';
import { SwadeSetup } from './module/setup/setupHandler';
import SwadeCharacterSheet from './module/sheets/SwadeCharacterSheet';
import SwadeItemSheet from './module/sheets/SwadeItemSheet';
import SwadeNPCSheet from './module/sheets/SwadeNPCSheet';
import SwadeVehicleSheet from './module/sheets/SwadeVehicleSheet';
import { rollInitiative, setupTurns } from './module/SwadeCombat';
import { SwadeSocketHandler } from './module/SwadeSocketHandler';
import {
  createActionCardTable,
  createSwadeMacro,
  rollSkillMacro,
  rollWeaponMacro,
  rollPowerMacro,
} from './module/util';

/* ------------------------------------ */
/* Initialize system					          */
/* ------------------------------------ */
Hooks.once('init', async function () {
  console.log(
    `SWADE | Initializing Savage Worlds Adventure Edition\n${SWADE.ASCII}`,
  );

  // Record Configuration Values
  //CONFIG.debug.hooks = true;
  CONFIG.SWADE = SWADE;

  game.swade = {
    SwadeActor,
    SwadeItem,
    rollSkillMacro,
    rollWeaponMacro,
    rollPowerMacro,
    sockets: new SwadeSocketHandler(),
  };

  //Register custom Handlebars helpers
  registerCustomHelpers();

  //Overwrite method prototypes
  Combat.prototype.rollInitiative = rollInitiative;
  Combat.prototype.setupTurns = setupTurns;
  MeasuredTemplate.prototype._getConeShape = getSwadeConeShape;

  // Register custom classes
  CONFIG.Actor.entityClass = SwadeActor;
  CONFIG.Item.entityClass = SwadeItem;
  //CONFIG.Combat.entityClass = SwadeCombat;

  // Register custom system settings
  registerSettings();

  // Register sheets
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('swade', SwadeCharacterSheet, {
    types: ['character'],
    makeDefault: true,
  });
  Actors.registerSheet('swade', SwadeNPCSheet, {
    types: ['npc'],
    makeDefault: true,
  });
  Actors.registerSheet('swade', SwadeVehicleSheet, {
    types: ['vehicle'],
    makeDefault: true,
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('swade', SwadeItemSheet, { makeDefault: true });

  // Drop a journal image to a tile (for cards)
  listenJournalDrop();

  // Preload Handlebars templates
  await preloadHandlebarsTemplates();
});

/* ------------------------------------ */
/* Setup system							            */
/* ------------------------------------ */
Hooks.once('setup', function () {
  // Do anything after initialization but before ready
  // Localize CONFIG objects once up-front
  const toLocalize = [];
  for (let o of toLocalize) {
    CONFIG.SWADE[o] = Object.entries(CONFIG.SWADE[o]).reduce((obj, e: any) => {
      console.log(e);
      obj[e[0]] = game.i18n.localize(e[1]);
      return obj;
    }, {});
  }
});

/* ------------------------------------ */
/* When ready						              	*/
/* ------------------------------------ */
Hooks.once('ready', async () => {
  let packChoices = {};
  game.packs
    .filter((p) => p.entity === 'JournalEntry')
    .forEach((p) => {
      packChoices[p.collection] = p.metadata.label;
    });

  game.settings.register('swade', 'cardDeck', {
    name: 'Card Deck to use for Initiative',
    scope: 'world',
    type: String,
    config: true,
    default: CONFIG.SWADE.init.defaultCardCompendium,
    choices: packChoices,
    onChange: async (choice) => {
      console.log(
        `Repopulating action cards Table with cards from deck ${choice}`,
      );
      await createActionCardTable(true, choice);
      ui.notifications.info('Table re-population complete');
    },
  });
  await SwadeSetup.setup();
  Hooks.on('hotbarDrop', (bar, data, slot) => createSwadeMacro(data, slot));
});

Hooks.on('preCreateItem', (createData: any, options: any, userId: string) => {
  //Set default image if no image already exists
  if (!createData.img) {
    createData.img = `systems/swade/assets/icons/${createData.type}.svg`;
  }
});

Hooks.on(
  'preCreateOwnedItem',
  (actor: SwadeActor, createData: any, options: any, userId: string) => {
    //Set default image if no image already exists
    if (!createData.img) {
      createData.img = `systems/swade/assets/icons/${createData.type}.svg`;
    }
  },
);

Hooks.on(
  'createActor',
  async (actor: SwadeActor, options: any, userId: String) => {
    if (actor.data.type === 'character' && options.renderSheet) {
      const skillsToFind = [
        'Athletics',
        'Common Knowledge',
        'Notice',
        'Persuasion',
        'Stealth',
        'Untrained',
      ];
      const skillIndex = (await game.packs
        .get('swade.skills')
        .getContent()) as SwadeItem[];
      actor.createEmbeddedEntity(
        'OwnedItem',
        skillIndex.filter((i) => skillsToFind.includes(i.data.name)),
      );
    }
  },
);

// Mark all Wildcards in the Actors sidebars with an icon
Hooks.on(
  'renderActorDirectory',
  (app, html: JQuery<HTMLElement>, options: any) => {
    const found = html.find('.entity-name');

    let wildcards: SwadeActor[] = app.entities.filter(
      (a: Actor) => a.data.type === 'character',
    );

    //if the player is not a GM, then don't mark the NPC wildcards
    if (!game.settings.get('swade', 'hideNPCWildcards') || options.user.isGM) {
      wildcards = wildcards.concat(
        app.entities.filter(
          (a) => a.data.type === 'npc' && a.data.data.wildcard,
        ),
      );
    }

    wildcards.forEach((wc: SwadeActor) => {
      for (let i = 0; i < found.length; i++) {
        const element = found[i];
        if (element.innerText === wc.data.name) {
          element.innerHTML = `
					<a><img src="systems/swade/assets/ui/wildcard.svg" class="wildcard-icon">${wc.data.name}</a>
					`;
        }
      }
    });
  },
);

Hooks.on('renderCompendium', async (app, html: JQuery<HTMLElement>, data) => {
  if (app.metadata.entity !== 'Actor') {
    return;
  }
  const content = await app.getContent();
  const wildcards = content.filter(
    (entity: SwadeActor) => entity.data['wildcard'],
  );
  const names: string[] = wildcards.map((e) => e.data.name);

  const found = html.find('.entry-name');
  found.each((i, el) => {
    const name = names.find((name) => name === el.innerText);
    if (!name) {
      return;
    }
    el.innerHTML = `<a><img src="systems/swade/assets/ui/wildcard-dark.svg" class="wildcard-icon">${name}</a>`;
  });
});

Hooks.on(
  'preUpdateActor',
  (actor: SwadeActor, updateData: any, options: any, userId: string) => {
    //wildcards will be linked, extras unlinked
    if (
      updateData.data &&
      typeof updateData.data.wildcard !== 'undefined' &&
      game.settings.get('swade', 'autoLinkWildcards')
    ) {
      updateData.token = { actorLink: updateData.data.wildcard };
    }
  },
);

Hooks.on(
  'updateActor',
  async (actor: SwadeActor, updateData: any, options: any, userId: string) => {
    if (actor.data.type === 'npc') {
      ui.actors.render();
    }
    // Update the player list to display new bennies values
    if (updateData?.data?.bennies) {
      ui['players'].render(true);
    }
  },
);

Hooks.on('renderCombatTracker', (app, html: JQuery<HTMLElement>, data) => {
  const currentCombat = data.combats[data.currentIndex - 1];
  html.find('.combatant').each((i, el) => {
    const combId = el.getAttribute('data-combatant-id');
    const combatant = currentCombat.data.combatants.find(
      (c) => c._id == combId,
    );
    const initdiv = el.getElementsByClassName('token-initiative');
    if (combatant.hasRolled) {
      initdiv[0].innerHTML = `<span class="initiative">${combatant.flags.swade.cardString}</span>`;
    } else if (!data.user.isGM) {
      initdiv[0].innerHTML = '';
    }
  });
});

Hooks.on(
  'preUpdateCombat',
  async (combat, updateData, options, userId: string) => {
    // Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
    const user = game.users.get(userId) as User;
    if (!game.user.isGM || (game.userId !== userId && user.isGM)) {
      return;
    }

    // Return if this update does not contains a round
    if (!updateData.round) {
      return;
    }

    if (combat instanceof CombatEncounters) {
      combat = game.combats.get(updateData._id) as Combat;
    }

    // If we are not moving forward through the rounds, return
    if (updateData.round < 1 || updateData.round < combat.previous.round) {
      return;
    }

    // If Combat has just started, return
    if (
      (!combat.previous.round || combat.previous.round === 0) &&
      updateData.round === 1
    ) {
      return;
    }

    let jokerDrawn = false;

    // Reset the Initiative of all combatants
    combat.combatants.forEach((c) => {
      if (c.flags.swade && c.flags.swade.hasJoker) {
        jokerDrawn = true;
      }
    });

    const resetComs = combat.combatants.map((c) => {
      c.initiative = null;
      c.hasRolled = false;
      c.flags.swade.cardValue = null;
      c.flags.swade.suitValue = null;
      c.flags.swade.hasJoker = null;
      return c;
    });

    updateData.combatants = resetComs;

    // Reset the deck if any combatant has had a Joker
    if (jokerDrawn) {
      const deck = game.tables.getName(
        CONFIG.SWADE.init.cardTable,
      ) as RollTable;
      await deck.reset();
      ui.notifications.info('Card Deck automatically reset');
    }

    //Init autoroll
    if (game.settings.get('swade', 'autoInit')) {
      const combatantIds = combat.combatants.map((c) => c._id);
      await combat.rollInitiative(combatantIds);
    }
  },
);

Hooks.on(
  'updateCombat',
  async (combat: Combat, updateData, options, userId: string) => {
    let string = `Round ${combat.round} - Turn ${combat.turn}\n`;
    for (let i = 0; i < combat.turns.length; i++) {
      const element = combat.turns[i];
      string = string.concat(`${i}) ${element['token']['name']}\n`);
    }
    console.log(string);
  },
);

Hooks.on(
  'deleteCombat',
  async (combat: Combat, options: any, userId: string) => {
    if (!game.user.isGM || !game.users.get(userId).isGM) {
      return;
    }
    const jokers = combat.combatants.filter(
      (c) => c.flags.swade && c.flags.swade.hasJoker,
    );

    //reset the deck when combat is ended in a round that a Joker was drawn in
    if (jokers.length > 0) {
      const deck = game.tables.getName(
        CONFIG.SWADE.init.cardTable,
      ) as RollTable;
      deck.reset().then((value) => {
        ui.notifications.info('Card Deck automatically reset');
      });
    }
  },
);

// Add roll data to the message for formatting of dice pools
Hooks.on(
  'renderChatMessage',
  async (
    chatMessage: ChatMessage,
    html: JQuery<HTMLHtmlElement>,
    data: any,
  ) => {
    if (chatMessage.isRoll && chatMessage.isContentVisible) {
      await formatRoll(chatMessage, html, data);
    }
  },
);

Hooks.on('renderChatLog', (app, html, data) => {
  chat.chatListeners(html);
});

// Add benny management to the player list
Hooks.on('renderPlayerList', async (list: any, html: JQuery, options: any) => {
  html.find('.player').each((id, player) => {
    Bennies.append(player, options);
  });
});

Hooks.on('getUserContextOptions', (html: JQuery, context: any[]) => {
  let players = html.find('#players');
  if (!players) return;
  context.push(
    {
      name: game.i18n.localize('SWADE.BenniesGive'),
      icon: '<i class="fas fa-plus"></i>',
      condition: (li) =>
        game.user.isGM && game.users.get(li[0].dataset.userId).isGM,
      callback: (li) => {
        const selectedUser = game.users.get(li[0].dataset.userId);
        selectedUser
          .setFlag(
            'swade',
            'bennies',
            selectedUser.getFlag('swade', 'bennies') + 1,
          )
          .then(async () => {
            ui['players'].render(true);
            if (game.settings.get('swade', 'notifyBennies')) {
              //In case one GM gives another GM a benny a different message should be displayed
              let givenEvent = selectedUser !== game.user;
              chat.createGmBennyAddMessage(selectedUser, givenEvent);
            }
          });
      },
    },
    {
      name: game.i18n.localize('SWADE.BenniesRefresh'),
      icon: '<i class="fas fa-sync"></i>',
      condition: (li) => game.user.isGM,
      callback: (li) => {
        const user = game.users.get(li[0].dataset.userId);
        Bennies.refresh(user);
      },
    },
    {
      name: game.i18n.localize('SWADE.AllBenniesRefresh'),
      icon: '<i class="fas fa-sync"></i>',
      condition: (li) => game.user.isGM,
      callback: (li) => {
        Bennies.refreshAll();
      },
    },
  );
});

Hooks.on('getSceneControlButtons', (sceneControlButtons: any[]) => {
  const measure = sceneControlButtons.find((a) => a.name === 'measure');
  const newButtons = [
    {
      name: 'swcone',
      title: 'SWADE.Cone',
      icon: 'cone far fa-circle',
      visible: true,
      button: true,
      onClick: () => {
        const template = SwadeTemplate.fromPreset(TemplatePreset.CONE);
        if (template) template.drawPreview(event);
      },
    },
    {
      name: 'sbt',
      title: 'SWADE.SBT',
      icon: 'sbt far fa-circle',
      visible: true,
      button: true,
      onClick: () => {
        const template = SwadeTemplate.fromPreset(TemplatePreset.SBT);
        if (template) template.drawPreview(event);
      },
    },
    {
      name: 'mbt',
      title: 'SWADE.MBT',
      icon: 'mbt far fa-circle',
      visible: true,
      button: true,
      onClick: () => {
        const template = SwadeTemplate.fromPreset(TemplatePreset.MBT);
        if (template) template.drawPreview(event);
      },
    },
    {
      name: 'lbt',
      title: 'SWADE.LBT',
      icon: 'lbt far fa-circle',
      visible: true,
      button: true,
      onClick: () => {
        const template = SwadeTemplate.fromPreset(TemplatePreset.LBT);
        if (template) template.drawPreview(event);
      },
    },
  ];
  measure.tools = measure.tools.concat(newButtons);
});
