const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Spam Ping Someone!')
		.addUserOption((option) =>
			option.setName('user')
				.setDescription('Who would you like to ping?')
				.setRequired(true))
		.addIntegerOption((option) =>
			option.setName('amount')
				.setDescription('How many times would you like to ping them?')
				.setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const amount = interaction.options.getInteger('amount');
		let i = 0;
		await interaction.reply({ content: 'On it!', ephemeral: true });
		while (i < amount) {
			const message = await interaction.channel.send(`${user}`);
			await message.delete();
			i++;
		}

	},
};