/**
 * Override and extend the basic :class:`Item` implementation
 */
export class SwadeItem extends Item {
  /* -------------------------------------------- */
  /*	Data Preparation														*/
  /* -------------------------------------------- */

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  rollDamage(options = {}) {
    const itemData = this.data.data;
    const actorData = this.actor.data.data;
    const label = this.name;
    let parts = [itemData.damage];
    let rollMode = game.settings.get("core", "rollMode");
    let roll = new Roll(parts.join(" + "), {}).roll();
    roll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${label} ${game.i18n.localize("SWADE.Dmg")}`,
      },
      { rollMode }
    );
    return roll;
  }
}
