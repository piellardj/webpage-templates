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
function buildPageData(demopageEmptyData) {
    var demopageBodyEmptyData = demopageEmptyData;
    var demopageBodyEmptyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body-empty"));
    var demopageBodyEmptyStr = Builder.CustomEjs.render(demopageBodyEmptyEjs, demopageBodyEmptyData);
    var cssFiles = ["css/page.css"];
    if (demopageEmptyData.cssFiles) {
        cssFiles.push.apply(cssFiles, demopageEmptyData.cssFiles);
    }
    return {
        bodyStr: demopageBodyEmptyStr,
        cssFiles: cssFiles,
        description: demopageEmptyData.description,
        scriptFiles: demopageEmptyData.scriptFiles || [],
        title: demopageEmptyData.title,
    };
}
/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
function build(data, destinationDir, options) {
    var pageData = buildPageData(data);
    var pageJsStr = Builder.buildComponentsHandlers(false);
    var pageJsMinStr = Builder.buildComponentsHandlers(true);
    var pageJsDeclaration = Builder.buildComponentsDeclaration();
    if (pageJsStr) {
        var SCRIPT_FOLDER = "script";
        var PAGE_JS_NAME = "page";
        var pageJsName = PAGE_JS_NAME + ".js";
        var pageJsMinName = PAGE_JS_NAME + ".min.js";
        pageData.scriptFiles.unshift(SCRIPT_FOLDER + "/" + ((options === null || options === void 0 ? void 0 : options.debug) ? pageJsName : pageJsMinName));
        fse.ensureDirSync(path.join(destinationDir, SCRIPT_FOLDER));
        fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsName), pageJsStr);
        fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsMinName), pageJsMinStr);
    }
    Builder.buildPage(destinationDir, pageData);
    return {
        pageScriptDeclaration: pageJsDeclaration,
    };
}
exports.build = build;
