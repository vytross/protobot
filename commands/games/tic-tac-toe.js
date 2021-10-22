const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tic-tac-toe')
		.setDescription('Play tic-tac-toe')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('Who you\'re facing. Leave blank to face the bot')
        )
        .addBooleanOption(option =>
            option.setName('first')
                .setDescription('Whether you would like to play first. Defaults to true')
        ),
	async execute(interaction) {
        const {MessageActionRow, MessageButton} = require('discord.js');
        const config = require('../../config.json');
        const fs = require('fs');
        const path = require('path');

		const mainChannel = interaction.channel;
		const subcommand = interaction.options.getSubcommand();

        const user = interaction.user;
        const userId = user.id;
        const username = user.username;
        let opponentName = "";
        let opponentId = 0;
		if (interaction.options.getUser('opponent')) {
		    const opponent = interaction.options.getUser('opponent');
		    opponentName = opponent.username;
		    opponentId = opponent.id;
		}
		else {
		    opponentName = 'ProtoTech Games';
		    opponentId = config.clientId;
		}

		const initialMessage = await mainChannel.send('**TIC-TAC-TOE**\n' + username + ' (X) vs ' + opponentName + ' (O)');
		const thread = await mainChannel.threads.create({
		    startMessage: initialMessage,
		    name: 'Tic-Tac-Toe - ' + username + ' (X) vs ' + opponentName + ' (O)',
		    autoArchiveDuration: 60,
		    reason: 'New game',
		});
		const threadId = thread.id;
		await thread.members.add(userId);
		if (opponentId != config.clientId) await thread.members.add(opponentId);
		let messageId = 0;

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
        if (interaction.options.getBoolean('first') === false && opponentId == config.clientId) {
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

        if (interaction.options.getBoolean('first') === false && opponentId != config.clientId) {
            const message = await thread.send({content: opponentName + '\'s turn!', components: [row1, row2, row3]});
            messageId = message.id;
        } else {
            const message = await thread.send({content: username + '\'s turn!', components: [row1, row2, row3]});
            messageId = message.id;
        }

        let jsonFile = {};
		if (interaction.options.getBoolean('first') === false && opponentId != config.clientId) {
            jsonFile = {
                initialMessageId: initialMessage.id,
                messageId: messageId,
                threadId: threadId,
                game: 'tic-tac-toe',
                playerIds: [
                    opponentId,
                    userId
                ],
                playerNames: [
                    opponentName,
                    username
                ],
                moves: [],
                gameOver: false,
            };
        } else if (interaction.options.getBoolean('first') === false && opponentId == config.clientId) {
            jsonFile = {
                initialMessageId: initialMessage.id,
                messageId: messageId,
                threadId: threadId,
                game: 'tic-tac-toe',
                playerIds: [
                    opponentId,
                    userId
                ],
                playerNames: [
                    opponentName,
                    username
                ],
                moves: [
                    {square: '5', tile: 'X'}
                ],
                gameOver: false,
            };
        } else {
            jsonFile = {
                initialMessageId: initialMessage.id,
                messageId: messageId,
                threadId: threadId,
                game: 'tic-tac-toe',
                playerIds: [
                    userId,
                    opponentId
                ],
                playerNames: [
                    username,
                    opponentName
                ],
                moves: [],
                gameOver: false,
            };
        }
        let data = JSON.stringify(jsonFile);
        fs.writeFileSync(`commands/games/${messageId}.json`, data);

        interaction.reply({content: 'Game successfully started!', ephemeral: true});
	},
};