const fs = require('fs');

const Database = require("@replit/database");

const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env['TOKEN'];
const clientId = process.env['CLIENT_ID'];
const guildId = process.env['GUILD_ID'];

const client = new Client({
  intents:
    [
      Intents.FLAGS.GUILDS
    ]
});

const Daclient = new Client();

module.exports = client;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith(".js"));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(client.user.username + ' is now online!');

  const rest = new REST({
    version: '9'
  }).setToken(token);

  (async () => {
    try {
      if (process.env['STATE'] === 'production') {
        await rest.put(Routes.applicationCommand(clientId), {
          body: commands
        });
        console.log('Sucessfully registered commands locally.');
      } else {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
          body: commands
        });
        console.log('Sucessfully registered commands locally.');
      }
    } catch (err) {
      if (err) console.error(err);
    }
  })();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction)
  } catch (err) {
    if (err) console.error(err)

    await interaction.reply({
      content: 'An error has occured while executing this command.',
      emphemeralv: true
    })
  }
});

client.login(token)