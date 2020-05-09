/**
* Roll initiative for one or multiple Combatants within the Combat entity
* @param {Array|string} ids        A Combatant id or Array of ids for which to roll
* @param {string|null} formula     A non-default initiative formula to roll. Otherwise the system default is used.
* @param {Object} messageOptions   Additional options with which to customize created Chat Messages
* @return {Promise.<Combat>}       A promise which resolves to the updated Combat entity once updates are complete.
*/
export const rollInitiative = async function (ids: string[] | string, formula: string | null, messageOptions: any) {
    const actionCardDeck = game.tables.getName('Action Cards') as RollTable;

    // Structure input data
    ids = typeof ids === 'string' ? [ids] : ids;

    const combatantUpdates = [];
    const initMessages = [];
    let soundAttached = false;

    if (ids.length > actionCardDeck.results.filter(r => !r.drawn).length) {
        ui.notifications.warn('There are not enough cards left in the deck!');
        return;
    }

    // Iterate over Combatants, performing an initiative draw for each
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        // Get Combatant data
        let c = await this.getCombatant(id);
        if (c.flags.swade && c.flags.swade.cardValue != null) console.log('This must be a reroll');

        //Do not draw cards for defeated combatants
        if (c.defeated) continue;

        // Set up edges
        let cardsToDraw = 1;
        if (c.actor.data.data.initiative.hasLevelHeaded) cardsToDraw = 2;
        if (c.actor.data.data.initiative.hasImpLevelHeaded) cardsToDraw = 3;
        const hasQuick = c.actor.data.data.initiative.hasQuick;
        const hasHesitant = c.actor.data.data.initiative.hasHesitant;

        // Draw initiative
        let card;
        if (hasHesitant) { // Hesitant Stuff
            const cards = await drawCard(2) as any[];
            card = cards[0];
            console.log('hesitant', card);
        } else if (hasQuick && cardsToDraw === 1) { //quick Stuff
            do {
                const cards = await drawCard() as any[];
                card = cards[0];
                console.log('quick', card);
            } while (card.flags.swade.cardValue < 6);
        } else if (cardsToDraw > 1) { //Level Headed stuff
            const cards = await drawCard(cardsToDraw) as any[];
            card = cards[0];
            console.log('level headed', cards);
        } else {//normal card stuff
            const cards = await drawCard() as any[];
            console.log(cards)
            card = cards[0];
            console.log('normal', card);
        }
        const newflags = {
            suitValue: card.flags.swade.suitValue,
            cardValue: card.flags.swade.cardValue,
            hasJoker: card.flags.swade.isJoker,
            cardString: card.content
        }
        const initValue = '' + card.flags.swade.suitValue + card.flags.swade.cardValue;
        combatantUpdates.push({
            _id: c._id, initiative: initValue, 'flags.swade': newflags
        });

        // Construct chat message data
        const messageData = mergeObject({
            speaker: {
                scene: canvas.scene._id,
                actor: c.actor ? c.actor._id : null,
                token: c.token._id,
                alias: c.token.name,
            },
            whisper: (c.token.hidden || c.hidden) ? game.users.filter((u: User) => u.isGM) : '',
            flavor: c.token.name + game.i18n.localize('SWADE.InitDraw'),
            content: `<div class="table-result"><img class="result-image" src="${card.img}"><h4 class="result-text">@Compendium[swade.action-cards.${card._id}]{${card.name}}</h4></div>`
        }, messageOptions);
        if (game.settings.get('swade', 'initiativeSound') && !soundAttached) {
            soundAttached = true;
            messageData.sound = 'systems/swade/assets/card-flip.wav'
        }
        initMessages.push(messageData);
    }
    if (!combatantUpdates.length) return this;

    // Update multiple combatants
    await this.updateEmbeddedEntity('Combatant', combatantUpdates);
    // Create multiple chat messages
    await ChatMessage.create(initMessages);
    // Return the updated Combat
    return this;
}

export const setupTurns = function () {
    const scene = game.scenes.get(this.data.scene, { strict: true });
    const players = game.users.players;
    // Populate additional data for each combatant
    let turns = this.data.combatants.map(c => {
        c.token = scene.getEmbeddedEntity('Token', c.tokenId, { strict: false });
        if (!c.token) return c;
        c.actor = Actor.fromToken(new Token(c.token, scene));
        c.players = c.actor ? players.filter(u => c.actor.hasPerm(u, 'OWNER')) : [];
        c.owner = game.user.isGM || (c.actor ? c.actor.owner : false);
        c.visible = c.owner || !c.hidden;
        return c;
    }).filter(c => c.token);
    // Sort turns into initiative order: (1) Card Value, (2) Card Suit
    turns = turns.sort((a, b) => {
        if (a.flags.swade && b.flags.swade) {
            const cardA = a.flags.swade.cardValue;
            const cardB = b.flags.swade.cardValue;
            let card = cardB - cardA;
            if (card !== 0) return card;
            const suitA = a.flags.swade.suitValue;
            const suitb = b.flags.swade.suitValue;
            let suit = suitb - suitA;
            return suit;
        }
        let [an, bn] = [a.token.name || '', b.token.name || ''];
        let cn = an.localeCompare(bn);
        if (cn !== 0) return cn;
        return a.tokenId - b.tokenId;
    });
    // Ensure the current turn is bounded
    this.data.turn = Math.min(turns.length - 1, Math.max(this.data.turn, 0));
    this.turns = turns;
    // When turns change, tracked resources also change
    if (ui.combat) ui.combat.updateTrackedResources();
    return this.turns;
}

const drawCard = async function (count?: number): Promise<JournalEntry[]> {
    const actionCardDeck = game.tables.getName('Action Cards') as RollTable;
    const actionCardPack = game.packs.find(p => p.collection === 'swade.action-cards');
    const cards = []
    if (!count) count = 1;

    for (let i = 0; i < count; i++) {
        const drawResult = await actionCardDeck.roll();
        await actionCardDeck.updateEmbeddedEntity('TableResult', { _id: drawResult[1]._id, drawn: true });
        const pack = await actionCardPack.getIndex();
        const lookUpCard = pack.find(c => c.name === drawResult[1].text);
        cards.push(await actionCardPack.getEntry(lookUpCard._id) as JournalEntry);
    }
    return cards;
}