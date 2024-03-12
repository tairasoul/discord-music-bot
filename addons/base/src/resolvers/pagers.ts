import { PageData, PagerResolver } from "../../../../dist/addonTypes";
import * as builders from "@oceanicjs/builders"
import playdl, { SoundCloudTrack } from "play-dl";
import { getHighestResUrl } from "../../../../dist/utils.js";
import humanizeDuration from "humanize-duration";


export const youtube: PagerResolver = {
    name: "youtube",
    priority: 0,
    async available(url) {
        return [/https:\/\/(?:music|www)\.youtube\.com\/watch\?v=.*/,/https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    async queuedPager(track, index, cache) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const id = playdl.extractID(track.tracks[0].url);
        embed.addField("index", index.toString(), true)
        embed.addField("type", track.type, true)
        embed.addField("songs", track.tracks.length.toString(), true)
        const cachedata = await cache.get("youtube-queued-pager-data", id);
        if (cachedata) {
            embed.setImage(cachedata.extra.thumbnail)
        }
        else {
            const info = await playdl.video_basic_info(track.tracks[0].url)
            const thumbnail = getHighestResUrl(info);
            embed.setImage(thumbnail);
            await cache.cache("youtube-queued-pager-data", {
                id,
                title: track.name,
                extra: {
                    thumbnail
                }
            })
        }
        const data: PageData = {
            id: track.name,
            type: track.type,
            index,
            embed
        };
        return data;
    },
    async trackPager(track, index, cache) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const id = playdl.extractID(track.url);
        const data = await cache.get("youtube-track-pager-data", id);
        if (data) {
            embed.setImage(data.extra.thumbnail);
            // @ts-ignore
            embed.addField("Author", data.extra.channelname);
            embed.addField("Likes", data.extra.likes.toString());
            embed.addField("Views", data.extra.views.toString());
            embed.addField("Duration", humanizeDuration(data.extra.durationInSec * 1000));
            embed.addField("Uploaded", new Date(data.extra.uploadedAt as string).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"}));
        }
        else {
            const info = await playdl.video_basic_info(track.url)
            const thumbnail = getHighestResUrl(info);
            cache.cache("youtube-track-pager-data", {
                id,
                title: track.name,
                extra: {
                    channelname: info.video_details.channel?.name,
                    likes: info.video_details.likes,
                    views: info.video_details.views,
                    durationInSec: info.video_details.durationInSec,
                    uploadedAt: info.video_details.uploadedAt,
                    thumbnail
                }
            })
            embed.setImage(thumbnail);
            // @ts-ignore
            embed.addField("Author", info.video_details.channel.name);
            embed.addField("Likes", info.video_details.likes.toString());
            embed.addField("Views", info.video_details.views.toString());
            embed.addField("Duration", humanizeDuration(info.video_details.durationInSec * 1000));
            embed.addField("Uploaded", new Date(info.video_details.uploadedAt as string).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"}));
        }
        return {
            id: track.name,
            type: "song",
            index,
            embed
        } as PageData
    }
}

export const soundcloud: PagerResolver = {
    name: "soundcloud",
    priority: 0,
    async available(url) {
        return [/https:\/\/soundcloud\.com\/*./,/https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
    },
    async queuedPager(track, index) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const info = await playdl.soundcloud(track.tracks[0].url) as SoundCloudTrack;
        embed.setImage(info.thumbnail);
        // @ts-ignore
        embed.addField("Author", info.publisher?.artist);
        embed.addField("Duration", humanizeDuration(info.durationInSec * 1000));
        return {
            id: track.name,
            type: track.type,
            index,
            embed
        } as PageData
    },
    async trackPager(track, index) {
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const info = await playdl.soundcloud(track.url) as SoundCloudTrack;
        embed.setImage(info.thumbnail);
        // @ts-ignore
        embed.addField("Author", info.publisher?.artist);
        embed.addField("Duration", humanizeDuration(info.durationInSec * 1000));
        return {
            id: track.name,
            type: "song",
            index,
            embed
        } as PageData
    }
}