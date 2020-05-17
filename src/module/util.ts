export function isIncapacitated(wounds, fatigue): boolean {
    if ((parseInt(wounds.max) > 0 && ((parseInt(wounds.value) >= parseInt(wounds.max)))) || parseInt(fatigue.value) >= parseInt(fatigue.max)) {
        return true;
    }
    return false;
}

export function setIncapacitationSymbol(data: any, html: JQuery<HTMLElement>): void {
    const container = html.find('.incap-container');
    const isIncap = isIncapacitated(data.data.wounds, data.data.fatigue);
    if (isIncap) {
        container.css('opacity', '1');
    } else {
        container.css('opacity', '0');
    }
}

export async function createActionCardTable(rebuild?: boolean, cardpack?: string): Promise<void> {
    let packName = game.settings.get('swade', 'cardDeck');
    if (cardpack) {
        packName = cardpack;
    }
    const cardPack = game.packs.get(packName) as Compendium;
    const cardPackIndex = await cardPack.getIndex() as JournalEntry[];
    let cardTable = game.tables.getName(CONFIG.SWADE.init.cardTable);

    //If the table doesn't exist, create it
    if (!cardTable) {
        const tableData = {
            name: CONFIG.SWADE.init.cardTable,
            replacement: false,
            displayRoll: false,
            description: 'Action Card',
        };
        const tableOptions = { temporary: false, renderSheet: false };
        cardTable = await RollTable.create(tableData, tableOptions) as RollTable;
    }

    //If it's a rebuild call, delete all entries and then repopulate them
    if (rebuild) {
        let deletions = cardTable.results.map(i => i._id);
        await cardTable.deleteEmbeddedEntity('TableResult', deletions);
    }

    const createData = []
    console.log(cardPackIndex)
    for (let i = 0; i < cardPackIndex.length; i++) {
        let c = cardPackIndex[i] as any;
        console.log(i, c)
        let resultData = {
            type: 2, //Set type to compendium
            text: c.name,
            img: c.img,
            collection: packName, // Name of the compendium
            resultId: c.id, //Id of the entry inside the compendium
            weight: 1,
            range: [i + 1, i + 1]
        }
        createData.push(resultData);
    }
    await cardTable.createEmbeddedEntity('TableResult', createData);
    await cardTable.normalize();
    ui.tables.render();
}