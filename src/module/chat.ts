export async function formatRoll(
  chatMessage: ChatMessage,
  html: JQuery<HTMLHtmlElement>,
  data: any
) {
  // Little helper function
  let pushDice = (chatData, total, faces) => {
    let color = "black";
    if (total > faces) {
      color = "green";
    }
    if (total == 1) {
      color = "red";
    }
    let img = null;
    if ([4,6,8,10,12,20].indexOf(faces) > -1) {
      img = `../icons/svg/d${faces}-grey.svg`;
    }
    chatData.dice.push({
      img: img,
      result: total,
      color: color,
      dice: true
    });
  };

  let roll = JSON.parse(data.message.roll);
  let chatData = { dice: [], modifiers: [] };
  for (let i = 0; i < roll.parts.length; i++) {
    if (roll.parts[i].class == "DicePool") {
      // Format the dice pools
      let pool = roll.parts[i].rolls;
      let faces = 0;
      // Compute dice from the pool
      pool.forEach((pooldie: any) => {
        faces = pooldie.dice[0].faces;
        pushDice(chatData, pooldie.total, faces);
      });
    } else if (
      typeof roll.parts[i] == "string" &&
      roll.parts[i].substring(0, 2) == "_d"
    ) {
      // Grab the right dice
      let idice = parseInt(roll.parts[i].substring(2));
      let faces = roll.dice[idice].faces;
      let totalDice = 0;
      roll.dice[idice].rolls.forEach((roll: any) => {
        totalDice += roll.roll;
      });
      faces = roll.dice[idice].faces;
      pushDice(chatData, totalDice, faces);
    } else {
      if (roll.parts[i]) {
        chatData.dice.push({img: null, result: roll.parts[i], color: 'black', dice: false});
      }
    }
  }
  // Replace default dice-formula by this custom;
  let rendered = await renderTemplate(
    "systems/swade/templates/chat/roll-formula.html",
    chatData
  );
  let formula = html.find(".dice-formula");
  formula.replaceWith(rendered);
}
