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

  public static statusIcons = {
    shaken: 'icons/svg/daze.svg',
    vulnerable: 'icons/svg/degen.svg',
    distracted: 'icons/svg/stoned.svg',
  };

  public static init = {
    defaultCardCompendium: 'swade.action-cards',
    cardTable: 'Action Cards',
  };

  public static packChoices = {};

  public static imagedrop = {
    height: 300,
  };

  public static vehicles = {
    maxHandlingPenalty: -4,
  };
}
