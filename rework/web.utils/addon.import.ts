import fs from "fs";
import path from "path";
import { AddonInfo } from "./types";

function isExcluded(filePath: string, exclusionList: string[]) {
    return exclusionList.some(exclusion => {
        if (exclusion.endsWith("*")) {
            const prefix = exclusion.slice(0, -1); // Remove the trailing *
            return filePath.startsWith(prefix);
        } else if (exclusion.startsWith("*")) {
            const suffix = exclusion.slice(1); // Remove the leading *
            return filePath.endsWith(suffix);
        }
      return filePath === exclusion; // Exact match
    });
}

export default class addonLoader {
    addons: AddonInfo[] = [];
    private addonsRead: boolean = false;
    constructor() {
    }

    readAddonsSync() {
        this.readAddons();
        while (!this.addonsRead) {};
    }

    async readAddons() {
        for (const addon of fs.readdirSync(path.join(`${__dirname}`, "../../web-editor/addons"))) {
            console.log(`reading addon ${addon}`);
            // if addon is dir, re-call readAddons for addonPath/addon
            if (fs.statSync(`${path.join(`${__dirname}`, "../../web-editor/addons")}/${addon}`).isDirectory()) {
                console.log(`addon ${addon} is dir, reading from all files in ${addon}`)
                await this.readAddonFolder(`${path.join(`${__dirname}`, "../../web-editor/addons")}/${addon}`);
            }
            // else, continue as normal with importing addon.
            else {
                const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${path.join(`${__dirname}`, "../../web-editor/addons")}/${addon}`).then(m => m.default);
                if (addonInfo instanceof Array) {
                    console.log(`addon ${addon} has multiple addons, iterating.`)
                    addonInfo.forEach((saddon) => {
                        console.log(`reading addon ${saddon.name} from ${addon}`);
                        this.addons.push(saddon);
                    })
                }
                else {
                    this.addons.push(addonInfo);
                }
            }
            console.log(`addon ${addon} has been read`);
        }
        this.addonsRead = true;
    }

    async readAddonFolder(addonPath: string) {
        const exclusions = ["exclusions.json", "node_modules/*", "package.json", "package-lock.json"];
        if (fs.existsSync(`${addonPath}/exclusions.json`)) {
            const newExclusions = JSON.parse(fs.readFileSync(`${addonPath}/exclusions.json`, 'utf8'));
            for (const exclusion of newExclusions) {
                exclusions.push(exclusion.replace(/\//g, "\\"));
            }
        }
        for (const pathname of fs.readdirSync(addonPath, {recursive: true, encoding: "utf8"})) {
            if (fs.statSync(`${addonPath}/${pathname}`).isFile()) {
                if (!isExcluded(pathname, exclusions)) {
                    const addonInfo: AddonInfo | AddonInfo[] = await import(`file://${addonPath}/${pathname}`).then(m => m.default);
                    if (addonInfo instanceof Array) {
                        console.log(`addon ${path.basename(`${addonPath}/${pathname}`)} has multiple addons, iterating.`)
                        addonInfo.forEach((saddon) => {
                            console.log(`reading addon ${saddon.name} from ${pathname}`);
                            this.addons.push(saddon);
                        })
                    }
                    else {
                        this.addons.push(addonInfo);
                    }
                }
            }
        }
    }
}