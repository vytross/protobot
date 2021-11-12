const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('push')
        .setDescription('Push a new application manually.')
        .addUserOption(option =>
            option.setName('discord')
                .setDescription('The applicant\'s Discord username')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ign')
                .setDescription('The applicant\'s in-game name')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('url')
                .setDescription('The URL to the applicant\'s responses')
                .setRequired(true)
        ),
    async execute(interaction) {
	const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
        const fs = require('fs');
	const channel = interaction.channel;
        if (channel.id == 896271184902103070) {
            const user = interaction.options.getUser('discord');
            const ign = interaction.options.getString('ign');
            const url = interaction.options.getString('url');

            const sentEmbed = new MessageEmbed()
                .setTitle(ign)
                .setDescription('New submission from application form')
                .setAuthor(user.username)
                .setURL(url)
                .setFields([{'name': 'This application went over the character limit!', 'value': 'A manual write-up of the application can be found in the thread below.'}]);
            const mainEmbed = new MessageEmbed()
                .setTitle(ign + "'s application")
                .setDescription('Upvotes: 0\nDownvotes: 0\nDelete votes: 0 of 4');
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('upvote')
                        .setEmoji('👍')
                        .setLabel('Upvote')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('downvote')
                        .setEmoji('👎')
                        .setLabel('Downvote')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('delete')
                        .setEmoji('🗑')
                        .setLabel('Delete app')
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('revoke')
                        .setEmoji('♻')
                        .setLabel('Revoke vote')
                        .setStyle('PRIMARY'),
                );
            const mainMessage = await channel.send({embeds: [mainEmbed], components: [row]});

            const thread = await channel.threads.create({
                startMessage: mainMessage,
                name: ign,
                autoArchiveDuration: 10080,
                reason: 'New ProtoTech Application',
            });
            const threadId = thread.id;
            const appMessage = await thread.send({embeds: [sentEmbed]});
            appMessage.pin()
              .then(console.log)
              .catch(console.error);

            var fileName = mainMessage.id;
            let jsonFile = {
                messageId: mainMessage.id,
                threadId: threadId,
                discord: user.username,
                votes: [{'user': '0', 'vote': 'revoke'}]
            };
            let data = JSON.stringify(jsonFile);
            fs.writeFileSync(`applications/${fileName}.json`, data);
            return interaction.reply('Application successfully pushed!');
        } else return interaction.reply('Sorry, you can\'t use that command here!');
    },
}
