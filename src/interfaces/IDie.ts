export class Die {
    amount: number;
    sides: number;
    modifier: number;

    toString(): string {

        return `[amount] = ${this.amount}\n[sides] = ${this.sides}\n[modifier] = ${this.modifier}`;

    }
}