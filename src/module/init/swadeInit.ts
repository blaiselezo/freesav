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
    let isRedraw = false;

    if (ids.length > actionCardDeck.results.filter(r => !r.drawn).length) {
        ui.notifications.warn('There are not enough cards left in the deck!');
        return;
    }

    // Iterate over Combatants, performing an initiative draw for each
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];

        // Get Combatant data
        let c = await this.getCombatant(id);
        if (c.flags.swade && c.flags.swade.cardValue != null) {
            console.log('This must be a reroll');
            isRedraw = true;
        }

        //Do not draw cards for defeated combatants
        if (c.defeated) continue;

        // Set up edges
        let cardsToDraw = 1;
        if (c.actor.data.data.initiative.hasLevelHeaded) cardsToDraw = 2;
        if (c.actor.data.data.initiative.hasImpLevelHeaded) cardsToDraw = 3;
        const hasHesitant = c.actor.data.data.initiative.hasHesitant;

        // Draw initiative
        let card;
        if (isRedraw) {
            const cards = await drawCard();
            card = cards[0] as any;
        } else {
            if (hasHesitant) { // Hesitant
                const cards = await drawCard(2) as any[];
                if (cards.filter(c => c.flags.swade.isJoker).length > 0) {
                    card = await pickACard(cards, c.name);
                } else {
                    cards.sort((a, b) => { //sort cards to pick the lower one
                        const cardA = a.flags.swade.cardValue;
                        const cardB = b.flags.swade.cardValue;
                        let card = cardA - cardB;
                        if (card !== 0) return card;
                        const suitA = a.flags.swade.suitValue;
                        const suitB = b.flags.swade.suitValue;
                        let suit = suitA - suitB;
                        return suit;
                    });
                    card = cards[0];
                }
            } else if (cardsToDraw > 1) { //Level Headed
                const cards = await drawCard(cardsToDraw);
                card = await pickACard(cards, c.name) as any;
            } else {//normal card draw
                const cards = await drawCard();
                card = cards[0] as any;
            }
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
        const template = `
        <div class="table-draw">
            <ol class="table-results">
                <li class="table-result flexrow">
                    <img class="result-image" src="${card.img}">
                    <h4 class="result-text">@Compendium[swade.action-cards.${card._id}]{${card.name}}</h4>
                </li>
            </ol>
        </div>
        `

        const messageData = mergeObject({
            speaker: {
                scene: canvas.scene._id,
                actor: c.actor ? c.actor._id : null,
                token: c.token._id,
                alias: c.token.name,
            },
            whisper: (c.token.hidden || c.hidden) ? game.users.entities.filter((u: User) => u.isGM) : '',
            flavor: c.token.name + game.i18n.localize('SWADE.InitDraw'),
            content: template
        }, messageOptions);
        initMessages.push(messageData);
    }
    if (!combatantUpdates.length) return this;

    // Update multiple combatants
    await this.updateEmbeddedEntity('Combatant', combatantUpdates);
    // Create multiple chat messages

    if (game.settings.get('swade', 'initiativeSound')) {
        AudioHelper.play({ src: 'systems/swade/assets/card-flip.wav', volume: 0.8, autoplay: true, loop: false }, true);
    }

    if (game.settings.get('swade', 'initMessage')) {
        await ChatMessage.create(initMessages);
    }
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
    // Sort turns into initiative order: (1) Card Value, (2) Card Suit, (3) Token Name, (4) Token ID
    turns = turns.sort((a, b) => {
        if (a.flags.swade && b.flags.swade) {
            const cardA = a.flags.swade.cardValue;
            const cardB = b.flags.swade.cardValue;
            let card = cardB - cardA;
            if (card !== 0) return card;
            const suitA = a.flags.swade.suitValue;
            const suitB = b.flags.swade.suitValue;
            let suit = suitB - suitA;
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
    const actionCardPack = game.packs.get('swade.action-cards') as Compendium;
    const cards: JournalEntry[] = [];
    if (!count) count = 1;

    const drawResult = await actionCardDeck.drawMany(count, { displayChat: false });
    const pack = await actionCardPack.getIndex();
    for (let e of drawResult.results) {
        const lookUpCard = pack.find(c => c.name === e.text);
        cards.push(await actionCardPack.getEntry(lookUpCard._id) as JournalEntry);
    }
    return cards;
}

const pickACard = async function (cards: JournalEntry[], combatantName?: string): Promise<JournalEntry> {
    // any card

    // sort the cards for display
    const sortedCards = cards.sort((a: any, b: any) => {
        const cardA = a.flags.swade.cardValue;
        const cardB = b.flags.swade.cardValue;
        let card = cardB - cardA;
        if (card !== 0) return card;
        const suitA = a.flags.swade.suitValue;
        const suitB = b.flags.swade.suitValue;
        let suit = suitB - suitA;
        return suit;
    });

    let card = null;
    const template = 'systems/swade/templates/initiative/choose-card.html';
    const html = await renderTemplate(template, { cards: sortedCards });

    return new Promise(resolve => {
        new Dialog({
            title: `Pick a card ${combatantName}`,
            content: html,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize('SWADE.Ok'),
                    callback: (html: JQuery<HTMLElement>) => {
                        const choice = html.find('input[name=card]:checked')
                        const cardId = choice.data('card-id') as string;
                        if (typeof cardId !== 'undefined') {
                            card = cards.find(c => c._id === cardId);
                        }
                    }
                }
            },
            close: () => {
                //if no card has been chosen then choose first in array
                if (card === null || typeof card === 'undefined') {
                    console.log('no card selected');
                    card = cards[0]; //If no card was selected, assign the first card that was drawn
                }
                resolve(card);
            }
        }).render(true);
    });
}