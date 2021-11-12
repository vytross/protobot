const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDescription('Gives basic controls over incoming ProtoTech applications.')
        .addSubcommand(subcommand =>
            subcommand.setName('push')
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
                ))
        .addSubcommand(subcommand =>
            subcommand.setName('accept')
                .setDescription('Accept an application. Either directly in the thread or by using user input.')
                .addUserOption(option =>
                    option.setName('discord')
                        .setDescription('The applicant\'s Discord username')
                ))
        .addSubcommand(subcommand =>
            subcommand.setName('reject')
                .setDescription('Reject an application. Either directly in the thread or by using user input.')
                .addUserOption(option =>
                    option.setName('discord')
                    .setDescription('The applicant\'s Discord username')
                )),
    async execute(interaction) {
        const {Collection} = require('discord.js');
        const fs = require('fs');

        const appCommands = new Collection();
        const commandFiles = fs.readdirSync('./applications').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const appCommand = require(`../applications/${file}`);
            appCommands.set(appCommand.data.name, appCommand);
        }

        const command = appCommands.get(interaction.options.getSubcommand());
        await command.execute(interaction);
    },
}
