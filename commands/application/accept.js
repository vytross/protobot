const {SlashCommandBuilder} = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Accept an application. Enter a Discord user to send them directly that they were accepted.')
        .addUserOption(option =>
            option.setName('discord')
                .setDescription('The applicant\'s Discord username')
        ),
    async execute(interaction) {
        if (!interaction.channel.isThread()) return interaction.reply('Invalid command use! Make sure to send the command through an application thread!');
        const appFiles = fs.readdirSync('./applications').filter(file => file.endsWith('.json'));
        var appPath;
        for (const file of appFiles) {
            const app = require(`../../applications/${file}`);
            if (app.threadId == interaction.channelId) {
                appPath = path.resolve(__dirname, `../../applications/${file}`);
            }
        }

        if (!appPath) interaction.reply('Invalid command use! Make sure to send the command through an application thread!')
        else {
            const thread = interaction.channel;
            const channel = thread.parent;
            const appContents = await jsonRead(appPath);
            const messageId = appContents.messageId;

            await thread.delete('App accepted')
                .then(deletedThread => console.log(deletedThread))
                .catch(console.error);
            await channel.messages.fetch(messageId).then(message => message.delete());
        }
        if (interaction.options.getUser('discord')) {
            const user = interaction.options.getUser('discord');
            await user.send('We at ProtoTech congratulate you on your application being accepted! We\'ve given you our fabled "Accepted" role, which gives you access to our member-info channel for you to read through before we grant you full member permissions. Welcome to our team!');
            const guild = interaction.guild;
            const member = guild.member(user);
            const role = role = message.guild.roles.cache.find(r => r.name == "Accepted");
            await member.roles.add(role);
        }
    },
}
