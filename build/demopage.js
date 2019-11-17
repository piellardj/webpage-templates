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
function buildPageData(jsonData) {
    var bodyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body"));
    var bodyStr = Builder.CustomEjs.render(bodyEjs, jsonData);
    return {
        bodyStr: bodyStr,
        cssFiles: [
            "css/page.css",
        ],
        description: jsonData.description,
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
    if (!isNumber(jsonData.canvas.width) || !isNumber(jsonData.canvas.height)) {
        console.error("ERROR: provide canvas dimensions with canvas.width and canvas.height.");
    }
    var setSizeStr = "Canvas.setMaxSize(" + jsonData.canvas.width +
        "," + jsonData.canvas.height + ");";
    var pageJsStr = Builder.buildComponentsHandlers(false) + setSizeStr;
    var pageJsMinStr = Builder.buildComponentsHandlers(true) + setSizeStr;
    if (pageJsStr) {
        var PAGE_JS_PATH = "script/page.js";
        var PAGE_JS_MIN_PATH = "script/page.min.js";
        pageData.scriptFiles.unshift((debug) ? PAGE_JS_PATH : PAGE_JS_MIN_PATH);
        fse.ensureDirSync(path.join(dstDir, "script"));
        fs.writeFileSync(path.join(dstDir, PAGE_JS_PATH), pageJsStr);
        fs.writeFileSync(path.join(dstDir, PAGE_JS_MIN_PATH), pageJsMinStr);
    }
    Builder.buildPage(dstDir, pageData);
}
exports.build = build;
