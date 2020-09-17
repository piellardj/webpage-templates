"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minimist = require("minimist");
var index_1 = require("./index");
function IsStringNullOrEmpty(str) {
    return typeof str !== "string" || str.length === 0;
}
function displayHelp() {
    console.log("\nUsage:");
    console.log("--page=[homepage | demopage] --data=%JSON_FILE% --outdir=%OUT_DIR% [--debug=1]");
}
function exitAndDisplayHelp(code) {
    displayHelp();
    process.exit(code);
}
function outputErrorInvalidValue(name, value) {
    console.error("Invalid value '" + value + "' for parameter '--" + name + "'.");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkArgs(providedArgs) {
    var argsToCheck = ["page", "data", "outdir"];
    var i = 0;
    for (var _i = 0, argsToCheck_1 = argsToCheck; _i < argsToCheck_1.length; _i++) {
        var argName = argsToCheck_1[_i];
        i++;
        var argValue = providedArgs[argName];
        if (IsStringNullOrEmpty(argValue)) {
            outputErrorInvalidValue(argName, argValue);
            exitAndDisplayHelp(i);
        }
    }
}
var argv = minimist(process.argv.slice(2));
checkArgs(argv);
if (argv.page === "homepage") {
    index_1.Homepage.build(argv.outdir, argv.data);
}
else if (argv.page === "demopage") {
    var debug = argv.debug === 1;
    index_1.Demopage.build(argv.outdir, argv.data, debug);
}
else if (argv.page === "demopage-empty") {
    var debug = argv.debug === 1;
    index_1.DemopageEmpty.build(argv.outdir, argv.data, debug);
}
else {
    outputErrorInvalidValue("page", argv.page);
    exitAndDisplayHelp(100);
}
