const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const {MessageActionRow, MessageButton} = require('discord.js');

function jsonRead(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) reject(err);
      else {
        try {
          resolve(JSON.parse(content));
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}
function jsonWrite(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
}
async function endGame(filePath, interaction) {
    const gameContents = await jsonRead(filePath);
    await fs.unlinkSync(filePath);
    const thread = interaction.channel;
    const endMessage = await thread.send({content: 'Game over! React :recycle: to restart the game or :wastebasket: to delete the thread.'});
    await endMessage.react('♻');
    await endMessage.react('🗑');

    const filter = (reaction, user) => {
        return ['♻', '🗑'].includes(reaction.emoji.name) && gameContents.playerIds.includes(user.id);
    }
    endMessage.awaitReactions({filter, max: 1, time: 300000, errors: ['time']})
        .then(async collected => {
            const reaction = collected.first();
            if (reaction.emoji.name == '🗑') {
                thread.setArchived(true);
            } else {
                const interactionMessage = interaction.message;
                await interactionMessage.delete();
                const row1 = new MessageActionRow();
                const row2 = new MessageActionRow();
                const row3 = new MessageActionRow();
                row1.addComponents(
                    new MessageButton()
                        .setCustomId('1')
                        .setEmoji('⬛')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('2')
                        .setEmoji('⬛')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('3')
                        .setEmoji('⬛')
                        .setStyle('PRIMARY'),
                );
                if (gameContents.playerIds[0] == '897287971793940481') {
                    row2.addComponents(
                        new MessageButton()
                            .setCustomId('4')
                            .setEmoji('⬛')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('5')
                            .setEmoji('🇽')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('6')
                            .setEmoji('⬛')
                            .setStyle('PRIMARY'),
                    );
                } else {
                    row2.addComponents(
                        new MessageButton()
                            .setCustomId('4')
                            .setEmoji('⬛')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('5')
                            .setEmoji('⬛')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('6')
                            .setEmoji('⬛')
                            .setStyle('PRIMARY'),
                    );
                }
                row3.addComponents(
                    new MessageButton()
                        .setCustomId('7')
                        .setEmoji('⬛')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('8')
                        .setEmoji('⬛')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('9')
                        .setEmoji('⬛')
                        .setStyle('PRIMARY'),
                );

                let messageId = 0;
                if (gameContents.playerIds[0] == '897287971793940481') {
                    const message = await thread.send({content: gameContents.playerNames[1] + '\'s turn!', components: [row1, row2, row3]});
                    messageId = message.id;
                    gameContents.moves = [{square: '5', tile: 'X'}];
                    gameContents.messageId = messageId;
                } else {
                    const message = await thread.send({content: gameContents.playerNames[0] + '\'s turn!', components: [row1, row2, row3]});
                    messageId = message.id;
                    gameContents.moves = [];
                    gameContents.messageId = messageId;
                }

                gameContents.gameOver = false;

                let data = JSON.stringify(gameContents);
                fs.writeFileSync(`commands/games/${messageId}.json`, data);
                await endMessage.delete();
            }
        });

    await jsonWrite(filePath, gameContents);
}

module.exports = {
	name: 'tic-tac-toe',
	async execute(interaction, client) {
        const gameFiles = fs.readdirSync('./commands/games').filter(file => file.endsWith('.json'));
        var gamePath;

        for (const file of gameFiles) {
            const game = require(`../commands/games/${file}`);
            if (game.messageId == interaction.message.id) {
                gamePath = path.resolve(__dirname, `../commands/games/${file}`);
            }
        }
        gameContents = await jsonRead(gamePath);
        const username = gameContents.playerNames[gameContents.moves.length % 2];
        const currentIdPos = gameContents.moves.length % 2;

        if (gameContents.gameOver) {
            return interaction.reply({content: 'The game has finished!', ephemeral: true});
        } else if (interaction.user.id != gameContents.playerIds[currentIdPos]) {
            return interaction.reply({content: 'It\'s ' + username + '\'s turn!', ephemeral: true});
        } else {
            const buttonId = interaction.customId;
            for (let i = 0; i < gameContents.moves.length; i++) {
                if (buttonId == gameContents.moves[i].square) {
                    return interaction.reply({content: 'Invalid move!', ephemeral: true});
                }
            }
            if (gameContents.moves.length % 2 == 0) {
                gameContents.moves.push({
                    square: interaction.customId,
                    tile: 'X'
                });
            } else {
                gameContents.moves.push({
                    square: interaction.customId,
                    tile: 'O'
                });
            }
        }

        var squareValues = ['⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛', '⬛'];
        for (let i = 0; i < gameContents.moves.length; i++) {
            const squareId = parseInt(gameContents.moves[i].square, 10);
            if (gameContents.moves[i].tile == 'X') {
                squareValues[squareId - 1] = '🇽';
            }
            else {
                squareValues[squareId - 1] = '🇴';
            }
        }

        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('1')
                    .setEmoji(squareValues[0])
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('2')
                    .setEmoji(squareValues[1])
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('3')
                    .setEmoji(squareValues[2])
                    .setStyle('PRIMARY'),
            );
        const row2 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('4')
                    .setEmoji(squareValues[3])
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('5')
                    .setEmoji(squareValues[4])
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('6')
                    .setEmoji(squareValues[5])
                    .setStyle('PRIMARY'),
            );
        const row3 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('7')
                    .setEmoji(squareValues[6])
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('8')
                    .setEmoji(squareValues[7])
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('9')
                    .setEmoji(squareValues[8])
                    .setStyle('PRIMARY'),
            );

        if (((squareValues[0] == squareValues[1]) && (squareValues[1] == squareValues[2]) && (squareValues[0] != '⬛')) ||
            ((squareValues[3] == squareValues[4]) && (squareValues[4] == squareValues[5]) && (squareValues[3] != '⬛')) ||
            ((squareValues[6] == squareValues[7]) && (squareValues[7] == squareValues[8]) && (squareValues[6] != '⬛')) ||
            ((squareValues[0] == squareValues[3]) && (squareValues[3] == squareValues[6]) && (squareValues[0] != '⬛')) ||
            ((squareValues[1] == squareValues[4]) && (squareValues[4] == squareValues[7]) && (squareValues[1] != '⬛')) ||
            ((squareValues[2] == squareValues[5]) && (squareValues[5] == squareValues[8]) && (squareValues[2] != '⬛')) ||
            ((squareValues[0] == squareValues[4]) && (squareValues[4] == squareValues[8]) && (squareValues[0] != '⬛')) ||
            ((squareValues[2] == squareValues[4]) && (squareValues[4] == squareValues[6]) && (squareValues[2] != '⬛'))) {
            gameContents.gameOver = true;
            interaction.update({content: gameContents.playerNames[(gameContents.moves.length - 1) % 2] + ' wins!', components: [row1, row2, row3]});
            await jsonWrite(gamePath, gameContents);
            await endGame(gamePath, interaction);
        } else if (gameContents.moves.length == 9) {
            gameContents.gameOver = true;
            interaction.update({content: 'It\'s a draw!', components: [row1, row2, row3]});
            await jsonWrite(gamePath, gameContents);
            await endGame(gamePath, interaction);
        } else if (gameContents.playerIds[gameContents.moves.length % 2] == config.clientId) {
            var botValue;
            if (gameContents.moves.length % 2 == 1) botValue = '🇴';
            else botValue = '🇽';

            var nextMove;

            if ((((squareValues[1] == squareValues[2]) && (squareValues[1] == botValue)) ||
                 ((squareValues[3] == squareValues[6]) && (squareValues[3] == botValue)) ||
                 ((squareValues[4] == squareValues[8]) && (squareValues[4] == botValue))) && (squareValues[0] == '⬛')) nextMove = 0;
            else if ((((squareValues[4] == squareValues[7]) && (squareValues[4] == botValue)) ||
                      ((squareValues[0] == squareValues[2]) && (squareValues[0] == botValue))) && (squareValues[1] == '⬛')) nextMove = 1;
            else if ((((squareValues[5] == squareValues[8]) && (squareValues[5] == botValue)) ||
                      ((squareValues[4] == squareValues[6]) && (squareValues[4] == botValue)) ||
                      ((squareValues[0] == squareValues[1]) && (squareValues[0] == botValue))) && (squareValues[2] == '⬛')) nextMove = 2;
            else if ((((squareValues[4] == squareValues[5]) && (squareValues[4] == botValue)) ||
                      ((squareValues[0] == squareValues[6]) && (squareValues[0] == botValue))) && (squareValues[3] == '⬛')) nextMove = 3;
            else if ((((squareValues[3] == squareValues[5]) && (squareValues[3] == botValue)) ||
                      ((squareValues[0] == squareValues[8]) && (squareValues[0] == botValue)) ||
                      ((squareValues[2] == squareValues[6]) && (squareValues[2] == botValue)) ||
                      ((squareValues[1] == squareValues[7]) && (squareValues[1] == botValue))) && (squareValues[4] == '⬛')) nextMove = 4;
            else if ((((squareValues[3] == squareValues[4]) && (squareValues[3] == botValue)) ||
                      ((squareValues[2] == squareValues[8]) && (squareValues[2] == botValue))) && (squareValues[5] == '⬛')) nextMove = 5;
            else if ((((squareValues[7] == squareValues[8]) && (squareValues[7] == botValue)) ||
                      ((squareValues[0] == squareValues[3]) && (squareValues[0] == botValue)) ||
                      ((squareValues[2] == squareValues[4]) && (squareValues[2] == botValue))) && (squareValues[6] == '⬛')) nextMove = 6;
            else if ((((squareValues[1] == squareValues[4]) && (squareValues[1] == botValue)) ||
                      ((squareValues[6] == squareValues[8]) && (squareValues[6] == botValue))) && (squareValues[7] == '⬛')) nextMove = 7;
            else if ((((squareValues[6] == squareValues[7]) && (squareValues[6] == botValue)) ||
                      ((squareValues[2] == squareValues[5]) && (squareValues[2] == botValue)) ||
                      ((squareValues[0] == squareValues[4]) && (squareValues[0] == botValue))) && (squareValues[8] == '⬛')) nextMove = 8;
            else if ((((squareValues[1] == squareValues[2]) && (squareValues[1] != '⬛')) ||
                      ((squareValues[3] == squareValues[6]) && (squareValues[3] != '⬛')) ||
                      ((squareValues[4] == squareValues[8]) && (squareValues[4] != '⬛'))) && (squareValues[0] == '⬛')) nextMove = 0;
            else if ((((squareValues[4] == squareValues[7]) && (squareValues[4] != '⬛')) ||
                      ((squareValues[0] == squareValues[2]) && (squareValues[0] != '⬛'))) && (squareValues[1] == '⬛')) nextMove = 1;
            else if ((((squareValues[5] == squareValues[8]) && (squareValues[5] != '⬛')) ||
                      ((squareValues[4] == squareValues[6]) && (squareValues[4] != '⬛')) ||
                      ((squareValues[0] == squareValues[1]) && (squareValues[0] != '⬛'))) && (squareValues[2] == '⬛')) nextMove = 2;
            else if ((((squareValues[4] == squareValues[5]) && (squareValues[4] != '⬛')) ||
                      ((squareValues[0] == squareValues[6]) && (squareValues[0] != '⬛'))) && (squareValues[3] == '⬛')) nextMove = 3;
            else if ((((squareValues[3] == squareValues[5]) && (squareValues[3] != '⬛')) ||
                      ((squareValues[0] == squareValues[8]) && (squareValues[0] != '⬛')) ||
                      ((squareValues[2] == squareValues[6]) && (squareValues[2] != '⬛')) ||
                      ((squareValues[1] == squareValues[7]) && (squareValues[1] != '⬛'))) && (squareValues[4] == '⬛')) nextMove = 4;
            else if ((((squareValues[3] == squareValues[4]) && (squareValues[3] != '⬛')) ||
                      ((squareValues[2] == squareValues[8]) && (squareValues[2] != '⬛'))) && (squareValues[5] == '⬛')) nextMove = 5;
            else if ((((squareValues[7] == squareValues[8]) && (squareValues[7] != '⬛')) ||
                      ((squareValues[0] == squareValues[3]) && (squareValues[0] != '⬛')) ||
                      ((squareValues[2] == squareValues[4]) && (squareValues[2] != '⬛'))) && (squareValues[6] == '⬛')) nextMove = 6;
            else if ((((squareValues[1] == squareValues[4]) && (squareValues[1] != '⬛')) ||
                      ((squareValues[6] == squareValues[8]) && (squareValues[6] != '⬛'))) && (squareValues[7] == '⬛')) nextMove = 7;
            else if ((((squareValues[6] == squareValues[7]) && (squareValues[6] != '⬛')) ||
                      ((squareValues[2] == squareValues[5]) && (squareValues[2] != '⬛')) ||
                      ((squareValues[0] == squareValues[4]) && (squareValues[0] != '⬛'))) && (squareValues[8] == '⬛')) nextMove = 8;
            else if ((((squareValues[2] == squareValues[3]) && (squareValues[2] != '⬛')) ||
                      ((squareValues[1] == squareValues[6]) && (squareValues[1] != '⬛'))) && (squareValues[0] == '⬛')) nextMove = 0;
            else if ((((squareValues[2] == squareValues[8]) && (squareValues[2] != '⬛')) ||
                      ((squareValues[0] == squareValues[5]) && (squareValues[0] != '⬛'))) && (squareValues[3] == '⬛')) nextMove = 3;
            else if ((((squareValues[3] == squareValues[8]) && (squareValues[3] != '⬛')) ||
                      ((squareValues[0] == squareValues[7]) && (squareValues[0] != '⬛'))) && (squareValues[6] == '⬛')) nextMove = 6;
            else if ((((squareValues[5] == squareValues[6]) && (squareValues[5] != '⬛')) ||
                      ((squareValues[2] == squareValues[7]) && (squareValues[2] != '⬛'))) && (squareValues[8] == '⬛')) nextMove = 8;
            else if (((squareValues[0] == squareValues[4]) || (squareValues[4] == squareValues[8])) && (squareValues[2] == '⬛') && (squareValues[4] != '⬛')) nextMove = 2;
            else if (((squareValues[0] == squareValues[4]) || (squareValues[4] == squareValues[8])) && (squareValues[6] == '⬛') && (squareValues[4] != '⬛')) nextMove = 6;
            else if (((squareValues[2] == squareValues[4]) || (squareValues[4] == squareValues[6])) && (squareValues[0] == '⬛') && (squareValues[4] != '⬛')) nextMove = 0;
            else if (((squareValues[2] == squareValues[4]) || (squareValues[4] == squareValues[6])) && (squareValues[8] == '⬛') && (squareValues[4] != '⬛')) nextMove = 8;
            else if ((gameContents.moves.length == 1) && (squareValues[4] != '⬛') && (squareValues[0] == '⬛')) nextMove = 0;
            else if ((gameContents.moves.length == 1) && (squareValues[4] != '⬛') && (squareValues[2] == '⬛')) nextMove = 2;
            else if ((gameContents.moves.length == 1) && (squareValues[4] != '⬛') && (squareValues[6] == '⬛')) nextMove = 6;
            else if ((gameContents.moves.length == 1) && (squareValues[4] != '⬛') && (squareValues[8] == '⬛')) nextMove = 8;
            else if (squareValues[4] == '⬛') nextMove = 4;
            else if (squareValues[1] == '⬛') nextMove = 1;
            else if (squareValues[3] == '⬛') nextMove = 3;
            else if (squareValues[5] == '⬛') nextMove = 5;
            else if (squareValues[7] == '⬛') nextMove = 7;
            else if (squareValues[0] == '⬛') nextMove = 0;
            else if (squareValues[2] == '⬛') nextMove = 2;
            else if (squareValues[6] == '⬛') nextMove = 6;
            else nextMove = 8;

            const nextMoveString = (nextMove + 1).toString();
            if (gameContents.moves.length % 2 == 0) {
                gameContents.moves.push({
                    square: nextMoveString,
                    tile: 'X'
                });
                squareValues[nextMove] = '🇽';
            } else {
                gameContents.moves.push({
                    square: nextMoveString,
                    tile: 'O'
                });
                squareValues[nextMove] = '🇴';
            }
            const row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('1')
                        .setEmoji(squareValues[0])
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('2')
                        .setEmoji(squareValues[1])
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('3')
                        .setEmoji(squareValues[2])
                        .setStyle('PRIMARY'),
                );
            const row2 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('4')
                        .setEmoji(squareValues[3])
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('5')
                        .setEmoji(squareValues[4])
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('6')
                        .setEmoji(squareValues[5])
                        .setStyle('PRIMARY'),
                );
            const row3 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('7')
                        .setEmoji(squareValues[6])
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('8')
                        .setEmoji(squareValues[7])
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('9')
                        .setEmoji(squareValues[8])
                        .setStyle('PRIMARY'),
                );
            if (((squareValues[0] == squareValues[1]) && (squareValues[1] == squareValues[2]) && (squareValues[0] != '⬛')) ||
                ((squareValues[3] == squareValues[4]) && (squareValues[4] == squareValues[5]) && (squareValues[3] != '⬛')) ||
                ((squareValues[6] == squareValues[7]) && (squareValues[7] == squareValues[8]) && (squareValues[6] != '⬛')) ||
                ((squareValues[0] == squareValues[3]) && (squareValues[3] == squareValues[6]) && (squareValues[0] != '⬛')) ||
                ((squareValues[1] == squareValues[4]) && (squareValues[4] == squareValues[7]) && (squareValues[1] != '⬛')) ||
                ((squareValues[2] == squareValues[5]) && (squareValues[5] == squareValues[8]) && (squareValues[2] != '⬛')) ||
                ((squareValues[0] == squareValues[4]) && (squareValues[4] == squareValues[8]) && (squareValues[0] != '⬛')) ||
                ((squareValues[2] == squareValues[4]) && (squareValues[4] == squareValues[6]) && (squareValues[2] != '⬛'))) {
                gameContents.gameOver = true;
                interaction.update({content: gameContents.playerNames[(gameContents.moves.length - 1) % 2] + ' wins!', components: [row1, row2, row3]});
                await jsonWrite(gamePath, gameContents);
                await endGame(gamePath, interaction);
            } else if (gameContents.moves.length == 9) {
                gameContents.gameOver = true;
                interaction.update({content: 'It\'s a draw!', components: [row1, row2, row3]});
                await jsonWrite(gamePath, gameContents);
                await endGame(gamePath, interaction);
            } else {
                interaction.update({content: gameContents.playerNames[gameContents.moves.length % 2] + '\'s turn!', components: [row1, row2, row3]});
                await jsonWrite(gamePath, gameContents);
            }
        } else {
            interaction.update({content: gameContents.playerNames[gameContents.moves.length % 2] + '\'s turn!', components: [row1, row2, row3]});
            await jsonWrite(gamePath, gameContents);
        }

	},
};
