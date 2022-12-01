const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuild()
       .setName("pause")
       .setDescription("Pauses the bot."),
    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue || !queue.playing) {
            return await interaction.editReply("There are no songs in this queue")
        }
        queue.setPaused(true)
        await interaction.editReply("Music has been paused! Use `/resume` to resume the music!")

    }
}