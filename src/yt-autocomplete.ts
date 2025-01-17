import http from "http";
import { AutocompleteChoice } from "oceanic.js";

type autocompleteResponse = [string, string[], unknown, {"google:suggestsubtypes": number[][]}];

function FormatString(str: string) {
    const replace = ["!", "%21", "*", "%2A", "(", "%28", ")", "%29", "'", "%27", ".", "%2E", "-", "%2D", "~", "%7E"]
    let newStr = encodeURIComponent(str);
    for (let i = 0; i < replace.length; i += 2) {
        newStr = newStr.replace(replace[i], replace[i + 1]);
    }
    return newStr;
}

function AutocompleteToChoices(results: string[]) {
    const choices: AutocompleteChoice[] = [];
    for (const result of results) {
        choices.push({ name: result, value: result });
    }
    return choices;
}

export default async function GetAutocomplete(query: string) {
    const baseUrl = "http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=";
    const formatted = FormatString(query);
    const resp = await new Promise<string>((resolve) => {
        http.get(`${baseUrl}${formatted}`, (res) => {
            let rawData = '';
            res.setEncoding("utf8");
            res.on("data", (chunk) => rawData += chunk);
            res.on("end", () => resolve(rawData));
        })
    });
    const parsed: autocompleteResponse = JSON.parse(resp);
    return AutocompleteToChoices(parsed[1]);
}