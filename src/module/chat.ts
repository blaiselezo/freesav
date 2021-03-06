import SwadeActor from './entities/SwadeActor';
import ItemChatCardHelper from './ItemChatCardHelper';

export async function formatRoll(
  chatMessage: ChatMessage,
  html: JQuery<HTMLElement>,
  data: any,
) {
  const colorMessage = chatMessage.getFlag('swade', 'colorMessage');

  // Little helper function
  const pushDice = (chatData, total, faces, red?: boolean) => {
    let color = 'black';
    if (total > faces) {
      color = 'green';
    }
    if (red) {
      color = 'red';
    }
    let img = null;
    if ([4, 6, 8, 10, 12, 20].indexOf(faces) > -1) {
      img = `icons/svg/d${faces}-grey.svg`;
    }
    chatData.dice.push({
      img: img,
      result: total,
      color: color,
      dice: true,
    });
  };

  //helper function that determines if a roll contained at least one result of 1
  const rollIsRed = (roll?: Roll) => {
    const retVal = roll.terms.some((d: Die) => {
      if (d['class'] !== 'Die') return false;
      return d.results[0]['result'] === 1;
    });
    return retVal;
  };

  //helper function that determines if a roll contained at least one result of 1
  const dieIsRed = (die?: Die) => {
    if (die['class'] !== 'Die') return false;
    return die.results[0]['result'] === 1;
  };

  const roll = JSON.parse(data.message.roll);
  const chatData = { dice: [], modifiers: [] };

  //don't format older messages anymore
  if (roll.parts) return;
  for (let i = 0; i < roll.terms.length; i++) {
    if (roll.terms[i].class === 'DicePool') {
      // Format the dice pools
      const pool = roll.terms[i].rolls;
      let faces = 0;
      // Compute dice from the pool
      pool.forEach((poolRoll: Roll) => {
        faces = poolRoll.terms[0]['faces'];
        pushDice(
          chatData,
          poolRoll.total,
          faces,
          colorMessage && rollIsRed(poolRoll),
        );
      });
    } else if (roll.terms[i].class === 'Die') {
      // Grab the right dice
      const faces = roll.terms[i].faces;
      let totalDice = 0;
      roll.terms[i].results.forEach((result) => {
        totalDice += result.result;
      });
      pushDice(
        chatData,
        totalDice,
        faces,
        colorMessage && dieIsRed(roll.terms[i]),
      );
    } else {
      if (roll.terms[i]) {
        chatData.dice.push({
          img: null,
          result: roll.terms[i],
          color: 'black',
          dice: false,
        });
      }
    }
  }
  // Replace default dice-formula by this custom;
  const rendered = await renderTemplate(
    'systems/swade/templates/chat/roll-formula.html',
    chatData,
  );
  const formula = html.find('.dice-formula');
  formula.replaceWith(rendered);
}

export function chatListeners(html: JQuery<HTMLElement>) {
  html.on('click', '.card-header .item-name', (event) => {
    const target = $(event.currentTarget).parents('.item-card');
    const actor = game.actors.get(target.data('actorId')) as SwadeActor;
    if (actor && (game.user.isGM || actor.hasPerm(game.user, 'OBSERVER'))) {
      const desc = target.find('.card-content');
      desc.slideToggle();
    }
  });

  html.on('click', '.card-buttons button', async (event) => {
    const element = event.currentTarget as Element;
    const actorId = $(element).parents('[data-actor-id]').attr('data-actor-id');
    const itemId = $(element).parents('[data-item-id]').attr('data-item-id');
    const actor = game.actors.get(actorId) as SwadeActor;
    const action = element.getAttribute('data-action');
    const messageId = $(element)
      .parents('[data-message-id]')
      .attr('data-message-id');

    // Bind item cards
    ItemChatCardHelper.onChatCardAction(event);

    //handle Power Item Card PP adjustment
    if (action === 'pp-adjust') {
      const ppToAdjust = $(element)
        .closest('.flexcol')
        .find('input.pp-adjust')
        .val() as string;
      const adjustment = element.getAttribute('data-adjust') as string;
      const power = actor.getOwnedItem(itemId);
      let key = 'data.powerPoints.value';
      const arcane = getProperty(power.data, 'data.arcane');
      if (arcane) key = `data.powerPoints.${arcane}.value`;
      let newPP = getProperty(actor.data, key);
      if (adjustment === 'plus') {
        newPP += parseInt(ppToAdjust);
      } else if (adjustment === 'minus') {
        newPP -= parseInt(ppToAdjust);
      } else if (adjustment === 'refresh') {
        await ItemChatCardHelper.refreshItemCard(actor, messageId);
      }
      await actor.update({ [key]: newPP });
      await ItemChatCardHelper.refreshItemCard(actor, messageId);
    }

    // Conviction

    if (action === 'yes') {
      const currentBennies = getProperty(
        actor.data,
        'data.bennies.value',
      ) as number;
      if (actor.data.data.bennies.value) {
        await actor.update({ 'data.bennies.value': currentBennies - 1 });
      } else {
        await actor.update({ 'data.details.conviction.active': false });
        ui.notifications.warn(game.i18n.localize('SWADE.NoBennies'));
      }
    } else if (action === 'no') {
      await actor.update({ 'data.details.conviction.active': false });
      createConvictionEndMessage(actor);
    }
    if (['yes', 'no'].includes(action)) {
      if (game.user.isGM) {
        game.messages.get(messageId).delete();
      } else {
        game.swade.sockets.deleteConvictionMessage(messageId);
      }
    }
  });
}

