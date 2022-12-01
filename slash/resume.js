const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuild()
       .setName("resume")
       .setDescription("Resume the bot."),
    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue || !queue.playing) {
            return await interaction.editReply("There are no songs in this queue")
        }
        queue.setPaused(false)
        await interaction.editReply("Music has been resumed! Use `/pause` to pause the music!")

    }
}