# SWADE System API

THIS IS A WORK IN PROGRESS

## SWADE Hooks

- ### `swadeChatCard(actor, item, html, userId)`
  Called when a new chat card is created. Contains the chat card author's actor, the item, and the html of the card.
- ### `swadeAction(actor, item, action, roll, userId)`
  Called when an action is called on an item card. Contains information about the chat card, the action, and the roll.
