export function isIncapacitated(wounds, fatigue): boolean {
    if ((parseInt(wounds.max) > 0 && ((parseInt(wounds.value) >= parseInt(wounds.max)))) || parseInt(fatigue.value) >= parseInt(fatigue.max)) {
        return true;
    }
    return false;
}

export function setIncapacitationSymbol(data: any, html: JQuery<HTMLElement>): void {
    const container = html.find('.incap-container');
    const isIncap = isIncapacitated(data.data.wounds, data.data.fatigue);
    console.log(isIncap);
    if (isIncap) {
        container.css('opacity', '1');
    } else {
        container.css('opacity', '0');
    }
}