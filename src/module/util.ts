// eslint-disable-next-line no-unused-vars
import { SwadeItem } from './SwadeItem';
// eslint-disable-next-line no-unused-vars
import { SwadeActor } from './SwadeActor';

export function isIncapacitated(wounds, fatigue): boolean {
  if (
    (parseInt(wounds.max) > 0 &&
      parseInt(wounds.value) >= parseInt(wounds.max)) ||
    parseInt(fatigue.value) >= parseInt(fatigue.max)
  ) {
    return true;
  }
  return false;
}

export function setIncapacitationSymbol(
  data: any,
  html: JQuery<HTMLElement>,
): void {
  const container = html.find('.incap-container');
  const isIncap = isIncapacitated(data.data.wounds, data.data.fatigue);
  if (isIncap) {
    container.css('opacity', '1');
  } else {
    container.css('opacity', '0');
  }
}

export async function createActionCardTable(
  rebuild?: boolean,
  cardpack?: string,
): Promise<void> {
  let packName = game.settings.get('swade', 'cardDeck');
  if (cardpack) {
    packName = cardpack;
  }
  const cardPack = game.packs.get(packName) as Compendium;
  const cardPackIndex = await cardPack.getIndex();
  let cardTable = game.tables.getName(CONFIG.SWADE.init.cardTable);

  //If the table doesn't exist, create it
  if (!cardTable) {
    const tableData = {
      name: CONFIG.SWADE.init.cardTable,
      replacement: false,
      displayRoll: false,
    };
    const tableOptions = { temporary: false, renderSheet: false };
    cardTable = (await RollTable.create(tableData, tableOptions)) as RollTable;
  }

  //If it's a rebuild call, delete all entries and then repopulate them
  if (rebuild) {
    let deletions = cardTable.results.map((i) => i._id) as string[];
    await cardTable.deleteEmbeddedEntity('TableResult', deletions);
  }

  const createData = [];
  for (let i = 0; i < cardPackIndex.length; i++) {
    let c = cardPackIndex[i] as any;
    let resultData = {
      type: 2, //Set type to compendium
      text: c.name,
      img: c.img,
      collection: packName, // Name of the compendium
      resultId: c.id, //Id of the entry inside the compendium
      weight: 1,
      range: [i + 1, i + 1],
    };
    createData.push(resultData);
  }
  await cardTable.createEmbeddedEntity('TableResult', createData);
  await cardTable.normalize();
  ui.tables.render();
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function createSwadeMacro(data: any, slot: number) {
  console.log(data);
  if (data.type !== 'Item') return;
  if (!('data' in data))
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items',
    );
  const item = data.data;
  let command: String;
  // Create the macro command
  switch (item.type) {
    case 'skill':
      command = `game.swade.rollSkillMacro("${item.name}");`;
      break;
    case 'weapon':
      command = `game.swade.rollWeaponMacro("${item.name}");`;
      break;
    default:
      break;
  }
  let macro = game.macros.find(
    (m) => m.name === item.name && m['data']['command'] === command,
  ) as any;
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
    });
  }
  await game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} skillName
 * @return {Promise}
 */
export function rollSkillMacro(skillName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item: SwadeItem = actor
    ? actor.items.find((i) => i.name === skillName)
    : null;
  if (!item)
    return ui.notifications.warn(
      `Your controlled Actor does not have the skill ${skillName}`,
    );

  // Trigger the item roll
  return actor.rollSkill(item.id);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} skillName
 * @return {Promise}
 */
export function rollWeaponMacro(weaponName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item: SwadeItem = actor
    ? actor.items.find((i) => i.name === weaponName)
    : null;
  if (!item)
    return ui.notifications.warn(
      `Your controlled Actor does not have an item named ${weaponName}`,
    );

  // Trigger the item roll
  return item.rollDamage();
}

export function findOwner(actor: SwadeActor): string {
  const permObj = actor.data['permission'];
  for (const key in permObj) {
    if (permObj[key] === 3 && !game.users.get(key).isGM) {
      return key;
    }
  }
  return game.users.find((u) => u.isGM);
}
