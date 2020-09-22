import * as fs from "fs";
import minimist = require("minimist");
import { Demopage, DemopageEmpty, Homepage } from "../../build/script/index";

function IsStringNullOrEmpty(str: unknown): boolean {
    return typeof str !== "string" || str.length === 0;
}

function displayHelp(): void {
    console.log("\nUsage:");
    console.log("--page=[homepage | demopage] --data=%JSON_FILE% --outdir=%OUT_DIR% [--debug=1]");
}

function exitAndDisplayHelp(code: number): void {
    displayHelp();
    process.exit(code);
}

function outputErrorInvalidValue(name: string, value: unknown): void {
    console.error("Invalid value '" + value + "' for parameter '--" + name + "'.");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkArgs(providedArgs: any): void {
    const argsToCheck = ["page", "data", "outdir"];
    let i = 0;
    for (const argName of argsToCheck) {
        i++;
        const argValue = providedArgs[argName];
        if (IsStringNullOrEmpty(argValue)) {
            outputErrorInvalidValue(argName, argValue);
            exitAndDisplayHelp(i);
        }
    }
}

const argv = minimist(process.argv.slice(2));
checkArgs(argv);

const dataStr = fs.readFileSync(argv.data).toString();
const data = JSON.parse(dataStr);

if (argv.page === "homepage") {
    Homepage.build(data, argv.outdir);
} else if (argv.page === "demopage") {
    const debug = argv.debug === 1;
    Demopage.build(data, argv.outdir, { debug: debug });
} else if (argv.page === "demopage-empty") {
    DemopageEmpty.build(data, argv.outdir);
} else {
    outputErrorInvalidValue("page", argv.page);
    exitAndDisplayHelp(100);
}
