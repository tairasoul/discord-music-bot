import * as oceanic from "oceanic.js";
import { Guild, ResolverInformation } from "../client.js";
import * as builders from "@oceanicjs/builders";

export default {
    name: "clear-queue",
    description: "Clear the queue.",
    callback: async (interaction: oceanic.CommandInteraction, _resolvers: ResolverInformation, guild: Guild) => {
        await interaction.defer()
        guild.queue.clearQueue();
        const embed = new builders.EmbedBuilder()
        embed.setDescription("Cleared queue.")
        await interaction.editOriginal({embeds: [embed.toJSON()]});
    }
}