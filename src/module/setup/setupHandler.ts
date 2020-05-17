export async function swadeSetup(): Promise<void> {

    const packName = CONFIG.SWADE.init.cardCompendium;
    if (game.tables.getName('Action Cards')) {
        return;
    }

    const cardPack = game.packs.get(packName) as Compendium;
    const cardPackIndex = await cardPack.getIndex() as JournalEntry[];
    const tableData = {
        name: 'Action Cards',
        replacement: false,
        displayRoll: false,
        description: 'Action Card',
        formula: '1d54'
    };

    const tableOptions = { temporary: false, renderSheet: false };
    const table = await RollTable.create(tableData, tableOptions) as RollTable;

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
    await table.createEmbeddedEntity('TableResult', createData);
    ui.tables.render();
    ui.notifications.info('First-Time-Setup complete');
}