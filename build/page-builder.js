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
exports.CustomEjs = exports.buildPage = exports.buildComponentsHandlers = void 0;
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
function buildComponentsHandlers(minify) {
    var filename = (minify) ? "handler.min.js" : "handler.js";
    var concatenatedJsStr = "";
    CustomEjs.loadedComponents.forEach(function (component) {
        /* Build CSS */
        var jsFilepath = path.join(BUILD_DIR, "components", component, filename);
        if (fs.existsSync(jsFilepath)) {
            concatenatedJsStr += fs.readFileSync(jsFilepath) + "\n";
        }
    });
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
