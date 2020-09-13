// eslint-disable-next-line no-unused-vars
import SwadeActor from './entities/SwadeActor';
import SwadeItem from './entities/SwadeItem';

export async function formatRoll(
  chatMessage: ChatMessage,
  html: JQuery<HTMLElement>,
  data: any,
) {
  // Little helper function
  let pushDice = (chatData, total, faces) => {
    let color = 'black';
    if (total > faces) {
      color = 'green';
    }
    if (total == 1) {
      color = 'red';
    }
    let img = null;
    if ([4, 6, 8, 10, 12, 20].indexOf(faces) > -1) {
      img = `../icons/svg/d${faces}-grey.svg`;
    }
    chatData.dice.push({
      img: img,
      result: total,
      color: color,
      dice: true,
    });
  };

  let roll = JSON.parse(data.message.roll);
  let chatData = { dice: [], modifiers: [] };
  for (let i = 0; i < roll.parts.length; i++) {
    if (roll.parts[i].class == 'DicePool') {
      // Format the dice pools
      let pool = roll.parts[i].rolls;
      let faces = 0;
      // Compute dice from the pool
      pool.forEach((pooldie: any) => {
        faces = pooldie.dice[0].faces;
        pushDice(chatData, pooldie.total, faces);
      });
    } else if (
      typeof roll.parts[i] == 'string' &&
      roll.parts[i].substring(0, 2) == '_d'
    ) {
      // Grab the right dice
      let idice = parseInt(roll.parts[i].substring(2));
      let faces = roll.dice[idice].faces;
      let totalDice = 0;
      roll.dice[idice].rolls.forEach((roll: any) => {
        totalDice += roll.roll;
      });
      faces = roll.dice[idice].faces;
      pushDice(chatData, totalDice, faces);
    } else {
      if (roll.parts[i]) {
        chatData.dice.push({
          img: null,
          result: roll.parts[i],
          color: 'black',
          dice: false,
        });
      }
    }
  }
  // Replace default dice-formula by this custom;
  let rendered = await renderTemplate(
    'systems/swade/templates/chat/roll-formula.html',
    chatData,
  );
  let formula = html.find('.dice-formula');
  formula.replaceWith(rendered);
}

export function chatListeners(html: JQuery<HTMLElement>) {
  html.on('click', '.card-header .item-name', (event) => {
    let target = $(event.currentTarget).parents('.item-card');
    let actor = game.actors.get(target.data('actorId')) as SwadeActor;
    if (actor && (game.user.isGM || actor.hasPerm(game.user, 2))) {
      let desc = target.find('.card-content');
      desc.slideToggle();
    }
  });

  html.on('click', '.card-buttons button', async (event) => {
    // Bind item cards
    SwadeItem._onChatCardAction(event);

    // Conviction
    const element = event.currentTarget as Element;
    const actorId = $(element).parents('[data-actor-id]').attr('data-actor-id');
    const actor = game.actors.get(actorId) as SwadeActor;
    const messageId = $(element)
      .parents('[data-message-id]')
      .attr('data-message-id');
    const action = element.getAttribute('data-action');
    if (action === 'yes') {
      const currentBennies = actor.data.data.bennies.value;
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
    let actor = game.actors.get(data.message.speaker.actor);
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

  let chatData = {
    content: message,
  };
  ChatMessage.create(chatData);
}
