export class SwadeCombat extends Combat {

    /**
   * Roll initiative for one or multiple Combatants within the Combat entity
   * @param {Array|string} ids        A Combatant id or Array of ids for which to roll
   * @param {string|null} formula     A non-default initiative formula to roll. Otherwise the system default is used.
   * @param {Object} messageOptions   Additional options with which to customize created Chat Messages
   * @return {Promise.<Combat>}       A promise which resolves to the updated Combat entity once updates are complete.
   */
    async rollInitiative(ids: string[] | string, formula: string | null, messageOptions: any) {

        const actionCardDeck = game.tables.entities.find(t => t.getFlag("swade", "isActionCardDeck")) as RollTable;
        const actionCardPack = game.packs.find(p => p.collection === "swade.action-cards");

        // Structure input data
        ids = typeof ids === "string" ? [ids] : ids;
        const currentId = this.combatant._id;
        // Iterate over Combatants, performing an initiative roll for each

        const combatantUpdates = [];
        const initMessages = [];

        for (let id of ids) {
            // Get Combatant data
            const c = this.getCombatant(id) as any;
            // Draw initiative
            const drawResult = await actionCardDeck.draw();
            const card = await actionCardPack.getEntity(drawResult._id);
            const initValue = "" + card.getFlag("action-card", "suit-value") + card.getFlag("action-card", "card-value");
            combatantUpdates.push({ _id: c._id, initiative: initValue });
            // Construct chat message data
            const rollMode = messageOptions.rollMode || (c.token.hidden || c.hidden) ? "gmroll" : "roll";
            let messageData = mergeObject({
                speaker: {
                    scene: canvas.scene._id,
                    actor: c.actor ? c.actor._id : null,
                    token: c.token._id,
                    alias: c.token.name
                },
                flavor: `${c.token.name} draws for Initiative!`
            }, messageOptions);
            const chatData = drawResult.toMessage(messageData, { rollMode, create: false });
            initMessages.push(chatData);
        }

        if (!combatantUpdates.length) return this;

        // Update multiple combatants
        await this.updateManyEmbeddedEntities("Combatant", combatantUpdates);
        // Ensure the turn order remains with the same combatant
        await this.update({ turn: this.turns.findIndex(t => t._id === currentId) });
        // Create multiple chat messages
        await ChatMessage.createMany(initMessages);
        // Return the updated Combat
        return this;
    }
}