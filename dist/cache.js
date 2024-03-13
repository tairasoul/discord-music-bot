import pkg from "knex";
const { knex } = pkg;
import { debugLog } from "./bot.js";
import ms from "ms";
export default class Cache {
    database;
    expiryOffset;
    constructor(databasePath = "./cache.db", database_expiry_time = "3d") {
        this.expiryOffset = ms(database_expiry_time);
        this.database = knex({
            client: "better-sqlite3",
            connection: {
                filename: databasePath
            },
            useNullAsDefault: true
        });
    }
    async createTableIfNotExists(service) {
        const tableExists = await this.database.schema.hasTable(service);
        if (!tableExists) {
            await this.database.schema.createTable(service, (table) => {
                table.string('id').primary();
                table.string('title');
                table.integer('expires');
                table.json('extra');
            });
        }
    }
    async isCached(service, id) {
        const query = await this.database(service).where("id", id).first();
        return query !== undefined;
    }
    async isValid(service, id) {
        const query = await this.database(service).where("id", id).first();
        const time = Date.now();
        if (query) {
            return time < query.expires;
        }
        return false;
    }
    async cache(service, info) {
        debugLog(`caching ${info.id} for ${service}`);
        const processed = {
            title: info.title,
            id: info.id,
            extra: info.extra,
            expires: Date.now() + this.expiryOffset
        };
        await this.database(service).insert(processed);
    }
    async uncache(service, id) {
        await this.database(service).where("id", id).del();
    }
    async removeInvalidFromTable(service) {
        const time = Date.now();
        await this.database(service).where("expires", "<", time).del();
    }
    async removeInvalidFromAllTables() {
        const tables = await this.getAllTables();
        for (const table of tables) {
            await this.removeInvalidFromTable(table);
        }
    }
    async getAllTables() {
        const result = await this.database.raw("SELECT name FROM sqlite_master WHERE type='table';");
        return result.map(row => row.name);
    }
    async get(service, id) {
        await this.createTableIfNotExists(service);
        const cached = await this.isCached(service, id);
        if (cached) {
            const valid = await this.isValid(service, id);
            if (valid) {
                const info = (await this.database(service).where("id", id).first());
                const newInfo = {
                    title: info.title,
                    id: info.id,
                    extra: JSON.parse(info.extra)
                };
                return newInfo;
            }
            else {
                await this.uncache(service, id);
            }
        }
        return null;
    }
    async getRaw(service, id) {
        await this.createTableIfNotExists(service);
        const cached = await this.isCached(service, id);
        if (cached) {
            const valid = await this.isValid(service, id);
            if (valid) {
                const info = (await this.database(service).where("id", id).first());
                return info;
            }
            else {
                await this.uncache(service, id);
            }
        }
        return null;
    }
}
