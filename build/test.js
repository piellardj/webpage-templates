"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
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
var dataStr = fs_1.default.readFileSync(argv.data).toString();
var data = JSON.parse(dataStr);
if (argv.page === "homepage") {
    index_1.Homepage.build(data, argv.outdir);
}
else if (argv.page === "demopage") {
    var debug = argv.debug === 1;
    index_1.Demopage.build(data, argv.outdir, { debug: debug });
}
else if (argv.page === "demopage-empty") {
    var debug = argv.debug === 1;
    index_1.DemopageEmpty.build(argv.outdir, argv.data, debug);
}
else {
    outputErrorInvalidValue("page", argv.page);
    exitAndDisplayHelp(100);
}
