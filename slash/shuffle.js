const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
       .setName("shuffle")
       .setDescription("Shuffles the queue."),
    run: async ({client, interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)

        if (!queue || !queue.playing) {
            return await interaction.editReply("There are no songs in this queue")
        }
        queue.shuffle()
        await interaction.editReply("The queue have been shuffled!")

    }
}