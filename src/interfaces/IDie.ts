export class Die {
    amount: number = 0;
    sides: number = 0;
    modifier: number = 0;
    modifiers: string[] = [];

    toString(): string {
        return `[amount] = ${this.amount}\n[sides] = ${this.sides}\n[modifier] = ${this.modifier}\n[modifiers] = ${this.modifiers}`;
    }
}