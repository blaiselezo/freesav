export class ExtraSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['swade', 'sheet', 'character'],
            width: 600,
            height: 768
        });
    }

    get template() {
        // Later you might want to return a different template
        // based on user permissions.
        return 'systems/swade/templates/actors/extra-sheet.html';
    }

    activateListeners(html): void {
        super.activateListeners(html);
        // This is called once your template has rendered.
        // You have access to the newly-rendered HTML and can
        // add event listeners here.
    }

    getData() {
        const data = super.getData();
        // Add any special data that your template needs here.
        return data;
    }
}
