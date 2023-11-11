import * as oceanic from "oceanic.js";
import * as builders from "@oceanicjs/builders";
import { Guild, queuedTrack, track } from "../client.js";
import ytpl from "ytpl";
import utils from "../utils.js";
import * as voice from "@discordjs/voice";

export default {
    name: "add-playlist",
    description: "Add a playlist to the queue.",
    options: [
        {
            name: 'playlist',
            description: "The playlist to add. Can also be a channel URL.",
            required: true,
            type: 3
        },
        {
            name: "shuffle",
            description: "Should the playlist be shuffled before being added to queue?",
            required: false,
            type: 5
        }
    ],
    callback: async (interaction: oceanic.CommandInteraction, guild: Guild) => {
        await interaction.defer();
        const playlist = interaction.data.options.getString("playlist", true);
        const shuffle = interaction.data.options.getBoolean("shuffle");
        if (!ytpl.validateID(playlist)) {
            const embed = new builders.EmbedBuilder();
            embed.setDescription("Invalid playlist link.");
            await interaction.editOriginal({embeds: [embed.toJSON()]});
        }
        const videos = await ytpl(playlist);
        const added_playlist: queuedTrack = { 
            trackNumber: 0,
            tracks: [],
            type: "playlist",
            name: videos.title
        };
        for (const video of videos.items) {
            const obj: track = {
                name: video.title,
                url: video.url
            }
            added_playlist.tracks.push(obj);
        }
        if (shuffle) utils.shuffleArray(added_playlist.tracks);
        const embed = new builders.EmbedBuilder();
        embed.setDescription(`Added **${videos.items.length} tracks** to the queue as a playlist.`);
        const queue = guild.queue;
        queue.tracks.push(added_playlist);
        if (guild.audioPlayer.state.status === voice.AudioPlayerStatus.Idle && guild.connection) await queue.play();
        await interaction.editOriginal({embeds: [embed.toJSON()]});
    }
}