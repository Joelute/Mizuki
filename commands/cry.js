const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cry')
		.setDescription('cry to someone')
		.addUserOption((option) =>
			option.setName('user')
				.setDescription('Who do you want to cry?')
				.setRequired(false)),
	async execute(interaction) {
		axios.get('https://api.waifu.pics/sfw/cry')
			.then((res) => {
				const user = interaction.options.getMember('user');
				let embed;

				if (user && interaction.member.id !== user.id) {
					embed = new MessageEmbed()
						.setColor('ORANGE')
						.setTitle(`${user.nickname ? user.nickname : user.user.username} made ${interaction.member.nickname ? interaction.member.nickname : interaction.member.username} cry`)
						.setImage(`${res.data.url}`);
				}
				else {
					embed = new MessageEmbed()
						.setColor('ORANGE')
						.setTitle(`${interaction.member.nickname ? interaction.member.nickname : interaction.member.username} is crying...`)
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
