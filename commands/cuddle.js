const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cuddle')
		.setDescription('cuddle with someone')
		.addUserOption((option) =>
			option.setName('user')
				.setDescription('Who do you want to cuddle?')
				.setRequired(false)),
	async execute(interaction) {
		axios.get('https://api.waifu.pics/sfw/cuddle')
			.then((res) => {
				const user = interaction.options.getMember('user');
				let embed;

				if (user && interaction.member.id !== user.id) {
					embed = new MessageEmbed()
						.setColor('ORANGE')
						.setTitle(`${interaction.member.nickname ? interaction.member.nickname : interaction.member.username} is cuddling with ${user.nickname ? user.nickname : user.user.username}`)
						.setImage(`${res.data.url}`);
				}
				else {
					embed = new MessageEmbed()
						.setColor('ORANGE')
						.setTitle(`${interaction.member.nickname ? interaction.member.nickname : interaction.member.username} wants to be cuddled`)
						.setImage(`${res.data.url}`);
				}

				interaction.reply({ embeds: [embed] });
			})
			.catch((error) => {
				interaction.reply({ content: 'An Error has occured! Please try again later!', ephemeral: true });
				console.error(`ERR: ${error}`);
			});
	},
};
