"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var Builder = __importStar(require("./page-builder"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
