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
var Builder = __importStar(require("../page-builder"));
function buildPageData(homepageData) {
    var homepageBodyData = { sections: homepageData.sections };
    var homepageBodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    var homepageBodyStr = Builder.CustomEjs.render(homepageBodyEjs, homepageBodyData);
    return {
        bodyStr: homepageBodyStr,
        cssFiles: ["css/page.css"],
        description: homepageData.description,
        scriptFiles: [],
        title: homepageData.title,
    };
}
/**
 *
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 */
function build(data, destinationDir) {
    var pageData = buildPageData(data);
    var pageJsStr = Builder.buildComponentsHandlers(false);
    var pageJsMinStr = Builder.buildComponentsHandlers(true);
    var SCRIPT_FOLDER = "script";
    var PAGE_JS_NAME = "page";
    var pageJsName = PAGE_JS_NAME + ".js";
    var pageJsMinName = PAGE_JS_NAME + ".min.js";
    pageData.scriptFiles.unshift(SCRIPT_FOLDER + "/" + pageJsMinName);
    fse.ensureDirSync(path.join(destinationDir, SCRIPT_FOLDER));
    fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsName), pageJsStr);
    fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsMinName), pageJsMinStr);
    Builder.buildPage(destinationDir, pageData);
}
exports.build = build;
