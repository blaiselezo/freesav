import { Die } from "../interfaces/IDie";

export class SwadeUtil {

    static parseDie(dieFormula: string): Die {
        let die = new Die();
        let values: string[] = [];
        dieFormula = dieFormula.replace(/\s/g, ""); // remove all whitespaces from the string

        values = dieFormula.split('d');
        let sidesModifiers: string[] = values[1].split(/[+-]\d/);
        die.amount = parseInt(values[0]);
        die.sides = Number(sidesModifiers.shift());

        if (sidesModifiers.length === 0) {
            die.modifier = 0;
        } else {
            //add up all modifiers
        }
        console.log(sidesModifiers);
        die.modifier = 0;
        return die;
    }

}