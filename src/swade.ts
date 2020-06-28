/* eslint-disable no-unused-vars */
/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: FloRad
 * Content License: Savage Worlds Fan License
 * Software License: GNU GENERAL PUBLIC LICENSE Version 3
 */

// Import TypeScript modules
import { SwadeCharacterSheet } from './module/SwadeCharacterSheet';
import { formatRoll } from './module/chat';
import { SWADE } from './module/config';
import { SwadeActor } from './module/SwadeActor';
import { registerCustomHelpers } from './module/handlebarsHelpers';
import { SwadeItem } from './module/SwadeItem';
import { SwadeItemSheet } from './module/SwadeItemSheet';
import { listenJournalDrop } from './module/journalDrop';
import { SwadeNPCSheet } from './module/SwadeNPCSheet';
import { preloadHandlebarsTemplates } from './module/preloadTemplates';
import { registerSettings } from './module/settings';
import { SwadeSetup } from './module/setup/setupHandler';
import { Bennies } from './module/bennies';
import {
  createActionCardTable,
  createSwadeMacro,
  rollSkillMacro,
  rollWeaponMacro,
  findOwner,
} from './module/util';
import { rollInitiative, setupTurns } from './module/SwadeCombat';
import * as chat from './module/chat';
import { SwadeSocketHandler } from './module/SwadeSocketHandler';

/* ------------------------------------ */
/* Initialize system					*/
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
    sockets: new SwadeSocketHandler(),
  };

  //Register custom Handlebars helpers
  registerCustomHelpers();

  Combat.prototype.rollInitiative = rollInitiative;
  Combat.prototype.setupTurns = setupTurns;

  // Register custom classes
  CONFIG.Actor.entityClass = SwadeActor;
  CONFIG.Item.entityClass = SwadeItem;
  //CONFIG.Combat.entityClass = SwadeCombat;

  // Register custom system settings
  registerSettings();

  // Register custom sheets (if any)
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('swade', SwadeCharacterSheet, {
    types: ['character'],
    makeDefault: true,
  });
  Actors.registerSheet('swade', SwadeNPCSheet, {
    types: ['npc'],
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
/* Setup system							*/
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
/* When ready							*/
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

// Add any additional hooks if necessary
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
    if (updateData.data && updateData.data.bennies) {
      ui['players'].render(true);
    }
    //if it's a status update, update the token
    if (
      updateData.data &&
      updateData.data.status &&
      (game.user.isGM || actor.owner)
    ) {
      const shaken = CONFIG.SWADE.statusIcons.shaken;
      const vulnerable = CONFIG.SWADE.statusIcons.vulnerable;
      const distracted = CONFIG.SWADE.statusIcons.distracted;
      const actorData = actor.data as any;

      for (const t of actor.getActiveTokens()) {
        if (t.data.actorLink && t.scene.id === game.scenes.active.id) {
          if (
            actorData.data.status.isShaken &&
            !t.data.effects.includes(shaken)
          )
            await t.toggleEffect(shaken);
          if (
            !actorData.data.status.isShaken &&
            t.data.effects.includes(shaken)
          )
            await t.toggleEffect(shaken);
          if (
            actorData.data.status.isVulnerable &&
            !t.data.effects.includes(vulnerable)
          )
            await t.toggleEffect(vulnerable);
          if (
            !actorData.data.status.isVulnerable &&
            t.data.effects.includes(vulnerable)
          )
            await t.toggleEffect(vulnerable);
          if (
            actorData.data.status.isDistracted &&
            !t.data.effects.includes(distracted)
          )
            await t.toggleEffect(distracted);
          if (
            !actorData.data.status.isDistracted &&
            t.data.effects.includes(distracted)
          )
            await t.toggleEffect(distracted);
        }
      }
    }
  },
);

