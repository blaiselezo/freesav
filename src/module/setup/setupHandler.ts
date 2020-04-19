export async function swadeSetup(): Promise<void> {

    const packName = "swade.action-cards";
    if (game.tables.entities.find(t => t.getFlag("swade", "isActionCardDeck"))) {
        return;
    }

    const cardPack = await game.packs.find(p => p.collection === packName).getIndex() as any[];
    const tableData = {
        name: "Action Cards",
        replacement: false,
        displayRoll: false,
        type: "base",
        types: "base",
    };

    const tableOptions = { temporary: false, renderSheet: false };
    const table = await RollTable.create(tableData, tableOptions) as RollTable;

    table.setFlag("swade", "isActionCardDeck", true);

    for (let index = 0; index < cardPack.length; index++) {
        let c = cardPack[index];
        let resultData = {
            type: 2, //Set type to compendium
            text: c.name,
            img: c.img,
            collection: packName, // Name of the compendium
            resultId: c.id, //Id of the entry inside the compendium
            weight: 1,
            range: [index + 1, index + 1]
        }
        await table.createEmbeddedEntity("TableResult", resultData)
    }

    await table.normalize();
    ui.tables.render();
    game.tables.insert(table);
    ui.notifications.info("First-Time-Setup complete");
}