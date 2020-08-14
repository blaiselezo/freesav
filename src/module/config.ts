export class SWADE {
  public static ASCII = `███████╗██╗    ██╗ █████╗ ██████╗ ███████╗
██╔════╝██║    ██║██╔══██╗██╔══██╗██╔════╝
███████╗██║ █╗ ██║███████║██║  ██║█████╗  
╚════██║██║███╗██║██╔══██║██║  ██║██╔══╝  
███████║╚███╔███╔╝██║  ██║██████╔╝███████╗
╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝`;

  public static attributes = {
    agility: {
      long: 'SWADE.AttrAgi',
      short: 'SWADE.AttrAgiShort',
    },
    smarts: {
      long: 'SWADE.AttrSma',
      short: 'SWADE.AttrSmaShort',
    },
    spirit: {
      long: 'SWADE.AttrSpr',
      short: 'SWADE.AttrSprShort',
    },
    strength: {
      long: 'SWADE.AttrStr',
      short: 'SWADE.AttrStrShort',
    },
    vigor: {
      long: 'SWADE.AttrVig',
      short: 'SWADE.AttrVigShort',
    },
  };

  public static init = {
    defaultCardCompendium: 'swade.action-cards',
    cardTable: 'Action Cards',
  };

  public static packChoices = {};

  public static imagedrop = {
    height: 300,
  };

  public static bennies = {
    templates: {
      refresh: 'systems/swade/templates/chat/benny-refresh.html',
      refreshAll: 'systems/swade/templates/chat/benny-refresh-all.html',
      add: 'systems/swade/templates/chat/benny-add.html',
      spend: 'systems/swade/templates/chat/benny-spend.html',
      gmadd: 'systems/swade/templates/chat/benny-gmadd.html',
    },
  };

  public static vehicles = {
    maxHandlingPenalty: -4,
  };

  public static settingConfig = {
    id: 'settingConfig',
    title: 'SWADE Setting Rule Configurator',
    settings: ['enableConviction', 'vehicleMods', 'vehicleEdges', 'gmBennies'],
  };
}
