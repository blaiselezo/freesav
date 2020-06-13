import { SwadeActor } from './SwadeActor';

export class Bennies {
  static spendEvent(ev: MouseEvent) {
    ev.preventDefault();
    const userId = (ev.target as HTMLElement).parentElement.dataset.userId;
    let user = game.users.find((user: User) => user.id == userId);
    if (user.isGM) {
      let value = user.getFlag('swade', 'bennies');
      if (value == 0) return;
      user.setFlag('swade', 'bennies', value - 1);
    } else if (user.character) {
      user.character.spendBenny();
    }
  }

  static refresh(user: User) {
    if (user.isGM) {
      user.setFlag('swade', 'bennies', game.users.size - 1);
      ui['players'].render(true);
      return;
    }
    if (user.character) {
      (user.character as SwadeActor).refreshBennies();
    }
  }

  static giveEvent(ev: MouseEvent) {
    ev.preventDefault();
    const userId = (ev.target as HTMLElement).parentElement.dataset.userId;
    let user = game.users.find((user: User) => user.id == userId);
    if (user.isGM) {
      let value = user.getFlag('swade', 'bennies');
      user.setFlag('swade', 'bennies', value + 1);
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
    let span = document.createElement('span');
    span.classList.add('player-bennies');
    span.onmouseleave = Bennies.updateBenny;
    let user = options.users.find(
      (user: User) => user.id == player.dataset.userId,
    );
    span.onclick = user.isGM ? this.spendEvent : this.giveEvent;
    span.onmouseover = () => {
      span.innerHTML = user.isGM ? '-' : '+';
    };
    span.title = user.isGM ? 'Spend a Benny' : 'Give a benny';
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
