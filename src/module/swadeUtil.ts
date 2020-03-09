import { Die } from "../interfaces/IDie";

export class SwadeUtil {

    static parseDie(dieFormula: string): Die {
        let die = new Die();
        let values = dieFormula.split('d'); // first split of die, get amount and a string of sides and modifiers
        if (values.length !== 1) { // if the split array is not equal 1 then it's assumed it's a valid die
            die.amount = parseInt(values[0]);
            let arr = values[1].split(/(?=[+-]\d)/); // extract sides and modifiers
            die.sides = parseInt(arr.shift()); // shift sides out of the array so only modifiers remain
            die.modifiers = arr;
            arr.forEach(mod => { // add up all modifiers
                die.modifier += parseInt(mod);
            });
        } else { // do this if the first split did not deliver a valid die
            throw TypeError("Not valid dice!");
        }
        return die;
    }

}