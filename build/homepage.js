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
    var mainData = { sections: jsonData.sections };
    var bodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    var bodyStr = Builder.CustomEjs.render(bodyEjs, mainData);
    return {
        bodyStr: bodyStr,
        cssFiles: ["css/page.css"],
        description: jsonData.description,
        scriptFiles: jsonData.scriptFiles || [],
        title: jsonData.title,
    };
}
function build(dstDir, jsonDataFilepath) {
    var jsonData = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    var pageData = buildPageData(jsonData);
    var pageJsStr = Builder.buildComponentsHandlers(false);
    var pageJsMinStr = Builder.buildComponentsHandlers(true);
    var SCRIPT_FOLDER = "script";
    var PAGE_JS_NAME = "page";
    var pageJsPath = path.join(SCRIPT_FOLDER, PAGE_JS_NAME + ".js");
    var pageJsMinPath = path.join(SCRIPT_FOLDER, PAGE_JS_NAME + ".min.js");
    fse.ensureDirSync(path.join(dstDir, SCRIPT_FOLDER));
    fs.writeFileSync(path.join(dstDir, pageJsPath), pageJsStr);
    fs.writeFileSync(path.join(dstDir, pageJsMinPath), pageJsMinStr);
    Builder.buildPage(dstDir, pageData);
}
exports.build = build;
