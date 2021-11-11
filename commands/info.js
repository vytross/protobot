const {MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Gives a synopsis on the bot\'s background, how to use it, and where you can find more information'),
	async execute(interaction) {
	    const embed = new MessageEmbed()
	        .setColor('#E133FF')
	        .setAuthor('GitHub', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com/vytross/protobot')
	        .setFooter('ProtoBot', 'https://cdn.discordapp.com/attachments/793289338112835588/896543216017502268/protoshrek.png')
	        .setTitle('Information Board')
	        .setDescription('Built and maintained by vytross, ProtoBot adds a better application system along with a few in-app Discord games for users on the ProtoTech Discord server to play amongst themselves and against the bot. This bot is constantly being worked on and updated, so look out for new and exciting things coming soon!')
	        .addFields(
	            {name: 'Public Command List', value: '/info\n/ping\n/game\n/changelog', inline: true},
	            {name: 'Current Games', value: 'Tic-Tac-Toe', inline: true},
	            {name: 'Comprised Of', value: 'ProtoTech Applications\nProtoTech Games', inline: true}
	        )
	        .setTimestamp();
		await interaction.reply({embeds: [embed]});
	},
};
