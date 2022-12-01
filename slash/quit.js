const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
       .setName("quit")
       .setDescription("Stops the bot and clears the queue"),
    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue || !queue.playing) {
            return await interaction.editReply("There are no songs in this queue")
        }
        queue.destroy()
        await interaction.editReply("Bye!")

    }
}