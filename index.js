const {Client, Collection, Intents, Permissions} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES);
const client = new Client({intents: intents});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

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
function jsonWrite(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
}

async function checkChannel(guildId, channelId) {
    const filePath = path.resolve(__dirname, `./channels.json`);
    const fileContents = await jsonRead(filePath);

    let guildIndex = -1;
    let channelIndex = -1;
    const guilds = fileContents.guilds;

    for (let i = 0; i < guilds.length; i++) {
        if (guilds[i].id == guildId) guildIndex = i;
    }
    if (guildIndex != -1) {
        const channels = guilds[guildIndex].channels;
        if (channels.length > 0) {
            for (let j = 0; j < channels.length; j++) {
                if (channels[j].id == channelId) channelIndex = j;
            }
            if (channelIndex != -1 && channels[channelIndex].active == true) return true;
        }
    }
    return false;
}

client.once('ready', () => {
    console.log('ready');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        const adminCommands = ['channel', 'application'];
        if (!command) return;

        const usable = await checkChannel(interaction.guildId, interaction.channelId);
        if ((adminCommands.includes(interaction.commandName) && interaction.member.permissions.has(Permissions.MANAGE_SERVER)) || (!adminCommands.includes(interaction.commandName) && usable)) {
            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(err);
                return interaction.reply({content: 'Sorry, there was an error with the bot. Please contact a developer so the issue can be resolved ASAP.'});
            }
        } else {
            return interaction.reply({ephemeral: true, content: 'Sorry, you can\'t use that command here!'});
        }
    } else if (interaction.isButton()) {
        const gameFiles = fs.readdirSync('./commands/games').filter(file => file.endsWith('.json'));
        var gamePath;

        for (const file of gameFiles) {
            const game = require(`./commands/games/${file}`);
            if (game.messageId == interaction.message.id) {
                gamePath = path.resolve(__dirname, `./commands/games/${file}`);
            }
        }

        if (gamePath) {
            const gameFileContents = await jsonRead(gamePath);
            const gameName = gameFileContents.game;
            const scriptFile = require(`./game-scripts/${gameName}.js`);
            return await scriptFile.execute(interaction, client);
        } else if (interaction.channel.id == 896271184902103070) {
            const fileName = interaction.message.id;
            const filePath = path.resolve(__dirname, `applications/${fileName}.json`);
            const fileContents = await jsonRead(filePath);
            const userId = interaction.user.id;
            const threadId = fileContents.threadId;

            let upvotes = 0;
            let downvotes = 0;
            let deletes = 0;
            let index = 0;

            for (let i = 0; i < fileContents.votes.length; i++) {
                if (fileContents.votes[i].vote == 'upvote') upvotes++;
                else if (fileContents.votes[i].vote == 'downvote') downvotes++;
                else if (fileContents.votes[i].vote == 'delete') deletes++;

                if (fileContents.votes[i].user == userId) index = i;
            }
            if (index == 0) {
                if (interaction.customId == 'upvote') upvotes++;
                else if (interaction.customId == 'downvote') downvotes++;
                else if (interaction.customId == 'delete') deletes++;

                fileContents.votes.push({
                    user: userId,
                    vote: interaction.customId
                });
                jsonWrite(filePath, fileContents);
            } else if (fileContents.votes[index].vote != interaction.customId) {
                if (fileContents.votes[index].vote == 'upvote') upvotes--;
                else if (fileContents.votes[index].vote == 'downvote') downvotes--;
                else if (fileContents.votes[index].vote == 'delete') deletes--;

                if (interaction.customId == 'upvote') upvotes++;
                else if (interaction.customId == 'downvote') downvotes++;
                else if (interaction.customId == 'delete') deletes++;

                fileContents.votes[index] = {'user': userId, 'vote': interaction.customId};
                jsonWrite(filePath, fileContents);
            } else jsonWrite(filePath, fileContents);

            if (deletes < 4) {
                const embed = interaction.message.embeds[0];
                const title = embed.title;
                const newEmbed = new MessageEmbed()
                    .setTitle(title)
                    .setDescription('Upvotes: ' + upvotes + '\nDownvotes: ' + downvotes + '\nDelete votes: ' + deletes + ' of 4');
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
                interaction.update({
                    embeds: [newEmbed],
                    components: [row]
                });
            } else {
                const channel = interaction.message.channel;
                const thread = channel.threads.cache.find(x => x.id == threadId);
                await thread.delete('App rejected')
                    .then(deletedThread => console.log(deletedThread))
                    .catch(console.error);
                await interaction.message.delete();
            }
        } else return;
    } else return;
});

client.on('threadUpdate', async (oldThread, newThread) => {
    if (newThread.archived && !oldThread.archived) {
        const gameFiles = fs.readdirSync('./commands/games').filter(file => file.endsWith('.json'));
        var gamePath;
        for (const file of gameFiles) {
            const game = require(`./commands/games/${file}`);
            if (game.threadId == oldThread.id) {
                gamePath = path.resolve(__dirname, `./commands/games/${file}`);
            }
        }
        if (gamePath) {
            const gameFileContents = await jsonRead(gamePath);
            fs.unlinkSync(gamePath);
            const parentChannel = oldThread.parent;
            await client.channels.cache.get(parentChannel.id).messages.fetch(gameFileContents.initialMessageId).then(message => message.delete());
            await newThread.delete();
        }
    }
});

client.on('messageCreate', async message => {
    if (message.webhookId && message.channelId == 896271184902103070) {
        const channel = message.channel;
        const receivedEmbed = message.embeds[0];
        message.delete()
          .then(msg => console.log(`Deleted webhook message`))
          .catch(console.error);

        const username = receivedEmbed.title;
        const discord = receivedEmbed.author.name;
        const sentEmbed = new MessageEmbed(receivedEmbed).setTitle(username);
        const mainEmbed = new MessageEmbed()
            .setTitle(username + "'s application")
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
            name: username,
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
            discord: discord,
            votes: [{'user': '0', 'vote': 'revoke'}]
        };
        let data = JSON.stringify(jsonFile);
        fs.writeFileSync(`applications/${fileName}.json`, data);
    }
});

client.login(config.token);