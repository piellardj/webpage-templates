import minimist = require("minimist");
import {Demopage, DemopageEmpty, Homepage} from "./index";

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

if (argv.page === "homepage") {
    Homepage.build(argv.outdir, argv.data);
} else if (argv.page === "demopage") {
    const debug = argv.debug === 1;
    Demopage.build(argv.outdir, argv.data, debug);
} else if (argv.page === "demopage-empty") {
    const debug = argv.debug === 1;
    DemopageEmpty.build(argv.outdir, argv.data, debug);
} else {
    outputErrorInvalidValue("page", argv.page);
    exitAndDisplayHelp(100);
}
