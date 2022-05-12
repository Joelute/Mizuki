const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Replies with user info!'),
	async execute(interaction) {
		await interaction.reply(`User tag: ${interaction.user.tag}\nUser id: ${interaction.user.id}`);
	},
};