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
var PAGE_JS_MIN_PATH = "script/page.min.js";
function buildPageData(jsonData) {
    var mainData = { sections: jsonData.sections };
    var bodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    var bodyStr = Builder.CustomEjs.render(bodyEjs, mainData);
    return {
        bodyStr: bodyStr,
        cssFiles: ["css/page.css"],
        description: jsonData.description,
        scriptFiles: [PAGE_JS_MIN_PATH],
        title: jsonData.title,
    };
}
function build(dstDir, jsonDataFilepath) {
    var jsonData = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    var pageData = buildPageData(jsonData);
    Builder.buildPage(dstDir, pageData);
    buildHandlers(dstDir);
}
exports.build = build;
function buildHandlers(dstDir) {
    var pageJsStr = Builder.buildComponentsHandlers(false);
    var pageJsMinStr = Builder.buildComponentsHandlers(true);
    fse.ensureDirSync(path.join(dstDir, "script"));
    fs.writeFileSync(path.join(dstDir, PAGE_JS_PATH), pageJsStr);
    fs.writeFileSync(path.join(dstDir, PAGE_JS_MIN_PATH), pageJsMinStr);
}
