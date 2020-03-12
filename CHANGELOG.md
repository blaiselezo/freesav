# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/)

## [Unreleased]

### Added

- Full localization support for the english version

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

<!--
## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
-->

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
