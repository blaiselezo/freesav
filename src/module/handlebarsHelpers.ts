export const registerCustomHelpers = function () {
    // Common helpers
    Handlebars.registerHelper("eq", (lh, rh) => {
        return lh == rh;
    })

    // Sheet
    Handlebars.registerHelper("localizeSkillAttribute", (attribute) => {
        return game.i18n.localize(CONFIG.SWADE.attributes[attribute]);
    });
    Handlebars.registerHelper("modifier", (str) => {
        str = str === "" || str === null ? "0" : str;
        let value = typeof str == "string" ? parseInt(str) : str;
        return value == 0 ? "" : (value > 0 ? ` + ${value}` : ` - ${-value}`);
    })

    // Chat
    // Replace formula by pretty dice
    Handlebars.registerHelper("formatRoll", (formula) => {
        console.log(formula);
        // formula = formula.replace("d4x4", "d4");
        // formula = formula.replace("d6x6", "d6");
        // formula = formula.replace("d8x8", "d8");
        // formula = formula.replace("d10x10", "d10");
        // formula = formula.replace("d12x12", "d12");
        return "formula";
    })
}