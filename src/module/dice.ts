export class SwadeDice {
  static async Roll({ parts = [], data = {}, options = {}, event = null, speaker = null, flavor = null, title = null, item = false } = {}) {

    let rollMode = game.settings.get("core", "rollMode");
    let rolled = false;
    let filtered = parts.filter(function (el) {
      return el != "" && el;
    });

    const _roll = (form = null) => {
      // Optionally include a situational bonus
      if (form !== null) data['bonus'] = form.bonus.value;
      if (data['bonus']) filtered.push(data['bonus']);

      const roll = new Roll(filtered.join(""), data).roll();
      // Convert the roll to a chat message and return the roll
      rollMode = form ? form.rollMode.value : rollMode;
      roll.toMessage({
        speaker: speaker,
        flavor: flavor
      }, { rollMode });
      rolled = true;
      return roll;
    }

    const template = "systems/swade/templates/chat/roll-dialog.html";
    let dialogData = {
      formula: filtered.join(" "),
      data: data,
      rollMode: rollMode,
      rollModes: CONFIG.rollModes
    };

    const html = await renderTemplate(template, dialogData);
    //Create Dialog window
    let roll: Roll;
    return new Promise(resolve => {
      new Dialog({
        title: title,
        content: html,
        buttons: {
          ok: {
            label: game.i18n.localize("SWADE.Ok"),
            icon: '<i class="fas fa-check"></i>',
            callback: (html) => {
              roll = _roll(html[0].children[0]);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("SWADE.Cancel"),
          },
        },
        default: "ok",
        close: () => {
          resolve(rolled ? roll : false);
        }
      }).render(true);
    });
  }


}