Hooks.on(
  'preUpdateToken',
  async (scene: Scene, token: any, updateData: any, options: any) => {
    const shaken = CONFIG.SWADE.statusIcons.shaken;
    const vulnerable = CONFIG.SWADE.statusIcons.vulnerable;
    const distracted = CONFIG.SWADE.statusIcons.distracted;

    // if the update is effects
    if (updateData.effects) {
      if (token.actorLink) {
        // linked token
        const tokenActor = game.actors.get(token.actorId) as SwadeActor;

        await tokenActor.update({
          'data.status': {
            isShaken: updateData.effects.includes(shaken),
            isVulnerable: updateData.effects.includes(vulnerable),
            isDistracted: updateData.effects.includes(distracted),
          },
        });
      } else {
        // unlinked token
        const newStatus = {
          isShaken: updateData.effects.includes(shaken),
          isVulnerable: updateData.effects.includes(vulnerable),
          isDistracted: updateData.effects.includes(distracted),
        };
        updateData.actorData = {
          data: {
            status: newStatus,
          },
        };
      }
    } else if (
      updateData.actorData &&
      updateData.actorData.data &&
      updateData.actorData.data.status
    ) {
      //else if the update is a toke-actor status update
      const actorShaken = updateData.actorData.data.status.isShaken;
      const actorVulnerable = updateData.actorData.data.status.isVulnerable;
      const actorDistracted = updateData.actorData.data.status.isDistracted;

      let newEffects = token.effects;

      if (typeof actorShaken !== 'undefined') {
        if (actorShaken && !newEffects.includes(shaken))
          newEffects.push(shaken);
        if (!actorShaken && newEffects.includes(shaken)) {
          const index = newEffects.indexOf(shaken);
          if (index > -1) newEffects.splice(index, 1);
        }
      }

      if (typeof actorVulnerable !== 'undefined') {
        if (actorVulnerable && !newEffects.includes(vulnerable))
          newEffects.push(vulnerable);
        if (!actorVulnerable && newEffects.includes(vulnerable)) {
          const index = newEffects.indexOf(vulnerable);
          if (index > -1) newEffects.splice(index, 1);
        }
      }
      if (typeof actorDistracted !== 'undefined') {
        if (actorDistracted && !newEffects.includes(distracted))
          newEffects.push(distracted);
        if (!actorDistracted && newEffects.includes(distracted)) {
          const index = newEffects.indexOf(distracted);
          if (index > -1) newEffects.splice(index, 1);
        }
      }
      updateData.effects = [...new Set(newEffects)];
    }
  },
);

Hooks.on(
  'preCreateToken',
  async (scene: Scene, createData: any, options: any, userId: string) => {
    // return if the token has no linked actor
    if (!createData.actorLink) return;

    const actor = game.actors.get(createData.actorId) as SwadeActor;

    // return if this token has no actor
    if (!actor) return;

    const shaken = CONFIG.SWADE.statusIcons.shaken;
    const vulnerable = CONFIG.SWADE.statusIcons.vulnerable;
    const distracted = CONFIG.SWADE.statusIcons.distracted;
    const actorData = actor.data as any;

    const createEffects = [];

    if (actorData.data.status.isShaken) createEffects.push(shaken);
    if (actorData.data.status.isVulnerable) createEffects.push(vulnerable);
    if (actorData.data.status.isDistracted) createEffects.push(distracted);

    createData.effects = createEffects;
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
      combat.turns = combat.setupTurns();
    }
  },
);

Hooks.on(
  'updateCombat',
  async (combat: Combat, updateData, options, userId: string) => {
    //do stuff here for Conviction
    //get all combatants with active conviction
    let activeConvictions = combat.combatants.filter(
      (c) => c.actor.data.data.details.conviction.active,
    );
    for (const conv of activeConvictions) {
      //if it's not the combatants turn then skip
      const convActiveHasTurn =
        conv.tokenId === combat.turns[updateData.turn]['tokenId'];
      const activeGMs = game.users.filter((u) => u.isGM && u.active);
      const firstFoundActiveGM = activeGMs[0]._id === game.userId;
      if (
        convActiveHasTurn &&
        firstFoundActiveGM &&
        game.settings.get('swade', 'enableConviction')
      ) {
        const template = 'systems/swade/templates/chat/conviction-card.html';
        const html = await renderTemplate(template, { actor: conv.actor });
        const messageData = {
          speaker: {
            scene: canvas.scene._id,
            actor: conv.actor,
            token: conv.token as any,
            alias: conv.token.name,
          },
          whisper: [...conv.players, ...game.users.filter((u) => u.isGM)],
          content: html,
        };
        await ChatMessage.create(messageData);
      }
    }
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

Hooks.on('getUserContextOptions', (html: JQuery, context: any) => {
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
  );
});
