<div align=center>

# Savage Worlds Adventure Edition for Foundry VTT

<img title="Minimum core version" src="https://img.shields.io/badge/dynamic/json?url=https://gitlab.com/florad-foundry/swade/-/raw/master/src/system.json&label=core&query=minimumCoreVersion&suffix=%2B&style=flat-square&color=important">
<img title="Latest compatible version" src="https://img.shields.io/badge/dynamic/json?url=https://gitlab.com/florad-foundry/swade/-/raw/master/src/system.json&label=compatible&query=compatibleCoreVersion&style=flat-square&color=important">
<img src="https://img.shields.io/badge/dynamic/json?url=https://gitlab.com/florad-foundry/swade/-/raw/master/src/system.json&label=version&query=version&style=flat-square&color=success">

[![Donate via Ko-Fi](https://img.shields.io/badge/support-ko--fi-ff4646?style=flat-square&logo=ko-fi)](https://ko-fi.com/florad)
[![Twitter Follow](https://img.shields.io/badge/follow-%40FloRadical-blue.svg?style=flat-square&logo=twitter)](https://twitter.com/FloRadical)

</div>

An implementation of the Savage Worlds Adventure Edition game system for [Foundry Virtual Tabletop](http://foundryvtt.com) under the [Savage Worlds Fans License](https://www.peginc.com/licensing/)

_[Read the FAQ](/FAQ.md) for questions not answered below._

## Installation Instructions

To install the SWADE system for Foundry Virtual Tabletop, simply paste the following URL into the **Install System**
dialog on the Setup menu of the application.

https://gitlab.com/florad-foundry/swade/-/raw/master/src/system.json

If you wish to manually install the system, extract it into the `Data/systems/swade` folder.
You may do this by downloading a zip archive from the [Releases Page](https://gitlab.com/florad-foundry/swade/-/releases).

## Local Build Instructions

To create a local build of the SWADE system for Foundry VTT, follow these steps:

1. If you don't Node.js installed then install the latest Node.js LTS version from here https://nodejs.org/en/
1. Clone the repository and either change into it or open a commandline/terminal window in the cloned the directory
1. Run the `npm install` command to install all the required node modules, including the type definitions.
1. Set the `dataPath` in `foundryconfig.json` to your FoundryVTT data folder.
1. Either run `npm run build` in a shell in your cloned directory or run the npm script `build` directly from your IDE, such as VS Code. Note: you might need to run this command as admin. To do this open your terminal or IDE as admin
1. Done, swade should now show up in Foundry VTT as an installed game system

> Note: I am not responsible for any local changes _you_ make to SWADE

## Community Contribution

Code and content contributions are accepted. Please feel free to submit issues to the issue tracker or submit merge
requests for code changes. Approval for such requests involves code and (if necessary) design review by FloRad. Please
reach out on the Foundry Community Discord with any questions.

**Any merge requests submitted must be submitted with `develop` as the target branch. Merge requests that target the `master` branch will be rejected or ignored.**

## License Notice

<img src="https://www.peginc.com/wp-content/uploads/2019/01/SW_LOGO_FP_2018.png" alt="Savage Worlds Fan Product Logo" width="200">

This game references the Savage Worlds game system, available from Pinnacle Entertainment Group at www.peginc.com. Savage Worlds and all associated logos and trademarks are copyrights of Pinnacle Entertainment Group. Used with permission. Pinnacle makes no representation or warranty as to the quality, viability, or suitability for purpose of this product.
