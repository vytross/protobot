const {MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('Gives a description of the most recent update and a link to a complete changelog for the bot.'),
	async execute(interaction) {
	    const embed = new MessageEmbed()
	        .setColor('#E133FF')
	        .setAuthor('GitHub', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/vytross/prototech-games')
	        .setFooter('ProtoTech Games', 'https://cdn.discordapp.com/attachments/793289338112835588/896543216017502268/protoshrek.png')
	    	.setURL('https://github.com/vytross/prototech-games/blob/main/README.md')
	        .setTitle('Change Log')
	        .addFields(
	            {name: 'Pre-Release v0.0.1', value: '• Added /changelog command\n• Fixed tic-tac-toe algorithm\n• Added restart and delete reaction messages to finished games'},
	            {name: 'Pre-Release v0.0.0', value: '• Introduced the bot to Discord!\n• Added /ping command\n• Added /info command\n• Added /channel command\n• Added /game command\n• Added tic-tac-toe'}
	        )
	        .setTimestamp();
		await interaction.reply({embeds: [embed]});
	},
};
