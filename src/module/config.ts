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
    settings: [
      'enableConviction',
      'vehicleMods',
      'vehicleEdges',
      'gmBennies',
      'enableWoundPace',
    ],
  };

  public static templates = {
    preloadPromise: null,
    templatesPreloaded: false,
  };

  public static statusEffects = [
    {
      icon: 'systems/swade/assets/icons/status/status_aiming.svg',
      id: 'aiming',
      label: 'SWADE.Aiming',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_enraged.svg',
      id: 'berserk',
      label: 'SWADE.Berserk',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_defending.svg',
      id: 'defending',
      label: 'SWADE.Defending',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_flying.svg',
      id: 'flying',
      label: 'SWADE.Flying',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_holding.svg',
      id: 'holding',
      label: 'SWADE.Holding',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_bound.svg',
      id: 'bound',
      label: 'SWADE.Bound',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_entangled.svg',
      id: 'entangled',
      label: 'SWADE.Entangled',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_frightened.svg',
      id: 'frightened',
      label: 'SWADE.Frightened',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_distracted.svg',
      id: 'distracted',
      label: 'SWADE.Distr',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_encumbered.svg',
      id: 'encumbered',
      label: 'SWADE.Encumbered',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_prone.svg',
      id: 'prone',
      label: 'SWADE.Prone',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_stunned.svg',
      id: 'stunned',
      label: 'SWADE.Stunned',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_vulnerable.svg',
      id: 'encumbered',
      label: 'SWADE.Vuln',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_bleeding_out.svg',
      id: 'bleeding-out',
      label: 'SWADE.BleedingOut',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_diseased.svg',
      id: 'diseased',
      label: 'SWADE.Diseased',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_heart_attack.svg',
      id: 'heart-attack',
      label: 'SWADE.HeartAttack',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_on_fire.svg',
      id: 'on-fire',
      label: 'SWADE.OnFire',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_poisoned.svg',
      id: 'poisoned',
      label: 'SWADE.Poisoned',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_cover_shield.svg',
      id: 'cover-shield',
      label: 'SWADE.CoverShield',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_cover.svg',
      id: 'cover',
      label: 'SWADE.Cover',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_reach.svg',
      id: 'reach',
      label: 'SWADE.Reach',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_torch.svg',
      id: 'torch',
      label: 'SWADE.Torch',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_invisible.svg',
      id: 'invisible',
      label: 'SWADE.Invisible',
    },
    {
      icon: 'systems/swade/assets/icons/status/status_smite.svg',
      id: 'smite',
      label: 'SWADE.Smite',
    },
  ];
}
