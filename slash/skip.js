const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
       .setName("skip")
       .setDescription("Skips the current song."),
    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue || !queue.playing) {
            return await interaction.editReply("There are no songs in this queue")
        }

        const currentSong = queue.current
        queue.skip()
        await interaction.editReply({
            embeds: [
                new MessageEmbed()
                   .setTitle(`${currentSong.title} has been skipped!`).setThumbnail(currentSong.thumbnail)
            ]
        })

    }
}