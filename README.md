# Savage Worlds Adventure Edition for Foundry VTT

An implementation of the Savage Worlds Adventure Edition game system for [Foundry Virtual Tabletop](http://foundryvtt.com) under the [Savage Worlds Fans License](https://www.peginc.com/licensing/)

## Installation Instructions

> Note: The `master` branch is not functional. As long as no [releases](https://gitlab.com/florad-foundry/swade/-/releases) exist you should refer to ther *Local Build Instructions*

To install the SWADE system for Foundry Virtual Tabletop, simply paste the following URL into the **Install System**
dialog on the Setup menu of the application.

https://gitlab.com/florad-foundry/swade/raw/master/system.json

If you wish to manually install the system, you must clone (see Local Build) or extract it into the `Data/systems/swade` folder. You
may do this by cloning the repository or downloading a zip archive from the
[Releases Page](https://gitlab.com/florad-foundry/swade/-/releases).


## Local Build Instructions

To create a local build of the  SWADE system for Foundry VTT, follow these steps: 

1. Clone the repository and run `npm install` to install all the required node modules.
1. Run `npm install --save-dev gitlab:foundry-projects/foundry-pc/foundry-pc-types` to install the Foundry Type definitions
1. Set the `dataPath` in `foundryconfig.json` to your FoundryVTT data folder.
1. Either run `npm run build` in a shell in your cloned directory or run the npm script `build` directly from your IDE.
1. Done

> Note: I am not responsible for any local changes *you* make to SWADE

## Community Contribution

Code and content contributions are accepted. Please feel free to submit issues to the issue tracker or submit merge requests for code changes. 
Approval for such requests involves code and (if necessary) design review by FloRad. Please reach out on the Foundry Community Discord with any questions.

## License Notice

This game references the Savage Worlds game system, available from Pinnacle Entertainment Group at www.peginc.com. Savage Worlds and all associated logos and trademarks are copyrights of Pinnacle Entertainment Group. Used with permission. Pinnacle makes no representation or warranty as to the quality, viability, or suitability for purpose of this product.
