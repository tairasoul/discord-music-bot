import * as oceanic from "oceanic.js";
import { Guild } from "../client.js";
import utils from "../utils.js";
import * as builders from "@oceanicjs/builders";
import * as voice from "@discordjs/voice";
import ResolverUtils from "../resolverUtils.js";
import { debugLog } from "../bot.js";

export default {
    name: "import",
    description: "Import a exported queue/playlist.",
    options: [
        {
            name: "encoded",
            type: oceanic.ApplicationCommandOptionTypes.ATTACHMENT,
            description: "The encoded queue/playlist.",
            required: true
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, resolvers: ResolverUtils, guild: Guild) => {
        await interaction.defer()
        const queue = guild.queue;
        const encoded = interaction.data.options.getAttachment("encoded", true);
        const data = await fetch(encoded.url, {
            method: "GET"
        });
        const encodedData = await data.text();
        const lzd = utils.decodeStr(encodedData);
        debugLog(lzd);
        if (lzd?.trackNumber !== undefined) {
            debugLog("found track number")
            queue.tracks.push(lzd);
        }
        else {
            debugLog("no track number, iterating.")
            for (const track of lzd) {
                queue.tracks.push(track);
            }
        }
        const embed = new builders.EmbedBuilder();
        embed.setDescription(`Imported ${lzd.trackNumber !== undefined ? lzd.tracks.length : lzd.length} ${lzd.trackNumber !== undefined ? lzd.tracks.length > 1 ? "songs" : "song" : lzd.length > 1 ? "songs" : "song"} from ${encoded.filename}`);
        await interaction.editOriginal({embeds: [embed.toJSON()]});
        if (guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guild.connection) await queue.play(resolvers);
    }
}