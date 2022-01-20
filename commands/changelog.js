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
	        .setFooter('ProtoBot', 'https://cdn.discordapp.com/attachments/793289338112835588/896543216017502268/protoshrek.png')
	        .setURL('https://github.com/vytross/protobot/blob/main/README.md')
	        .setTitle('Change Log')
	        .addFields(
		        {name: 'Pre-Release v0.2.0', value: '• Removed game feature. Read Github README for more info\n• Further application bug fixes'},
	        )
	        .setTimestamp();
		await interaction.reply({embeds: [embed]});
	},
};
