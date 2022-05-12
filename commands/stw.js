const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stw')
		.setDescription('Shows STW V-Bucks Missions'),
	async execute(interaction) {
		await interaction.reply('https://fortnitedb.com/');
	},
};