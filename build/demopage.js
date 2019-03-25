"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var Builder = __importStar(require("./page-builder"));
var PAGE_JS_PATH = "script/page.js";
function buildPageData(jsonData) {
    var mainEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "main"));
    var mainStr = Builder.CustomEjs.render(mainEjs, jsonData);
    return {
        cssFiles: [
            "css/page.css",
        ],
        description: jsonData.description,
        mainStr: mainStr,
        scriptFiles: jsonData.scriptFiles || [],
        title: jsonData.title,
    };
}
function isNumber(v) {
    return typeof v === "number";
}
function build(dstDir, jsonDataFilepath, debug) {
    if (debug === void 0) { debug = false; }
    var jsonData = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    var pageData = buildPageData(jsonData);
    var pageJsStr = Builder.buildComponentsHandlers(debug, true);
    if (isNumber(jsonData.canvas.width) && isNumber(jsonData.canvas.height)) {
        pageJsStr += "Canvas.setMaxSize(" + jsonData.canvas.width +
            "," + jsonData.canvas.height + ");";
    }
    else {
        console.error("ERROR: provide canvas dimensions with canvas.width and canvas.height.");
    }
    pageData.scriptFiles.unshift(PAGE_JS_PATH);
    fse.ensureDirSync(path.join(dstDir, "script"));
    fs.writeFileSync(path.join(dstDir, PAGE_JS_PATH), pageJsStr);
    Builder.buildPage(dstDir, pageData);
}
exports.build = build;