/**
 * Hide the display of chat card action buttons which cannot be performed by the user
 */
export function hideChatActionButtons(
  message: ChatMessage,
  html: JQuery<HTMLElement>,
  data: any,
) {
  const chatCard = html.find('.swade.chat-card');
  if (chatCard.length > 0) {
    // If the user is the message author or the actor owner, proceed
    const actor = game.actors.get(data.message.speaker.actor);
    if (actor && actor.owner) return;
    else if (game.user.isGM || data.author.id === game.user.id) return;

    // Otherwise conceal action buttons except for saving throw
    const buttons = chatCard.find('button[data-action]');
    buttons.each((i, btn) => {
      if (btn.dataset.action === 'save') return;
      btn.style.display = 'none';
    });
  }
}

/**
 * Creates an end message for Conviction
 * @param actor The Actor whose conviction is ending
 */
export function createConvictionEndMessage(actor: SwadeActor) {
  ChatMessage.create({
    speaker: {
      actor: actor,
      alias: actor.name,
    },
    content: game.i18n.localize('SWADE.ConvictionEnd'),
  });
}

/**
 * Creates a chat message for GM Bennies
 */
export async function createGmBennyAddMessage(
  user: User = game.user,
  given?: boolean,
) {
  let message = await renderTemplate(CONFIG.SWADE.bennies.templates.gmadd, {
    target: user,
    speaker: user,
  });

  if (given) {
    message = await renderTemplate(CONFIG.SWADE.bennies.templates.add, {
      target: user,
      speaker: user,
    });
  }

  const chatData = {
    content: message,
  };
  ChatMessage.create(chatData);
}

export function rerollFromChat(li: JQuery<HTMLElement>, spendBenny: boolean) {
  const message = game.messages.get(li.data('messageId')) as ChatMessage;
  const flavor = new DOMParser().parseFromString(
    getProperty(message, 'data.flavor'),
    'text/html',
  );
  const speaker = getProperty(message, 'data.speaker');
  const roll = message.roll;
  const actor = ChatMessage.getSpeakerActor(speaker) as SwadeActor;
  const currentBennies = getProperty(actor.data, 'data.bennies.value');
  const doSpendBenny = spendBenny && !!actor && actor.isWildcard;

  if (doSpendBenny && currentBennies <= 0) {
    ui.notifications.warn(game.i18n.localize('SWADE.NoBennies'));
    return;
  }

  const prefix = doSpendBenny
    ? game.i18n.localize('SWADE.RerollWithBenny')
    : game.i18n.localize('SWADE.FreeReroll');

  const prefixes = flavor.getElementsByClassName('prefix') as HTMLCollection;
  if (prefixes.length > 0) {
    Array.from(prefixes).forEach((el: HTMLElement) => {
      el.innerText = prefix;
    });
  } else {
    flavor.body.innerHTML = `<strong class="prefix">${prefix}</strong><br>${flavor.body.innerHTML}`;
  }
  const newRollData = {
    speaker: speaker,
    flavor: flavor.body.innerHTML,
  };

  if (doSpendBenny) {
    actor.spendBenny().then(() => roll.reroll().toMessage(newRollData));
  } else {
    roll.reroll().toMessage(newRollData);
  }
}
