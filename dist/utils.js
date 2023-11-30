import fs from 'fs';
import * as oceanic from 'oceanic.js';
import * as builders from "@oceanicjs/builders";
import { Base64 as base64 } from "js-base64";
import playdl from "play-dl";
import humanizeDuration from 'humanize-duration';
import { debugLog } from './bot.js';
export function getHighestResUrl(data) {
    const thumbnails = data.video_details.thumbnails;
    let highestX = 0;
    let highestY = 0;
    let currentHighestUrl = "";
    for (const thumbnail of thumbnails) {
        debugLog(`checking thumbnail of width ${thumbnail.width} and height ${thumbnail.height}`);
        if (thumbnail.width > highestX && thumbnail.height > highestY) {
            debugLog(`thumbnail of width ${thumbnail.width} and height ${thumbnail.height} is bigger than previous thumbnail`);
            currentHighestUrl = thumbnail.url;
        }
    }
    return currentHighestUrl;
}
export function SelectMenu(options, customId) {
    const actionRow = new builders.ActionRow();
    actionRow.type = oceanic.ComponentTypes.ACTION_ROW;
    const selectMenu = new builders.SelectMenu(oceanic.ComponentTypes.STRING_SELECT, customId);
    const addedsongs = [];
    selectMenu.setPlaceholder('Nothing selected');
    for (const option in options) {
        if (!addedsongs.includes(options[option].name) && options[option].name != '') {
            addedsongs.push(options[option].name);
            const name = options[option].name;
            const value = options[option].value || name;
            const selectoptions = { label: name, value: value, default: false };
            selectMenu.addOptions(selectoptions);
        }
    }
    actionRow.addComponents(selectMenu);
    return actionRow;
}
export function mkdsf(path) {
    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}
