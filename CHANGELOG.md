# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/)

<!--
## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
-->

## [Unreleased v0.11.0]

### Added

- Added Classification field to Vehicle Sheet
- Added `calcToughness` function to `SwadeActor` class, that calculates the toughness and then returns the value as a number
- Added auto-calculation to toughness if armor is changed or something about the vigor die is changed.
- Added `isWildcard` getter to `SwadeActor` class
- Added Group Rolls for NPC Extras
- Added `currentShots` property to `weapons`. Addjusted sheets accordingly
- Added Setting Configurator in the Settings
- Added Capability to create custom stats.
  - To use custom stats, create them in the Setting Configurator, then enable them in the Actor/Item Tweaks
  - These custom stats are available on the following sheets: Character, NPC, Weapon, Armor, Shield, Gear
  - **Attention**: Due to a quirk in Foundry's update logic I recommend you only edit unlinked actors in the sidebar and then replace existing tokens that exist on the map with new ones from the side bar
- Added ability to automatically calculate toughness, including armor. This is determined by a toggle in the Actor Tweaks and does not work for Vehicles. The Toughness input field is not editable while automatic toughness calculation is active.
- Added Powers Tab back into NPC Sheets
- On character sheets, added quantity notation to most inventory entries

### Changed

- Parry and Pace fields now accept non-numerical inputs
- Power sheet now acceptsnon-numerical input for Power Points
- NPC Hindrances now only show the Major keyword, no longer Minor
- Updated german localization (thanks to KarstenW for that one)
- Changed size of status tickbox container from `100px` to `120px` to allow for longer words
- Re-enabled the Arcane Background toggle on Edges, when they are owned

### Deprecated

- Started deprecation of `SwadeActor.configureInitiative()` function. It will be fully removed with v0.12.0

### Removed

- Removed Status icon two-way binding
- Removed Notes column for misc. Items in the character sheet inventory

### Fixed

- Fixed a bug that would remove fatigue of max wounds was set to 0 on NPC sheets
- Fixed a small bug that would prevent item deletion from NPC sheets
- Fixed a small bug which would cause wound penalties on vehicles to register as a bonus instead
- Fixed a small bug which allowed observers to roll Attribute tests

## [v0.10.2]

### Added

- Added Source code option to advancement tracker editor

### Changed

- Removed armor calculation from NPC actors as it is a likely culprit for a bug. Proper solution to follow

## [v0.10.1]

### Fixed

- Fixed a bug that would cause Drag&Drop macros from actor sheets to be cloned, leading to multiple identical macros on the hotbar (identical in ID too), which could lead to players having macros they couldn't interact with properly.

## [v0.10.0]

### Added

- Added Refresh All Bennies option and Message
- Added the Savage Worlds Cone shape which replaces the vanilla Foundry cone shape for rounded cones (thanks to Godna and Moerill for that one)
- `SwadeTemplate` class, which allows the creation of predefined `MeasuredTemplate`s (based on code by errational and Atropos)
- Buttons for predefined Blast and Cone Templates
- Added Vehicles
  - Added Vehicle `Actor` type
  - Added Vehicular flag to `weapon` and `gear` Items
  - Added Vehicle Sheet
    - Drag&Drop an actor to set an operator
    - Roll Maneuvering checks directly from the vehicle sheet
      - Set Maneuvering skill in the `Description` tab
- Added optional Setting Rules for Vehicles using Modslots and Vehicles using Edges/Hindrances
- Added localization options for Vehicles
- Added `makeUnskilledAttempt` method to `SwadeActor` class
- Added `rollManeuveringCheck` method to `SwadeActor` class
- Added Drag&Drop to PC powers

### Fixed

- Fixed a small bug which would cause the Action Cards deck not to reset when combat was ended in a Round in which a Joker was drawn
- Fixed a small bug which would cause Gear descriptions not to enrich properly on `Actor` sheets
- Fixed broken Drag&Drop for NPC sheets

### Changed

- Changed how many Bennies the GM gets on a refresh. The number is now configured in a setting (Default 0);
- Weapon Notes now support inline rolls and Entity linking

## [v0.9.4]

### Added

- Added some more localization options

### Changed

- Changed the card redraw dialog. It now displays the image of the card as well as a redraw button when appropriate
- Reworked the NPC sheet a bit (thanks to U~Man for that)

### Removed

- Removed the Weapons, Gear, Shields, Armor and Powers compendia due to copyright concerns

## [v0.9.3]

### Added

- Added Benny reset function for each user
  - GM Bennies are calculated based on the number of users
- Benny spend/recieve chat messages
- Added a function to calculate the valuer of the worn armor to the `SwadeActor` entity

## [v0.9.2]

### Fixed

- Fixed a bug that would prevent GMs from rerolling initiative for a given combatant

## [v0.9.1]

### Added

- Added a function to the `SwadeActor` class that calculates and sets the proper armor value
- Added checkboxes to the Armor sheets to mark hit locations

### Changed

- Renamed a few classes to make their function more easily apparent
- Changed `Conviction` Setting Rule to be compliant with SWADE 5.5
- Made Skill names multiline

