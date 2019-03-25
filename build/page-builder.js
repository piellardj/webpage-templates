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
var pretty = require("pretty");
var CustomEjs = __importStar(require("./custom-ejs"));
exports.CustomEjs = CustomEjs;
var APP_DIR = path.resolve(__dirname, "..", "app");
var BUILD_DIR = path.resolve(__dirname, "..", "build");
function buildLoadedComponents(dstDir) {
    var cssDir = path.join(dstDir, "css");
    fse.ensureDirSync(cssDir);
    var concatenatedCssStr = "";
    CustomEjs.loadedComponents.forEach(function (component) {
        /* Build CSS */
        var styleFilePath = path.join(BUILD_DIR, "components", component, "style.css");
        if (fs.existsSync(styleFilePath)) {
            concatenatedCssStr += fs.readFileSync(styleFilePath);
        }
        /* Copy assets */
        var assetsDir = path.resolve(APP_DIR, "components", component, "assets");
        if (fs.existsSync(assetsDir)) {
            fse.copySync(assetsDir, dstDir);
        }
    });
    fs.writeFileSync(path.join(cssDir, "page.css"), concatenatedCssStr);
}
function buildComponentsHandlers(minify, removeComments) {
    if (minify === void 0) { minify = false; }
    if (removeComments === void 0) { removeComments = true; }
    var filename = (minify) ? "handler.min.js" : "handler.js";
    var concatenatedJsStr = "";
    CustomEjs.loadedComponents.forEach(function (component) {
        /* Build CSS */
        var jsFilepath = path.join(BUILD_DIR, "components", component, filename);
        if (fs.existsSync(jsFilepath)) {
            concatenatedJsStr += fs.readFileSync(jsFilepath) + "\n";
        }
    });
    if (removeComments) {
        return concatenatedJsStr.replace(/(\n?.*)\/\*((?!\*\/).\n?)*\*\//g, "");
    }
    return concatenatedJsStr;
}
exports.buildComponentsHandlers = buildComponentsHandlers;
function buildPageHtml(dstDir, pageData) {
    fse.ensureDirSync(dstDir);
    var pageEjs = CustomEjs.loadComponent("page");
    var htmlStr = pretty(CustomEjs.render(pageEjs, pageData));
    fs.writeFileSync(path.join(dstDir, "index.html"), htmlStr);
}
function buildPage(dstDir, pageData) {
    buildPageHtml(dstDir, pageData);
    buildLoadedComponents(dstDir);
}
exports.buildPage = buildPage;
