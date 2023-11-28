import { AudioResolver, dataResolver, playlistResolver, resolver } from "./addonLoader";
import { ResolverInformation } from "./client.js";
export default class ResolverUtils {
    resolvers: ResolverInformation;
    constructor(resolverInfo: ResolverInformation);
    getAudioResolvers(url: string): Promise<AudioResolver[]>;
    getPlaylistResolvers(url: string): Promise<playlistResolver[]>;
    getNameResolvers(url: string): Promise<resolver[]>;
    getSongResolvers(url: string): Promise<dataResolver[]>;
    getSongThumbnail(url: string): Promise<string | undefined>;
    getPlaylistThumbnail(url: string): Promise<string | undefined>;
}