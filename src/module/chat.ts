export async function formatRoll(chatMessage : ChatMessage, html : JQuery<HTMLHtmlElement>, data : any) {
    let roll = JSON.parse(data.message.roll);
    let chatData = {dice :[], modifiers: []};
    for(let i = 0; i < roll.parts.length; i++) {
        if (roll.parts[i].class == "DicePool") {
            // Format the dice pools
            let pool = roll.parts[i].rolls;
            let faces = 0;
            // Compute dice from the pool
            pool.forEach((pooldie: any) => {
                let color = 'black';
                faces = pooldie.dice[0].faces;
                if (pooldie.total != roll.parts[i].total) {
                    color='#676767';
                }
                if (pooldie.total > faces) {
                    color = 'green';
                }
                if (pooldie.total == 1) {
                    color = 'red';
                }
                chatData.dice.push({img:`../icons/svg/d${faces}-grey.svg`, result: pooldie.total, color: color});
            });
        } else if (typeof roll.parts[i] == "string" && roll.parts[i].substring(0, 2) == "_d") {
            // Grab the right dice
            let idice = parseInt(roll.parts[i].substring(2))
            let faces = roll.dice[idice].faces;
            let color = 'black';
            let totalDice = 0;
            roll.dice[idice].rolls.forEach((roll: any) => {totalDice += roll.roll});
            faces = roll.dice[idice].faces;
            if (totalDice > faces) {
                color = 'green';
            }
            if (totalDice == 1) {
                color = 'red';
            }
            chatData.dice.push({img:`../icons/svg/d${faces}-grey.svg`, result: totalDice, color: color});
        } else {
            chatData.modifiers.push(roll.parts[i]);
        }
    }
    // Replace default dice-formula by this custom;
    let rendered = await renderTemplate("systems/swade/templates/chat/roll-formula.html", chatData);
    let formula = html.find(".dice-formula");
    formula.replaceWith(rendered);
}