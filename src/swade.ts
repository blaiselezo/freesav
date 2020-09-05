/* eslint-disable no-unused-vars */
/**
 * This is the TypeScript entry file for Foundry VTT.
 * Author: FloRad
 * Content License: Savage Worlds Fan License
 * Software License: GNU GENERAL PUBLIC LICENSE Version 3
 */

import { getSwadeConeShape } from './module/cone';
import { SWADE } from './module/config';
import SwadeActor from './module/entities/SwadeActor';
import SwadeItem from './module/entities/SwadeItem';
import { registerCustomHelpers } from './module/handlebarsHelpers';
import { listenJournalDrop } from './module/journalDrop';
import { preloadHandlebarsTemplates } from './module/preloadTemplates';
import { registerSettings } from './module/settings';
import SwadeCharacterSheet from './module/sheets/SwadeCharacterSheet';
import SwadeItemSheet from './module/sheets/SwadeItemSheet';
import SwadeNPCSheet from './module/sheets/SwadeNPCSheet';
import SwadeVehicleSheet from './module/sheets/SwadeVehicleSheet';
import { rollInitiative, setupTurns } from './module/SwadeCombat';
import SwadeHooks from './module/SwadeHooks';
import { SwadeSocketHandler } from './module/SwadeSocketHandler';
import { rollPowerMacro, rollSkillMacro, rollWeaponMacro } from './module/util';

/* ------------------------------------ */
/* Initialize system					          */
/* ------------------------------------ */
Hooks.once('init', () => {
  console.log(
    `SWADE | Initializing Savage Worlds Adventure Edition\n${SWADE.ASCII}`,
  );

  // Record Configuration Values
  // CONFIG.debug.hooks = true;
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
  CONFIG.SWADE.templates.preloadPromise = preloadHandlebarsTemplates();
  CONFIG.SWADE.templates.preloadPromise.then(() => {
    CONFIG.SWADE.templates.templatesPreloaded = true;
  });
});

/* ------------------------------------ */
/* Setup system							            */
/* ------------------------------------ */
Hooks.once('setup', () => SwadeHooks.onSetup());

/* ------------------------------------ */
/* When ready						              	*/
/* ------------------------------------ */
Hooks.once('ready', async () => SwadeHooks.onReady());

Hooks.on('preCreateItem', (createData: any, options: any, userId: string) =>
  SwadeHooks.onPreCreateItem(createData, options, userId),
);

Hooks.on(
  'preCreateOwnedItem',
  (actor: SwadeActor, createData: any, options: any, userId: string) =>
    SwadeHooks.onPreCreateOwnedItem(actor, createData, options, userId),
);

Hooks.on(
  'createActor',
  async (actor: SwadeActor, options: any, userId: string) =>
    SwadeHooks.onCreateActor(actor, options, userId),
);

Hooks.on(
  'renderActorDirectory',
  (app: ActorDirectory, html: JQuery<HTMLElement>, options: any) =>
    SwadeHooks.onRenderActorDirectory(app, html, options),
);

Hooks.on(
  'renderCompendium',
  async (app: Compendium, html: JQuery<HTMLElement>, data: any) =>
    SwadeHooks.onRenderCompendium(app, html, data),
);

Hooks.on(
  'preUpdateActor',
  (actor: SwadeActor, updateData: any, options: any, userId: string) =>
    SwadeHooks.onPreUpdateActor(actor, updateData, options, userId),
);

Hooks.on(
  'updateActor',
  (actor: SwadeActor, updateData: any, options: any, userId: string) =>
    SwadeHooks.onUpdateActor(actor, updateData, options, userId),
);

Hooks.on(
  'renderCombatTracker',
  (app: CombatTracker, html: JQuery<HTMLElement>, data: any) =>
    SwadeHooks.onRenderCombatTracker(app, html, data),
);

Hooks.on(
  'preUpdateCombat',
  async (combat: any | Combat, updateData: any, options: any, userId: string) =>
    SwadeHooks.onPreUpdateCombat(combat, updateData, options, userId),
);

Hooks.on(
  'updateCombat',
  (combat: Combat, updateData, options, userId: string) =>
    SwadeHooks.onUpdateCombat(combat, updateData, options, userId),
);

Hooks.on('deleteCombat', (combat: Combat, options: any, userId: string) =>
  SwadeHooks.onDeleteCombat(combat, options, userId),
);

// Add roll data to the message for formatting of dice pools
Hooks.on(
  'renderChatMessage',
  async (chatMessage: ChatMessage, html: JQuery<HTMLElement>, data: any) =>
    SwadeHooks.onRenderChatMessage(chatMessage, html, data),
);

Hooks.on('renderChatLog', (app, html: JQuery<HTMLElement>, data) =>
  SwadeHooks.onRenderChatLog(app, html, data),
);

// Add benny management to the player list
Hooks.on('renderPlayerList', async (list: any, html: JQuery, options: any) =>
  SwadeHooks.onRenderPlayerList(list, html, options),
);

Hooks.on('getUserContextOptions', (html: JQuery, context: any[]) =>
  SwadeHooks.onGetUserContextOptions(html, context),
);

Hooks.on('getSceneControlButtons', (sceneControlButtons: any[]) =>
  SwadeHooks.onGetSceneControlButtons(sceneControlButtons),
);
