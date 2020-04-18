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

## [0.6.0]

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
