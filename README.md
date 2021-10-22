# ProtoTech Games


## General Information
ProtoTech Games is a ProtoTech Discord bot that adds a few in-app games for users to play. The bot is currently in its earliest stages, and has much room to grow, so expect big things in the future!
### Current Commands
- /ping: pong  
- /info: Gives a general information board about the bot.  
- /game: Begins a new game.
  - /game tic-tac-toe: Begins a game of tic-tac-toe. Takes user input for the opponent (defaulting to the bot itself) and boolean input for whether the player would like to go first or second.
- /channel: Adds or removes available channels for use in the Discord server. Admin-only.
### Current Games
- Tic-Tac-Toe
### Developed In Conjunction With
- [ProtoTech Applications](https://github.com/vytross/app-bot)
 
## Change Log
### Pre-Release v0.0
#### Pre-Release v0.0.1
- Fixed some bugs in the tic-tac-toe algorithm that let the bot be beaten rather easily.
- Added 'Restart' and 'Delete' reactions for the end of games to help clean some of the thread clutter.
- Added /changelog command: Responds with a brief summary page of recent changes to the bot.
#### Pre-Release v0.0.0
- Introduced the bot to Discord!
- Added /ping command: Responds with "pong", a good way to test the bot is operating.
- Added /info command: Responds with an information board about the bot, its capabilities, and a link to this Github page.
- Added /channel command: Allows members with the "Manage Server" permission to add or remove channels that the bot can use for responding to commands.
- Added /game command: Begins a new game by creating a new thread, adding the users, and reading the script specific to the game selected.
- Added new game tic-tac-toe: A simple game for testing purposes, both for the /game system and for potential future bot capabilities in other games.
