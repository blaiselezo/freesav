
export class SwadeItemSheet extends ItemSheet {

    get template() {
      // Later you might want to return a different template
      // based on user permissions.
      return 'systems/swade/templates/item-sheet.html';
    }
  
    activateListeners(html) {
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