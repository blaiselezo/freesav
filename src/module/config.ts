export class SWADE {
    public static ASCII = `███████╗██╗    ██╗ █████╗ ██████╗ ███████╗
██╔════╝██║    ██║██╔══██╗██╔══██╗██╔════╝
███████╗██║ █╗ ██║███████║██║  ██║█████╗  
╚════██║██║███╗██║██╔══██║██║  ██║██╔══╝  
███████║╚███╔███╔╝██║  ██║██████╔╝███████╗
╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝`;

    public static attributes = {
        agility: 'SWADE.AttrAgi',
        smarts: 'SWADE.AttrSma',
        spirit: 'SWADE.AttrSpr',
        strength: 'SWADE.AttrStr',
        vigor: 'SWADE.AttrVig'
    };

    public static statusIcons = {
        shaken: 'icons/svg/daze.svg',
        vulnerable: 'icons/svg/degen.svg',
        distracted: 'icons/svg/stoned.svg'
    }

    public static init = {
        cardCompendium: 'swade.action-cards',
        cardTable: 'Action Cards'
    }

    public static imagedrop = {
        height: 300
    }
}