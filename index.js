const fs = require('node:fs');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const dotenv = require('dotenv')
dotenv.config()

const token = process.env.DISCORD_TOKEN

// Discord Client things
const client = new Client({ intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel] });

const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.namem, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Express request things

const app = express();
app.use(express.json());


// End point for github-webhooks. This will take the payload
// and send it straight into the given discord channel.
app.post('/github-webhook', (req, res) => {
	const payload = req.body;
	const webhookChannelID = "888233572949975090";
	const webhookChannel = client.channels.cache.get(webhookChannelID);
  
	if (webhookChannel && webhookChannel.type === 'text') {
	  webhookChannel.send(`Received payload:\n\`\`\`${JSON.stringify(payload)}\`\`\``);
	}
	
	// Backend response to client
	// TODO: Maybe change this up to better give more info and more 
	// up to standards.
	res.send('Received');
});
  
client.login(token);
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});