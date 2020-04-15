export class SwadeDice {
  static async Roll({
    parts = [],
    data = {},
    options = {},
    event = null,
    speaker = null,
    flavor = null
  } = {}) {
    let filtered = parts.filter(function (el) {
      return el != "" && el;
    });
    let roll = new Roll(filtered.join(" + "), data).roll();

    // Convert the roll to a chat message and return the roll
    roll.toMessage({
      speaker: speaker,
      flavor: flavor
    });
    return roll;
  }
}
