const fs = require('node:fs');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const express = require('express');
const { Pool } = require('pg')
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

// Express request and backend things

const app = express();
app.use(express.json());

const pg_client = new Pool({
	user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DB_NAME,
	password: process.env.PG_PASS,
	port: 5432,
	ssl: true,
});

// Test the database connection
pg_client.connect((err, client, done) => {
	if (err) {
	  console.error('Error connecting to database', err.stack);
	} else {
	  console.log('Connected to database');
	  client.query('SELECT NOW()', (err, result) => {
		done();
		if (err) {
		  console.error('Error executing query', err.stack);
		} else {
		  console.log('Successfully executed query', result.rows[0]);
		}
	  });
	}
});


// End point for github-webhooks. This will take the payload
// and send it straight into the given discord channel.
app.post('/github-webhook', async (req, res) => {
	const payload = req.body;
	const eventType = req.headers['x-github-event'];
	const webhookChannelID = "888233572949975090";
	const webhookChannel = client.channels.cache.get(webhookChannelID);
  
	if (webhookChannel && webhookChannel.isTextBased()) {
		if (JSON.stringify(payload).length > 1900) {
				webhookChannel.send(`Received payload (payload too large, check the database):\n\`\`\`${JSON.stringify(payload).substring(0, 1900)}...\`\`\``);
		  } else {
				webhookChannel.send(`Received payload:\n\`\`\`${JSON.stringify(payload)}\`\`\``);
		  }
	}

	try {
		// Insert the event into the database
		const result = await pg_client.query(`
		  INSERT INTO github_events (event_type, payload)
		  VALUES ($1, $2)
		  RETURNING id
		`, [eventType, payload]);
		console.log('Event inserted with ID', result.rows[0].id);
		res.sendStatus(200);
	  } catch (err) {
		console.error('Error inserting event', err.stack);
		res.sendStatus(500);
	  }
	
	// Backend response to client
	// TODO: Maybe change this up to better give more info and more 
	// up to standards.
});
  
client.login(token);
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});