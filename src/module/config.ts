export const SWADE = {
  ASCII: `
  ███████╗██╗    ██╗ █████╗ ██████╗ ███████╗
  ██╔════╝██║    ██║██╔══██╗██╔══██╗██╔════╝
  ███████╗██║ █╗ ██║███████║██║  ██║█████╗  
  ╚════██║██║███╗██║██╔══██║██║  ██║██╔══╝  
  ███████║╚███╔███╔╝██║  ██║██████╔╝███████╗
  ╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝`,

  attributes: {
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
  },

  init: {
    defaultCardCompendium: 'swade.action-cards',
    cardTable: 'Action Cards',
  },

  packChoices: {},

  imagedrop: {
    height: 300,
  },

  bennies: {
    templates: {
      refresh: 'systems/swade/templates/chat/benny-refresh.html',
      refreshAll: 'systems/swade/templates/chat/benny-refresh-all.html',
      add: 'systems/swade/templates/chat/benny-add.html',
      spend: 'systems/swade/templates/chat/benny-spend.html',
      gmadd: 'systems/swade/templates/chat/benny-gmadd.html',
      joker: 'systems/swade/templates/chat/jokers-wild.html',
    },
    sheetImage: 'systems/swade/assets/bennie.webp',
    textures: {
      front: 'systems/swade/assets/benny/benny-chip-front.png',
      back: 'systems/swade/assets/benny/benny-chip-front.png',
    },
  },

  vehicles: {
    maxHandlingPenalty: -4,
    opSkills: ['', 'Boating', 'Driving', 'Piloting', 'Riding'],
  },

  settingConfig: {
    id: 'settingConfig',
    title: 'SWADE Setting Rule Configurator',
    settings: [
      'enableConviction',
      'jokersWild',
      'parryBaseSkill',
      'vehicleMods',
      'vehicleEdges',
      'gmBennies',
      'enableWoundPace',
      'ammoManagement',
      'ammoFromInventory',
      'npcAmmo',
      'vehicleAmmo',
    ],
  },

  diceConfig: {
    id: 'diceConfig',
    title: 'SWADE Dice Settings',
    flags: {},
  },

  templates: {
    preloadPromise: null,
    templatesPreloaded: false,
  },

  statusEffects: [
    {
      icon: 'systems/swade/assets/icons/status/status_shaken.svg',
      id: 'shaken',
      label: 'SWADE.Shaken',
    },
    {
      icon: 'icons/svg/skull.svg',
      id: 'incapacitated',
      label: 'SWADE.Incap',
    },
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
      changes: [
        {
          key: 'data.stats.parry.modifier',
          value: 4,
          mode: 2,
        },
      ],
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
      id: 'vulnerable',
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
    {
      icon: 'systems/swade/assets/icons/status/status_protection.svg',
      id: 'protection',
      label: 'SWADE.Protection',
      changes: [
        {
          key: 'data.stats.toughness.value',
          value: 0,
          mode: 2,
        },
        {
          key: 'data.stats.toughness.armor',
          value: 0,
          mode: 2,
        },
      ],
    },
  ],

  wildCardIcons: {
    regular: 'systems/swade/assets/ui/wildcard.svg',
    compendium: 'systems/swade/assets/ui/wildcard-dark.svg',
  },

  dsnColorSets: {},

  dsnTextureList: {},

  raceLocalizationKey: 'SWADE.Race',
};