## Removed

- Took away the player's option to draw their own cards, now only the GM can do that

### Fixed

- Fixed a small bug which would prevent NPCs from rolling power damage
- Fixed a small bug that would prevent multiple combat instances to work at the same time

## [v0.9.0]

### Added

- Layout rework (Thanks to U~Man)

  - Added multiple arcane support, filling the Arcane field of power items will sort it in the powers tab and gives it its own PP pool when the filter is enabled
  - Moved sheet config options (initiative, wounds) to a Tweaks dialog in the sheet header
  - Moved Race and Rank fields to the sheet header
  - Moved Size to Derived stats
  - Fixed Issue with rich HTML links not being processed in power and edge descriptions
  - Each inventory item type has relevant informations displayed in the inventory tab
  - Reworked base colors
  - Moved condition toggles and derived stats to the Summary tab
  - For PCs sheet, lists no longer overflows the sheet size.
  - For PCs sheet, power cards have a fixed size
  - Added an Advances text field above the Description
  - Changed the default item icons to stick with the new layout colors
  - Added dice icons to attributes select boxes
  - Weapon damage can be rolled in the inventory
  - Added an item edit control on NPC inventory

- Added drag&drop capability for PCs and NPCs so you can pull weapons and skills into the hotbar and create macros.
- Added a bunch of icons for skills
- Added the ability to choose cards when rerolling a card

### Changed

- Adjusted Weapon/Armor/Gear/Power Item sheets to be more compact

### Fixed

- Fixed a bug which would duplicate core skills when a PC was duplicated

## [v0.8.6] 2020-05-22

### Fixed

- Fixed Compatability with Foundry v0.6.0

## [v0.8.5] 2020-05-21

### Added

- Added Size modifier to sheet
- Added Roll Raise Button to Damage rolls which automatically applies the extra +1d6 bonus damage for a raise
- Player CHaracters will now automatically recieve the core skills.
- Added FAQ (Thanks to Tenuki Go for getting that started);
- Toggling a `npc` Actor between Wildcard and not-wildcard will link/unlink the actor data. Wildcards will become linked and Extras will become unlinked. This can still be overriden manually in the Token config. This functionality also comes with a system setting to enable/disable it
- Actors of the type `npc` will be created with their tokens not actor-linked

### Fixed

- Fixed a small bug which caused ignored wounds to behave oddly.
- Fixed duplicates and false naming in the Gear compendia (Thanks to Tenuki Go for getting that done);
- Fixed Journal image drop again
- Fixed a small bug where in-sheet created items would not have the correct icon

## [v0.8.4] 2020-05-17

### Fixed

- Fixed a small bug that would prevent the population of the Action Cards table

## [v0.8.3] 2020-05-16

### Fixed

- Fixed a small bug that would allow combat initiative to draw multiples of a card

## [v0.8.2] 2020-05-16

### Added

- Added option to turn off chat messages for Initiative
- Made Hindrance section available for Extras as well
- Made PC gear cards more responsive
- Added more i18n strings
- Compendium packs for Core Rulebook equipment (Thanks to Tanuki Go on GitLab for that)
- Added buttons to quickly add skills, equipment etc (Thanks to U~Man for that)

### Changed

- Updated SWADE for FoundryVTT 0.5.6/0.5.7

### Removed

- Removed French translation as it will become a seperate module for easier maintenance.

### Fixed

- Fixed a small bug which would cause the wrong sheet to be update if two character/npc sheets were opened at the same time.

## [v0.8.1] 2020-05-10

### Added

- Powers now have a damage field. If the field is not empty it shows up on the summary tab. Kudos to Adam on Gitlab
- Fixed an issue with Item Sheets that caused checkboxes to no longer show up
- Stat fields for NPC equimpent only show up when they actually have stats.

## [v0.8.0] 2020-05-09

### Added

- Initiative! Supports all Edges (for Quick simply use the reroll option)
- Added localization strings for Conviction
- Fields in weapon cards will now only be shown when the value isn't empty
- Ability to ignore Wounds (for example by being a `Construct` or having `Nerves of Steel`)

## Changed

- Massively changed the UI and all sheets of SWADE to make it more clean and give it more space.
- Changed data type of the `Toughness` field from `Number` to `String` so you can add armor until a better solution can be found
- Updated French translation (thanks to LeRatierBretonnien)

### Fixed

- Fixed a bug that would display a permission error for players when a token they weren't allowed to update got updated
- Status Effect binding now also works for tokens that are not linked to their base actor
- Fixed a small localization error in the Weapon item sheet
- Fixed requirements for the `Sweep` Edge
- Fixed page reference for the `Sound/Silence` Power
- Fixed an issue with Skill descriptions not being saved correctly

## [v0.7.3] 2020-05-01

### Added

- Added the option to view Item artwork by right-clicking the item image in the sheet

### Changed

- Optimnized setup code a bit

### Fixed

- Added missing Bloodthirsty Hindrance
- Fixed a spelling mistake in the `Improved Level Headed` Edge

## [v0.7.2] 2020-04-28

### Fixed

