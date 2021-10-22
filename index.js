const {Client, Collection, Intents, Permissions} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS);
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
        if (!command) return;

        const usable = await checkChannel(interaction.guildId, interaction.channelId);
        if ((interaction.commandName == 'channel' && interaction.member.permissions.has(Permissions.MANAGE_SERVER)) || (interaction.commandName != 'channel' && usable)) {
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
        } else {
            return;
        }
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

client.login(config.token);