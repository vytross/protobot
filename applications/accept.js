const {SlashCommandBuilder} = require('@discordjs/builders');

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
        .setDescription('Accept an application. Enter a user input to have the bot message them directly that they were accepted.')
        .addUserOption(option =>
            option.setName('discord')
                .setDescription('The applicant\'s Discord username')
        ),
    async execute(interaction) {
        const fs = require('fs');
        if (!interaction.message.channel.isThread && !interaction.getUser('discord')) return interaction.reply('Invalid command use! Make sure to either add a username or send the command through an application thread!');
        else if (interaction.message.channel.isThread && !interaction.getUser('discord')) {
            const appFiles = fs.readdirSync('./applications').filter(file => file.endsWith('.json'));
            var appPath;
            for (const file of appFiles) {
                const app = require(`${file}`);
                if (app.threadId == interaction.channelId) {
                    appPath = path.resolve(__dirname, `./${file}`);
                }
            }

            if (!appPath) interaction.reply('Invalid command use! Make sure to either add a username or send the command through an application thread!')
            else {
                const thread = interaction.channel;
                const channel = thread.parent;
                const appContents = await jsonRead(appPath);
                const messageId = appContents.messageId;
                const message = channel.messages.cache.find(x => x.id == messageId);

                await thread.delete('App accepted')
                    .then(deletedThread => console.log(deletedThread))
                    .catch(console.error);
                await message.delete();
            }
        } else {
            const appFiles = fs.readdirSync('./applications').filter(file => file.endsWith('.json'));
            const user = interaction.getUser('discord');
            var appPath;
            for (const file of appFiles) {
                const app = require(`${file}`);
                if (app.discord == user.username) {
                    appPath = path.resolve(__dirname, `./${file}`);
                }
            }

            if (!appPath) interaction.reply('Invalid command use! Make sure to either add a username or send the command through an application thread!')
            else {
                const channel = interaction.guild.channels.cache.find(y => y.id == 896271184902103070);
                const appContents = await jsonRead(appPath);
                const threadId = appContents.threadId;
                const thread = channel.threads.cache.find(x => x.id == threadId);
                await user.send('We at ProtoTech congratulate you on your application being accepted! We\'ve given you our fabled "Accepted" role, which gives you access to our member-info channel for you to read through before we grant you full member permissions. Welcome to our team!');
                const guild = interaction.guild;
                const member = guild.member(user);
                const role = role = message.guild.roles.cache.find(r => r.name == "Accepted");
                await member.roles.add(role);
                await thread.delete('App accepted')
                    .then(deletedThread => console.log(deletedThread))
                    .catch(console.error);
                await interaction.message.delete();
            }
        }
    },
}