- Fixed a small bug that would cause an error to be displayed when a player opened te sheet of an actor they only had `Limited` permission on

## [v0.7.1] 2020-04-28

### Added

- Status effect penalties will now be factored into rolls made from the sheet (credit to @atomdmac on GitLab)
- Added option to turn Conviction on or off as it is an optional rule

### Fixed

- Fixed a minor spelling mistake in the german translation

## [v0.7.0] 2020-04-20

### Added

- Damage rolls can now take an `@` modifer to automatically add the attribute requested. For example `@str` will resolve to the Strength attribute, which will be added to the damage roll.
- Added Limited Sheet for NPCs. If the viewer has the `Limited` Permission they get a different sheet which only contains the character artwork, the name of the NPC and their description
- Added Confirm Dialogue when deleting items from the inventory of `character` Actors

### Changed

- Changed automated roll formula a bit to make the code more readable.

### Fixed

- Fixed a small bug where the description of an Edge or Hindrance could show up on multiple `character` sheets at once

## [0.6.1] 2020-04-20

### Added

- Trait rolls now take Wound and Fatigue penalties into account
- `Gear` Items can now be marked as equippable

### Fixed

- Added missing Damage roll option for NPC sheets

## [0.6.0] 2020-04-18

### Added

- Rolls for Attributes, Skills and Weapon Damage (kudos to U~man!)
- Checkboxes for Shaken/Distracted/Vulnerable to Character and NPC Actor sheets
- Two-Way-Binding between Token and Actor for the three status effects (Shaken/Distracted/Vulnerable)
- Setting to determine whether NPC Wildcards should be marked as Wildcards for players

### Changed

- Updated hooks to be compatible with Foundry 0.5.4/0.5.5
- More clearly marked Item description fields
- Renamed `Untrained Skill` to simply `Untrained`

### Fixed

- Power descriptions are now rendered with formatting
- Added missing `Arrogant` hindrance

## [0.5.4] 2020-04-13

### Removed

- Removed empty option from skill attribute select as every skill needs to have a linked attribute anyway

### Fixed

- Rank and Advances fields now point to the correct properties. Make sure to write down what Rank and how many advances all characters have before updating to this version

## [v0.5.3] 2020-04-11

## Added

- Added Quantity fields to relevant Item sheets
- Added Localization options for Conviction
- JournalEntry images can now be dragged onto the canvas (credit goes to U~man)

## Changed

- Changed initiative formula to `1d54`. This is temporarily while a proper Initiative system is being developed

## Fixed

- Fixed localization mistake in de.json

## [v0.5.2] 2020-04-07

### Added

- Compendiums! (Thanks to Anathema M for help there)
  - Edges
  - Hindrances
  - Skills
  - Powers
  - Action Cards (no you can't pull them onto the map, but that's gonna come in the future)
- French Localization (Thanks to Leratier Bretonnien & U~Man for that)
- Spanish Localization (Thanks to Jose Lozano for this one)

### Changed

- Upgraded Tabs to `TabsV2`
- Slight improvements to localization

## [v0.5.0] 2020-03-27

### Added

- Wildcards will now be marked with a card symbol next to their name
- Wound/Fatigue/Benny/Conviction tracking on the Wildcard Sheet
- Extra sheets!
- Polish localization. Credit goes to Piteq#5990 on Discord

### Changed

- Moved Icons to assets folder and split them into icons and UI elements
- Character Image now respects aspect ratio
- The Actor types Wildcard and Extra have been changed to Character and NPC. NPCs can be flagged as Wildcards
- Whole bunch of changes to Actor sheets for both Characters and NPCs

### Fixed

- Localization errors that caused field labels on `Weapon` and `Power` Items to disappear

## [v0.4.0] - 2020-03-12

### Added

- Full localization support for the following languages:
  - English
  - Deutsch

## [0.3.0] - 2020-03-10

### Changed

- Completely reworked how Attribute and Skill dice are handled by the data model
- Modified `wildcard` Actor sheet to fit new data model
- Modifed `skill` Item sheet to fit new data model

## [0.2.0] - 2020-03-09

### Added

- Powers support! (The sheet layout for that will be need some adjustment in the future though)
- Fleshed out Inventory tab on the Wildcard sheet
- Items of the type `Edge` can now be designated as a power Edge. If an Actor has a power Edge, the Powers tab will be automatially displayed on the Wildcard sheet
- Equip/Unequip functionality for weapons, armor and shields from the Inventory Tab
- Weapon/Armor/Shield Notes functionality added to Items/Actor Sheet Summary tab

### Changed

- Rolled `Equipment` and `Valuable` Item types into new `Gear` Item type
- Streamlined the `template.json` to better distinguish Wildcards and Extras

### Fixed

- Various code improvements and refactoring
- Finished gear cards on the Summary tab of the Actor sheets

## [0.1.0] - 2020-02-26

### Added

- Wildcard Actor sheet
- Item sheets for the following
  - Skills
  - Edges
  - Hindrances
  - Weapons
  - Armor
  - Shields
  - Powers
  - Equipment
  - Valuables
