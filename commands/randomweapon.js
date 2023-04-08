const { SlashCommandBuilder } = require('@discordjs/builders');

const weapons = ['Clasic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff']
module.exports = {
    data: new SlashCommandBuilder()
        .setName('randompistol')
        .setDescription('Gives you a random pistol from Valorant'),
    async execute(interaction) {
        const selection = Math.floor(Math.random()*5)
        await interaction.reply(weapons[selection])
    }
}