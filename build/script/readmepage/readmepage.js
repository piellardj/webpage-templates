"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
var path = require("path");
var fs = require("fs");
var showdown_1 = __importDefault(require("showdown"));
var Builder = __importStar(require("../page-builder"));
function buildPageData(readmepageData) {
    var readmeRaw = fs.readFileSync(readmepageData.readmeFilepath).toString();
    var user = "piellardj";
    var converter = new showdown_1.default.Converter();
    var readmeHtml = converter.makeHtml(readmeRaw);
    readmeHtml = readmeHtml.replace(/https:\/\/\S+\.mp4/gm, function (match) {
        return "<div style=\"text-align:center\">\n    <video controls muted><source src=\"".concat(match, "\" type=\"video/mp4\"></video>\n</div>");
    });
    var baseImageUrl = "https://github.com/".concat(user, "/").concat(readmepageData.repoName, "/raw/").concat(readmepageData.branchName);
    readmeHtml = readmeHtml.replace(/<img[^>]+src="([^"]+)"[^>]*\/>/gm, function (match, p1) {
        return match.replace(p1, "".concat(baseImageUrl, "/").concat(p1));
    });
    var readmepageBodyData = {
        projectUrl: "https://".concat(user, ".github.io/").concat(readmepageData.repoName, "/"),
        bodyStr: readmeHtml,
    };
    var readmepageBodyEjs = Builder.CustomEjs.loadComponent(path.join("readmepage", "body"));
    var readmepageBodyStr = Builder.CustomEjs.render(readmepageBodyEjs, readmepageBodyData);
    return {
        bodyStr: readmepageBodyStr,
        cssFiles: [],
        description: "Readme page of my project '".concat(readmepageData.projectName, "'. ").concat(readmepageData.description),
        scriptFiles: [],
        title: "".concat(readmepageData.projectName, " - Explanations"),
    };
}
/**
 *
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 */
function build(data, destinationDir) {
    var pageData = buildPageData(data);
    Builder.buildPage(destinationDir, pageData, {
        noScript: true,
    });
    Builder.CustomEjs.clearLoadedComponents();
}
exports.build = build;
