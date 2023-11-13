import * as oceanic from "oceanic.js";
import { Guild, default as MusicClient, ResolverInformation } from "./client.js";
import { AudioResource } from "@discordjs/voice";
export type resolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * RegEx patterns that can be used internally or to identify if this resolver should be used.
     */
    regexMatches: RegExp[];
    /**
     * Function that resolves the URL into something like "youtube" or something more specific if necessary.
     */
    resolve: (url: string) => Promise<string | undefined>;
};
export type AudioResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * RegEx patterns that can be used internally or to identify if this resolver should be used.
     */
    regexMatches: RegExp[];
    /**
     * Function that turns a song URL into an audio resource from discordjs/voice and into infoData
     */
    resolve: (url: string) => Promise<{
        resource: AudioResource<any>;
        info: infoData;
    }>;
};
export type songData = {
    /**
     * Title of song.
     */
    title: string;
    /**
     * Url of song.
     */
    url: string;
};
export type playlistData = {
    /**
     * Title of playlist.
     */
    title: string;
    /**
     * Items in playlist.
     */
    items: songData[];
};
export type dataResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * RegEx patterns that can be used internally or to identify if this resolver should be used.
     */
    regexMatches: RegExp[];
    /**
     * Function that resolves the URL into song data.
     */
    resolve: (url: string) => Promise<songData | string>;
};
export type playlistResolver = {
    /**
     * Name of the resolver.
     */
    name: string;
    /**
     * RegEx patterns that can be used internally or to identify if this resolver should be used.
     */
    regexMatches: RegExp[];
    /**
     * Function that resolves the URL into playlist data.
     */
    resolve: (url: string) => Promise<playlistData | string>;
};
export type command = {
    /**
     * Name of command.
     */
    name: string;
    /**
     * Description of command.
     */
    description: string;
    /**
     * The command options.
     */
    options: oceanic.ApplicationCommandOptions[];
    /**
     * Callback for this command.
     */
    callback: (interaction: oceanic.CommandInteraction, resolvers: ResolverInformation, guild: Guild, client: MusicClient) => any;
};
export type AddonInfo = {
    /**
     * The name of your addon.
     */
    name: string;
    /**
     * Description of your addon.
     */
    description: string;
    /**
     * Addon version.
     */
    version: string;
    /**
     * Where can other people find the source of this addon?
     */
    sources?: string[];
    /**
     * Credits for this addon.
     */
    credits: string;
    /**
     * Song resolvers.
     */
    resolvers: resolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * A provider resolver.
     */
    type: "songResolver";
} | {
    /**
     * The name of your addon.
     */
    name: string;
    /**
     * Description of your addon.
     */
    description: string;
    /**
     * Addon version.
     */
    version: string;
    /**
     * Where can other people find the source of this addon?
     */
    sources?: string[];
    /**
     * Credits for this addon.
     */
    credits: string;
    /**
     * Commands this addon adds.
     */
    commands: command[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that adds its own commands.
     */
    type: "command";
} | {
    /**
     * The name of your addon.
     */
    name: string;
    /**
     * Description of your addon.
     */
    description: string;
    /**
     * Addon version.
     */
    version: string;
    /**
     * Where can other people find the source of this addon?
     */
    sources?: string[];
    /**
     * Credits for this addon.
     */
    credits: string;
    /**
     * List of song data resolvers.
     */
    dataResolvers: dataResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves song data into something usable.
     */
    type: "songDataResolver";
} | {
    /**
     * The name of your addon.
     */
    name: string;
    /**
     * Description of your addon.
     */
    description: string;
    /**
     * Addon version.
     */
    version: string;
    /**
     * Where can other people find the source of this addon?
     */
    sources?: string[];
    /**
     * Credits for this addon.
     */
    credits: string;
    /**
     * List of playlist resolvers.
     */
    playlistResolvers: playlistResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves playlists into usable data.
     */
    type: "playlistDataResolver";
} | {
    /**
     * The name of your addon.
     */
    name: string;
    /**
     * Description of your addon.
     */
    description: string;
    /**
     * Addon version.
     */
    version: string;
    /**
     * Where can other people find the source of this addon?
     */
    sources?: string[];
    /**
     * Credits for this addon.
     */
    credits: string;
    /**
     * List of playlist resolvers.
     */
    resourceResolvers: AudioResolver[];
    /**
     * Is this addon private?
     * Addons will not be shown when the user checks addons through /view-addons if it is.
     */
    private?: boolean;
    /**
     * An addon that resolves a song URL into an Audio Resource
     */
    type: "audioResourceResolver";
};
export type infoData = {
    /**
     * The uploader of the song.
     */
    channelName: string;
    /**
     * Likes for the song.
     * Set to "Unable to fetch likes" if you can't.
     */
    likes: string;
    /**
     * Views, if possible to be fetched.
     * Set to "Unable to fetch views" if you can't.
     */
    views: string;
    /**
     * Highest resolution URL for the thumbnail.
     */
    highestResUrl: string;
    /**
     * Duration in miliseconds.
     */
    durationInMs: number;
};
export default class addonLoader {
    private _client;
    private addons;
    constructor(client: MusicClient);
    readAddons(addonPath: string): Promise<void>;
    loadAddons(): void;
    registerAddons(): void;
}