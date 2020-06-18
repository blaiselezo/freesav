import { SwadeActor } from './SwadeActor';

export class Bennies {
  static async spendEvent(ev: MouseEvent) {
    ev.preventDefault();
    const userId = (ev.target as HTMLElement).parentElement.dataset.userId;
    let user = game.users.find((user: User) => user.id == userId);
    if (user.isGM) {
      let value = user.getFlag('swade', 'bennies');
      if (value == 0) return;
      let message = await renderTemplate(CONFIG.SWADE.bennies.templates.spend, {
        target: game.user,
        speaker: game.user,
      });
      let chatData = {
        content: message,
      };
      if (game.settings.get('swade', 'notifyBennies')) {
        ChatMessage.create(chatData);
      }
      user.setFlag('swade', 'bennies', value - 1);
    } else if (user.character) {
      user.character.spendBenny();
    }
  }

  static async refresh(user: User) {
    if (user.isGM) {
      user.setFlag('swade', 'bennies', game.users.size - 1);
      let message = await renderTemplate(
        CONFIG.SWADE.bennies.templates.refresh,
        { target: game.user, speaker: game.user },
      );
      let chatData = {
        content: message,
      };
      if (game.settings.get('swade', 'notifyBennies')) {
        ChatMessage.create(chatData);
      }
      ui['players'].render(true);
      return;
    }
    if (user.character) {
      (user.character as SwadeActor).refreshBennies();
    }
  }

  static async giveEvent(ev: MouseEvent) {
    ev.preventDefault();
    const userId = (ev.target as HTMLElement).parentElement.dataset.userId;
    let user = game.users.find((user: User) => user.id == userId);
    if (user.isGM) {
      let value = user.getFlag('swade', 'bennies');
      user.setFlag('swade', 'bennies', value + 1);
      let message = await renderTemplate(CONFIG.SWADE.bennies.templates.gmadd, {
        target: game.user,
        speaker: game.user,
      });
      let chatData = {
        content: message,
      };
      if (game.settings.get('swade', 'notifyBennies')) {
        ChatMessage.create(chatData);
      }
      ui['players'].render(true);
    } else if (user.character) {
      user.character.getBenny();
    }
  }

  private static updateBenny(ev: MouseEvent) {
    const userId = (ev.target as HTMLElement).parentElement.dataset.userId;
    let user = game.users.find((user: User) => user.id == userId);
    if (user.isGM) {
      let value = user.getFlag('swade', 'bennies');
      (ev.target as HTMLElement).innerHTML = value.toString();
    } else if (user.character) {
      (ev.target as HTMLElement).innerHTML =
        user.character.data.data.bennies.value;
    }
  }

  static append(player: HTMLElement, options: any) {
    let user = options.users.find(
      (user: User) => user.id == player.dataset.userId,
    );
    let span = document.createElement('span');
    span.classList.add('bennies-count');

    // Player view
    if (!game.user.isGM) {
      if (user.isGM) {
        span.innerHTML = user.getFlag('swade', 'bennies');
      } else if (user.character) {
        span.innerHTML = user.character.data.data.bennies.value;
      } else {
        return;
      }
      player.append(span);
      return;
    }

    // GM interactive interface
    span.classList.add('bennies-gm');
    span.onmouseleave = Bennies.updateBenny;
    span.onclick = user.isGM ? this.spendEvent : this.giveEvent;
    span.onmouseover = () => {
      span.innerHTML = user.isGM ? '-' : '+';
    };
    span.title = user.isGM
      ? game.i18n.localize('SWADE.BenniesSpend')
      : game.i18n.localize('SWADE.BenniesGive');
    // Manage GM Bennies
    if (user.isGM) {
      let bennies = user.getFlag('swade', 'bennies');
      // Set bennies to number of players minus the GM
      if (bennies == null) {
        user.setFlag('swade', 'bennies', game.users.size).then(() => {
          span.innerHTML = (game.users.size - 1).toString();
          player.append(span);
        });
      } else {
        span.innerHTML = user.getFlag('swade', 'bennies');
        player.append(span);
      }
    } else if (user.character) {
      span.innerHTML = user.character.data.data.bennies.value;
      player.append(span);
    }
  }
}
