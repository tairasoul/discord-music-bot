import fs from "node:fs";
import path from 'path';
import { fileURLToPath } from 'url';
import MusicClient from './client.js';
import addonLoader from "./addonLoader.js";
const __dirname = path.dirname(decodeURIComponent(fileURLToPath(import.meta.url)));
let debug = false;
if (fs.existsSync(`${__dirname}/enableDebugging`))
    debug = true;
export function debugLog(text) {
    if (debug)
        console.log(text);
}
let setup = false;
const { token } = JSON.parse(fs.readFileSync(path.join(__dirname, '..') + "/config.json", 'utf8'));
const client = new MusicClient({
    auth: token,
    allowedMentions: {
        roles: true,
        repliedUser: true,
    },
    gateway: {
        intents: [
            "GUILDS",
            "GUILD_MESSAGES",
            "MESSAGE_CONTENT",
            "GUILD_PRESENCES",
            "GUILD_MEMBERS",
            "GUILD_VOICE_STATES"
        ],
        autoReconnect: true,
        connectionTimeout: 900000
    }
});
const loader = new addonLoader(client);
client.on('voiceStateUpdate', (oldState, newState) => {
    const guild = client.m_guilds[oldState.guildID];
    if (client.getVoiceConnection(oldState.guildID) === undefined && guild.connection) {
        const connection = guild.connection;
        connection.disconnect();
        guild.connection = null;
        guild.voiceChannel = null;
    }
    else {
        if (guild.voiceChannel !== null && guild.connection) {
            const channel = guild.voiceChannel;
            const connection = guild.connection;
            debugLog(channel.voiceMembers.size);
            if (channel.voiceMembers.size == 1) {
                guild.leaveTimer = setTimeout(() => {
                    connection.disconnect();
                    guild.connection = null;
                    guild.voiceChannel = null;
                }, 60 * 1000);
            }
            else {
                if (guild.leaveTimer != null)
                    clearTimeout(guild.leaveTimer);
            }
        }
    }
});
client.on('error', (error) => {
    if (error instanceof Error) {
        console.log(`uh oh! an error has occured within MusicClient! error message: ${error.message}\nerror name: ${error.name}\nerror stack: ${error.stack || "none"}\nerror cause: ${error.cause || "no cause found"}`);
    }
    else {
        console.log(`uh oh! an error has occured within MusicClient! error is ${error}`);
    }
});
client.on("ready", async () => {
    if (setup)
        return;
    await loader.readAddons();
    loader.loadAddons();
    await client.loadCommands();
    loader.registerAddons();
    client.registerAddonCommands();
    for (const guild of client.guilds.values()) {
        console.log(`adding guild ${guild.id}`);
        client.addGuild(guild);
    }
    console.log("registering commands");
    await client.registerCommands();
    console.log("removing commands unknown to this client");
    await client.removeUnknownCommands();
    console.log("setup done");
});
client.on("guildCreate", (guild) => client.addGuild(guild));
client.on("guildDelete", (guild) => client.removeGuild(guild));
client.on("m_interactionCreate", async (interaction, resolvers, guild, m_client) => {
    const command = client.commands.get(interaction.data.name);
    if (!command) {
        return;
    }
    try {
        await command.execute(interaction, resolvers, guild, m_client);
    }
    catch (error) {
        if (error)
            console.error(error);
        if (!interaction.acknowledged) {
            await interaction.createMessage({ content: `There was an error while executing this command, error is ${error}` });
        }
        else {
            await interaction.editOriginal({ content: `There was an error while executing this command, error is ${error}` });
        }
    }
});
await client.connect();
