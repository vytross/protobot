const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDescription('Gives basic controls over incoming ProtoTech applications.')
        .addSubcommand(subcommand =>
            subcommand.setName('accept')
                .setDescription('Accept an application. Enter directly in the thread; use user input to DM directly.')
                .addUserOption(option =>
                    option.setName('discord')
                        .setDescription('The applicant\'s Discord username')
                ))
        .addSubcommand(subcommand =>
            subcommand.setName('reject')
                .setDescription('Reject an application. Enter directly in the thread; use user input to DM directly.')
                .addUserOption(option =>
                    option.setName('discord')
                    .setDescription('The applicant\'s Discord username')
                )),
    async execute(interaction) {
        const {Collection} = require('discord.js');
        const fs = require('fs');

        const appCommands = new Collection();
        const commandFiles = fs.readdirSync('./commands/application').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const appCommand = require(`../commands/application/${file}`);
            appCommands.set(appCommand.data.name, appCommand);
        }

        const command = appCommands.get(interaction.options.getSubcommand());
        await command.execute(interaction);
    },
}
