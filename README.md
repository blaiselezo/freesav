# The Official _Savage Worlds_ Game System for Foundry Virtual Tabletop

_by Pinnacle Entertainment Group, Inc._

<div align="center">

<img title="Minimum core version" src="https://img.shields.io/badge/dynamic/json?url=https://gitlab.com/peginc/swade/-/raw/master/src/system.json&label=core&query=minimumCoreVersion&suffix=%2B&style=flat-square&color=important">
<img title="Latest compatible version" src="https://img.shields.io/badge/dynamic/json?url=https://gitlab.com/peginc/swade/-/raw/master/src/system.json&label=compatible&query=compatibleCoreVersion&style=flat-square&color=important">
<img src="https://img.shields.io/badge/dynamic/json?url=https://gitlab.com/peginc/swade/-/raw/master/src/system.json&label=version&query=version&style=flat-square&color=success">


![Savage Worlds Adventure Edition for Foundry Virtual Tabletop](https://gitlab.com/peginc/swade/-/raw/master/images/logos/SWADE_FVTT.png)

</div>

This game system supports and enhances the play experience of _Savage Worlds Adventure Edition_ in [Foundry VTT](https://foundryvtt.com/).

<div align="center">

![Chat cards in action](https://gitlab.com/peginc/swade/-/raw/master/images/chat-cards.gif)

</div>

Designed to feel at home among the pages of the core rules, the character sheet offers a refreshed design, UI improvements, and additional features to streamline and improve your game.

<div align="center">

![New Character Sheet Design](https://gitlab.com/peginc/swade/-/raw/master/images/new-sheet-design.gif)

</div>

Those who use the popular [_Dice So Nice!_ module](https://foundryvtt.com/packages/dice-so-nice/) will see some additional “benefits” as well.

<div align="center">

![Spending a Benny](https://gitlab.com/peginc/swade/-/raw/master/images/benny.gif)

</div>

Full documentation on how to use the system and sheets as well as a collection of reference items for Hindrances, Edges, and Skills are available on the [repository wiki](https://gitlab.com/peginc/swade/-/wikis).

**Any time. Any place. _Savage Worlds_.**

## Installation Instructions

To install the SWADE system for Foundry Virtual Tabletop, simply paste the following URL into the **Install System** dialog on the Setup menu of the application.

```
https://gitlab.com/peginc/swade/-/raw/master/src/system.json
```

If you wish to manually install the system, extract it into the `Data/systems/swade` folder. You may do this by downloading a zip archive from the [Releases Page](https://gitlab.com/peginc/swade/-/releases).

## Local Build Instructions

To create a local build of the SWADE system for Foundry VTT, follow these steps:

1. If you don't Node.js installed, be sure to install the [latest Node.js LTS version](https://nodejs.org/).
1. Clone the repository and open a commandline/terminal window in the cloned the directory.
1. Run the `npm install` command to install all the required node modules, including the type definitions.
1. Set the `dataPath` in `foundryconfig.json` to your FoundryVTT data folder.
1. Either run `npm run build` in a shell in your cloned directory or run the npm script `build` directly from your IDE, such as VS Code. **Note:** you might need to run this command as admin. To do this open your terminal or IDE as admin

_Savage Worlds Adventure Edition_ should now show up in Foundry VTT as an installed game system.

**_Pinnacle Entertainment Group, Inc. is not responsible for any consequences from any modifications made to this code by the user._**

## Community Contribution

Code and content contributions are accepted. Please feel free to submit issues to the issue tracker or submit merge requests for code changes. Approval for such requests involves code and design review by the VTT Team. **Any merge requests submitted must be submitted with `develop` as the target branch. Merge requests that target the `master` branch will be rejected or ignored.**

Please reach out in the `#swade` channel on the [Foundry VTT Discord server](https://discord.gg/foundryvtt) with any questions.

## FAQ

[Read the FAQ](/FAQ.md) for questions not answered above.

## License Notice

Pinnacle Entertainment Group, Inc. reserves the rights for the following assets in this repository and any game system built from it. The assets are only to be used in Foundry VTT for the purpose of playing _Savage Worlds Adventure Edition_

- d4.svg
- d6.svg
- d8.svg
- d10.svg
- d12.svg
- bennie.webp
- char-bg.webp
- circle_fatigue.webp
- circle_wounds.webp
- header_bg.webp
- main_bg.webp
- peg_logo.webp
- sheet_armor.svg
- sheet_parry.svg
- sheet_toughness.svg
- skills_bg.webp
- skills_footer.webp
- skills_header.webp
- swade_logo.webp
- benny-chip-front.png
