/**
* Roll initiative for one or multiple Combatants within the Combat entity
* @param {Array|string} ids        A Combatant id or Array of ids for which to roll
* @param {string|null} formula     A non-default initiative formula to roll. Otherwise the system default is used.
* @param {Object} messageOptions   Additional options with which to customize created Chat Messages
* @return {Promise.<Combat>}       A promise which resolves to the updated Combat entity once updates are complete.
*/
export const rollInitiative = async function (ids: string[] | string, formula: string | null, messageOptions: any) {

    const actionCardDeck = game.tables.entities.find(t => t.getFlag("swade", "isActionCardDeck")) as RollTable;
    const actionCardPack = game.packs.find(p => p.collection === "swade.action-cards");

    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant._id;

    const combatantUpdates = [];
    const initMessages = [];
    let jokerDrawn = false;
    let jokerMessage: any;

    if (ids.length > actionCardDeck.results.filter(r => !r.drawn).length) {
        ui.notifications.warn('There are not enough cards left in the deck!');
        return;
    }

    // Iterate over Combatants, performing an initiative roll for each
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        // Get Combatant data
        let c = this.getCombatant(id);
        // Draw initiative
        const drawResult = await actionCardDeck.roll();
        const card = await actionCardPack.getEntry(drawResult[1].resultId);
        // Set drawn Object to drawn
        await actionCardDeck.updateEmbeddedEntity('TableResult', { _id: drawResult[1]._id, drawn: true });

        if (card.flags.actionCard.isJoker) {
            jokerDrawn = true;
            jokerMessage = mergeObject({
                speaker: {
                    scene: canvas.scene._id,
                    actor: c.actor ? c.actor._id : null,
                    token: c.token._id,
                    alias: c.token.name
                },
                whisper: (c.token.hidden || c.hidden) ? game.users.entities.filter((u: User) => u.isGM) : "",
                content: c.token.name + game.i18n.localize("SWADE.JokersWild")
            }, messageOptions);
        }
        const newflags = mergeObject(card.flags, { actionCard: { cardString: card.content } });
        const initValue = "" + card.flags.actionCard.suitValue + card.flags.actionCard.cardValue;
        combatantUpdates.push({
            _id: c._id, initiative: initValue, flags: newflags
        });
        // Construct chat message data
        const messageData = mergeObject({
            speaker: {
                scene: canvas.scene._id,
                actor: c.actor ? c.actor._id : null,
                token: c.token._id,
                alias: c.token.name,
            },
            whisper: (c.token.hidden || c.hidden) ? game.users.entities.filter((u: User) => u.isGM) : "",
            flavor: c.token.name + game.i18n.localize("SWADE.InitDraw"),
            content: `<div class="table-result"><img class="result-image" src="${card.img}"><h4 class="result-text">@Compendium[swade.action-cards.${card._id}]{${card.name}}</h4></div>`
        }, messageOptions);
        if (game.settings.get('swade', 'initiativeSound') && i === 0) {
            messageData.sound = "systems/swade/assets/card-flip.wav"
        }
        initMessages.push(messageData);
    }
    if (!combatantUpdates.length) return this;
    if (jokerDrawn) {
        initMessages.push(jokerMessage);
    }

    // Update multiple combatants
    await this.updateManyEmbeddedEntities("Combatant", combatantUpdates);
    // Ensure the turn order remains with the same combatant
    await this.update({ turn: this.turns.findIndex(t => t._id === currentId) });
    // Create multiple chat messages
    await ChatMessage.createMany(initMessages);
    // Return the updated Combat
    return this;
}

export const setupTurns = function () {
    const scene = game.scenes.get(this.data.scene, { strict: true });
    const players = game.users.players;
    // Populate additional data for each combatant
    let turns = this.data.combatants.map(c => {
        c.token = scene.getEmbeddedEntity("Token", c.tokenId, { strict: true });
        if (!c.token) return c;
        c.actor = Actor.fromToken(new Token(c.token, scene));
        c.players = c.actor ? players.filter(u => c.actor.hasPerm(u, "OWNER")) : [];
        c.owner = game.user.isGM || (c.actor ? c.actor.owner : false);
        c.visible = c.owner || !c.hidden;
        return c;
    }).filter(c => c.token);

    // Sort turns into initiative order: (1) Card Value, (2) Card Suit
    turns = turns.sort((a, b) => {
        if (a.flags.actionCard && b.flags.actionCard) {
            const cardA = a.flags.actionCard.cardValue;
            const cardB = b.flags.actionCard.cardValue;
            let card = cardB - cardA;
            if (card !== 0) return card;
            const suitA = a.flags.actionCard.suitValue;
            const suitb = b.flags.actionCard.suitValue;
            let suit = suitb - suitA;
            return suit;
        }
    });
    // Ensure the current turn is bounded
    this.data.turn = Math.min(turns.length - 1, Math.max(this.data.turn, 0));
    this.turns = turns;
    // When turns change, tracked resources also change
    if (ui.combat) ui.combat.updateTrackedResources();
    return this.turns;
}