import { AddonInfo } from "../../../dist/addonTypes";
import playdl, { SoundCloudStream, SoundCloudTrack } from "play-dl";
import { createAudioResource } from "@discordjs/voice";
import utils from "../../../dist/utils.js";

const addon: AddonInfo = {
    name: "Base Addon",
    description: "Base resolvers for YADMB.",
    credits: "tairasoul",
    version: "1.0.0",
    type: "audioResourceResolver",
    sources: [
        "https://github.com/tairasoul/YADMB/tree/main/addons/base/"
    ],
    resourceResolvers: [
        {
            name: "youtube-resolver",
            priority: 0,
            async available(url) {
                return [/https:\/\/(?:music|www)\.youtube\.com\/watch\?v=.*/,/https:\/\/youtu\.be\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            async resolve(url) {
                const info = await playdl.video_info(url);
                const stream = await playdl.stream_from_info(info);
                const resource = createAudioResource<any>(stream.stream, {
                    inlineVolume: true,
                    inputType: stream.type
                });
                return {
                    resource,
                    info: {
                        channelName: info.video_details.channel?.name || "Could not get channel name.",
                        durationInMs: info.video_details.durationInSec * 1000,
                        fields: [
                            {name: "Likes", value: info.video_details.likes.toString()},
                            {name: "Views", value: info.video_details.views.toString()}
                        ],
                        highestResUrl: utils.getHighestResUrl(info)
                    }
                }
            }
        },
        {
            name: "soundcloud-resolver",
            async available(url) {
                return [/https:\/\/soundcloud\.com\/.*/,/https:\/\/on\.soundcloud\.com\/.*/].find((reg) => reg.test(url)) != undefined;
            },
            priority: 0,
            async resolve(url) {
                const so = await playdl.soundcloud(url) as SoundCloudTrack;
                const stream = await playdl.stream(url) as SoundCloudStream;
                const resource = createAudioResource<any>(stream.stream, {
                    inlineVolume: true,
                    inputType: stream.type
                });
                return {
                    resource,
                    info: {
                        channelName: so.publisher?.name || so.publisher?.artist || "Could not get publisher name.",
                        durationInMs: so.durationInMs,
                        highestResUrl: so.thumbnail
                    }
                }
            }
        }
    ]
}

export default addon;