import fs from "fs";
import * as oceanic from "oceanic.js";
import { Guild, default as MusicClient } from "./client.js";

export type resolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<string | undefined>;
}

export type songData = {
    title: string;
    url: string;
}

export type playlistData = {
    title: string;
    items: songData[];
}

export type dataResolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<songData>;
}

export type playlistResolver = {
    name: string;
    regexMatches: RegExp[];
    resolve: (url: string) => Promise<playlistData>;
}

/*export type patch = {
    prefix: {
        
    } | undefined;
    postfix: {

    } | undefined;
    name: string;
}*/

export type command = {
    name: string;
    description: string;
    options: oceanic.ApplicationCommandOptions[];
    callback: (interaction: oceanic.CommandInteraction, guild: Guild, client: MusicClient) => any;
}

export type AddonInfo = {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    resolvers: resolver[];
    private?: boolean;
    type: "songResolver";
}/* | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    patches: patch[];
    private?: boolean;
    type: "patch";
}*/ | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    commands: command[];
    private?: boolean;
    type: "command";
} | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    dataResolvers: dataResolver[];
    private?: boolean;
    type: "songDataResolver";
} | {
    name: string;
    description: string;
    version: string;
    sources?: string[];
    credits: string;
    playlistResolvers: playlistResolver[];
    private?: boolean;
    type: "playlistDataResolver";
}

export default class addonLoader {
    private _client: MusicClient;
    private addons: AddonInfo[] = [];
    constructor(client: MusicClient) {
        this._client = client;
    }

    async readAddons(addonPath: string) {
        for (const addon of fs.readdirSync(addonPath)) {
            console.log(`reading addon ${addon}`);
            if (fs.statSync(`${addonPath}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`)
                await this.readAddons(`${addonPath}/${addon}`);
            }
            else {
                const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${addonPath}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`)
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    })
                }
                else this.addons.push(addonInfo);
            }
            console.log(`addon ${addon} has been read`);
        }
    }

    loadAddons() {
        for (const addon of this.addons) {
            console.log(`loading addon ${addon.name}`);
            this._client.addAddon(addon);
        }
    }

    registerAddons() {
        this._client.registerAddons();
    }
}