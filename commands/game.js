const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('Begins a new game')
		.addSubcommand(subcommand =>
		    subcommand.setName('tic-tac-toe')
		        .setDescription('Play tic-tac-toe')
                .addUserOption(option =>
                    option.setName('opponent')
                        .setDescription('Who you\'re facing. Leave blank to face the bot')
                )
                .addBooleanOption(option =>
                    option.setName('first')
                        .setDescription('Whether you would like to play first. Defaults to true')
                )
		),
	async execute(interaction) {
        const {Collection} = require('discord.js');
        const fs = require('fs');

        const gameCommands = new Collection();
        const commandFiles = fs.readdirSync('./commands/games').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const gameCommand = require(`./games/${file}`);
            gameCommands.set(gameCommand.data.name, gameCommand);
        }

	    const command = gameCommands.get(interaction.options.getSubcommand());
		await command.execute(interaction);
	},
};