declare interface Roll {
  options: any;
}

declare interface Scenes {
  active: any;
}

declare interface BaseEntityData {
  data: any;
}

declare interface Die {
  formula: any;
}

declare interface ChatMessage {
  isContentVisible: boolean
}

declare interface ItemSheetData {
  config: any;
}

declare interface ActorSheet {
  _createEditor(target: any, editorOptions: any, initialContent: any): any;
}

declare class TextEditor {
  public static enrichHTML(template: string, data: any): any;
}