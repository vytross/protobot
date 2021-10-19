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
function jsonWrite(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data), (err) => {
      if (err) reject(err);
      resolve(true);
    });
  });
}

channelCommand = new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Adds or removes channels that the bot can use')
    .addStringOption(option =>
        option.setName('action')
            .setDescription('Whether to add or remove the channel from the list')
            .setRequired(true)
            .addChoice('add', 'Add')
            .addChoice('remove', 'Remove'))
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('Which channel to use')
            .setRequired(true));
channelCommand.options[1].channelTypes = 'GUILD_TEXT';

module.exports = {
	data: channelCommand,
	async execute(interaction) {
	    const filePath = path.resolve(__dirname, `../channels.json`);
	    const fileContents = await jsonRead(filePath);

        let guildIndex = -1;
        let channelIndex = -1;
        const guilds = fileContents.guilds;
        const guildId = interaction.guildId;
        const channelId = interaction.options.getChannel('channel').id;

        for (let i = 0; i < guilds.length; i++) {
            if (guilds[i].id == guildId) guildIndex = i;
        }
        const channels = guilds[guildIndex].channels;
        if (channels.length > 0) {
            for (let j = 0; j < channels.length; j++) {
                if (channels[j].id == channelId) channelIndex = j;
            }
        }

        console.log(channelIndex);
        console.log(interaction.options.getString('action'));
        if (channelIndex == -1 && interaction.options.getString('action') == 'Add') {
            channels.push({
                id: channelId,
                active: true
            });
        } else if (channelIndex != -1) {
            if (interaction.options.getString('action') == 'Add')  {
                channels[channelIndex].active = true;
            } else {
                channels[channelIndex].active = false;
            }
        }

        jsonWrite(filePath, fileContents);

        if (interaction.options.getString('action') == 'Add') {
            await interaction.reply({content: 'Channel successfully added!', ephemeral: true})
                .then(console.log)
                .catch(console.error);
        } else {
            await interaction.reply({content: 'Channel successfully removed!', ephemeral: true})
                .then(console.log)
                .catch(console.error);
        }
	},
};