/* taken from StackOverflow: https://stackoverflow.com/a/12646864/21098495 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
export function ComponentCallback(id, interaction, callback, client, timeoutOptions) {
    client.on('interactionCreate', async (i) => {
        /** @ts-ignore */
        if (i?.customId === undefined || i?.customId != id)
            return;
        /** @ts-ignore */
        await callback(i);
    });
    if (timeoutOptions && timeoutOptions.ms) {
        setTimeout(async () => {
            client.removeListener('interactionCreate', async (i) => {
                /** @ts-ignore */
                if (i?.customId === undefined || i?.customId != id)
                    return;
                /** @ts-ignore */
                await callback(i);
            });
            await timeoutOptions.callback(interaction);
        }, timeoutOptions.ms);
    }
}
// listen  for interactions from a specific guild, user and custom id
export function LFGIC(client, guildid, userid, customid, callback) {
    return client.on("interactionCreate", async (i) => {
        if (i.guildID != guildid)
            return;
        if (i.user.id != userid)
            return;
        /** @ts-ignore */
        if (i.data.customID != customid)
            return;
        /** @ts-ignore */
        await callback(i);
    });
}
export function encode(array) {
    const arr = JSON.stringify(array);
    return base64.encode(arr);
}
export function decodeStr(str) {
    const decoded = base64.decode(str);
    debugLog(decoded);
    return JSON.parse(decoded);
}
export class Page {
    iembed;
    idStr;
    index;
    type;
    constructor(embeds, id, index, type) {
        this.iembed = embeds;
        this.idStr = id;
        this.index = index;
        this.type = type;
    }
    get embed() {
        return this.iembed;
    }
    get id() {
        return this.idStr;
    }
}
export class PageHolder {
    pages;
    page = 0;
    constructor(pages) {
        this.pages = pages;
    }
    next() {
        this.page += 1;
        if (this.page === this.pages.length)
            this.page = 0;
    }
    back() {
        this.page -= 1;
        if (this.page === -1)
            this.page = this.pages.length - 1;
    }
    get currentPageNum() {
        return this.page;
    }
    get currentPage() {
        return this.pages[this.page];
    }
}
export function Pager(pages) {
    const PageClasses = [];
    for (const page of pages.pages) {
        PageClasses.push(new Page(page.embed, page.id, page.index, page.type));
    }
    return new PageHolder(PageClasses);
}
export async function queuedTrackPager(array, callback = () => { return new Promise((resolve) => resolve()); }) {
    const pages = [];
    for (let i = 0; i < array.length; i++) {
        try {
            const queued = array[i];
            await callback(queued.name);
            debugLog(`paging ${queued.name}`);
            debugLog(queued);
            const embed = new builders.EmbedBuilder();
            embed.setTitle(queued.name);
            embed.addField("index", i.toString(), true);
            embed.addField("type", queued.type, true);
            embed.addField("songs", queued.tracks.length.toString(), true);
            debugLog(queued.tracks[0].url);
            const info = await playdl.video_basic_info(queued.tracks[0].url);
            embed.setImage(getHighestResUrl(info));
            pages.push({
                embed: embed,
                id: queued.name,
                index: i,
                type: queued.type
            });
        }
        catch {
            await new Promise((resolve) => {
                setTimeout(async () => {
                    const queued = array[i];
                    await callback(queued.name);
                    debugLog(`paging ${queued.name}`);
                    debugLog(queued);
                    const embed = new builders.EmbedBuilder();
                    embed.setTitle(queued.name);
                    embed.addField("index", i.toString(), true);
                    embed.addField("type", queued.type, true);
                    embed.addField("songs", queued.tracks.length.toString(), true);
                    debugLog(queued.tracks[0].url);
                    const info = await playdl.video_basic_info(queued.tracks[0].url);
                    embed.setImage(getHighestResUrl(info));
                    pages.push({
                        embed: embed,
                        id: queued.name,
                        index: i,
                        type: queued.type
                    });
                    resolve();
                }, 5000);
            });
        }
    }
    return Pager({ pages: pages });
}
export function parseVolumeString(volume) {
    const percentRegex = /[^%]/g;
    let mode = "whole number";
    if (volume.match(/%/g))
        mode = "percent";
    const int = parseFloat(volume.match(percentRegex).join(''));
    if (mode == "percent") {
        var result = int / 100;
    }
    else {
        var result = int;
    }
    return result;
}
export async function trackPager(array, callback = () => { return new Promise((resolve) => resolve()); }) {
    const pages = [];
    for (let i = 0; i < array.length; i++) {
        try {
            const queued = array[i];
            await callback(queued.name);
            debugLog(`paging ${queued.name}`);
            debugLog(queued);
            const embed = new builders.EmbedBuilder();
            embed.setTitle(queued.name);
            embed.addField("index", i.toString(), true);
            const info = await playdl.video_basic_info(queued.url);
            debugLog(info.video_details.thumbnails);
            embed.setImage(getHighestResUrl(info));
            // @ts-ignore
            embed.addField("Author", info.video_details.channel.name);
            embed.addField("Likes", info.video_details.likes.toString());
            embed.addField("Views", info.video_details.views.toString());
            embed.addField("Duration", humanizeDuration(info.video_details.durationInSec * 1000));
            embed.addField("Uploaded", new Date(info.video_details.uploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
            pages.push({
                embed: embed,
                id: queued.name,
                index: i,
                type: "inspectedSong"
            });
        }
        catch {
            await new Promise((resolve) => {
                setTimeout(async () => {
                    const queued = array[i];
                    await callback(queued.name);
                    debugLog(`paging ${queued.name}`);
                    debugLog(queued);
                    const embed = new builders.EmbedBuilder();
                    embed.setTitle(queued.name);
                    embed.addField("index", i.toString(), true);
                    const info = await playdl.video_basic_info(queued.url);
                    debugLog(info.video_details.thumbnails);
                    embed.setImage(getHighestResUrl(info));
                    // @ts-ignore
                    embed.addField("Author", info.video_details.channel.name);
                    embed.addField("Likes", info.video_details.likes.toString());
                    embed.addField("Views", info.video_details.views.toString());
                    embed.addField("Duration", humanizeDuration(info.video_details.durationInSec * 1000));
                    embed.addField("Uploaded", new Date(info.video_details.uploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
                    pages.push({
                        embed: embed,
                        id: queued.name,
                        index: i,
                        type: "inspectedSong"
                    });
                    resolve();
                }, 5000);
            });
        }
    }
    return Pager({ pages: pages });
}
export async function pageTrack(track) {
    try {
        debugLog(`paging ${track.name}`);
        debugLog(track);
        const embed = new builders.EmbedBuilder();
        embed.setTitle(track.name);
        const info = await playdl.video_basic_info(track.url);
        debugLog(info.video_details.thumbnails);
        embed.setImage(getHighestResUrl(info));
        // @ts-ignore
        embed.addField("Author", info.video_details.channel.name);
        embed.addField("Likes", info.video_details.likes.toString());
        embed.addField("Views", info.video_details.views.toString());
        embed.addField("Duration", humanizeDuration(info.video_details.durationInSec * 1000));
        embed.addField("Uploaded", new Date(info.video_details.uploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
        return {
            embed: embed,
            id: track.name,
            type: "inspectedSong"
        };
    }
    catch {
        return new Promise((resolve) => {
            setTimeout(async () => {
                debugLog(`paging ${track.name}`);
                debugLog(track);
                const embed = new builders.EmbedBuilder();
                embed.setTitle(track.name);
                const info = await playdl.video_basic_info(track.url);
                debugLog(info.video_details.thumbnails);
                embed.setImage(getHighestResUrl(info));
                // @ts-ignore
                embed.addField("Author", info.video_details.channel.name);
                embed.addField("Likes", info.video_details.likes.toString());
                embed.addField("Views", info.video_details.views.toString());
                embed.addField("Duration", humanizeDuration(info.video_details.durationInSec * 1000));
                embed.addField("Uploaded", new Date(info.video_details.uploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
                resolve({
                    embed: embed,
                    id: track.name,
                    type: "inspectedSong"
                });
            }, 5000);
        });
    }
}
export default {
    SelectMenu,
    mkdsf,
    shuffleArray,
    ComponentCallback,
    LFGIC,
    encode,
    decodeStr,
    Pager,
    queuedTrackPager,
    trackPager,
    pageTrack,
    getHighestResUrl,
    parseVolumeString
};
