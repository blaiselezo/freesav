export class SwadeDice {
    static async Roll({parts=[], data={}, event={}, template=null, title=null, speaker=null, flavor=null}={}) {
            let roll = new Roll(parts.join(" + "), data).roll();
            // Convert the roll to a chat message and return the roll
            roll.toMessage({
              speaker: speaker,
              flavor: flavor
            });
            return roll;
        }
}