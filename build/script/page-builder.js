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
exports.CustomEjs = exports.buildPage = void 0;
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var pretty = require("pretty");
var CustomEjs = __importStar(require("./custom-ejs"));
exports.CustomEjs = CustomEjs;
var APP_DIR = path.resolve(__dirname, "..", "..", "app");
var BUILD_DIR = path.resolve(__dirname, "..", "..", "build");
function safeWriteFile(directory, filename, content) {
    fse.ensureDirSync(directory);
    fs.writeFileSync(path.join(directory, filename), content);
}
function buildLoadedComponents(dstDir) {
    var components = [];
    CustomEjs.loadedComponents.forEach(function (componentName) {
        /* Copy assets */
        var assetsDir = path.join(APP_DIR, "components", componentName, "assets");
        if (fs.existsSync(assetsDir)) {
            fse.copySync(assetsDir, dstDir);
        }
        /* Load style and scripts */
        var component = {};
        var styleFilePath = path.join(BUILD_DIR, "components", componentName, "style.css");
        if (fs.existsSync(styleFilePath)) {
            component.cssStyle = fs.readFileSync(styleFilePath).toString();
        }
        var handlerScriptFilePath = path.join(BUILD_DIR, "components", componentName, "handler.js");
        if (fs.existsSync(handlerScriptFilePath)) {
            var handlerScript = fs.readFileSync(handlerScriptFilePath).toString();
            var handlerScriptMinifiedFilepath = path.join(BUILD_DIR, "components", componentName, "handler.min.js");
            var handlerScriptMinified = fs.readFileSync(handlerScriptMinifiedFilepath).toString();
            var handlerScriptDeclarationFilepath = path.join(BUILD_DIR, "components", componentName, "handler.d.ts");
            var handlerDeclaration = fs.readFileSync(handlerScriptDeclarationFilepath).toString();
            component.handler = {
                script: handlerScript,
                scriptMinified: handlerScriptMinified,
                scriptDeclaration: handlerDeclaration,
            };
        }
        components.push(component);
    });
    return components;
}
function buildPageHtml(dstDir, pageData) {
    fse.ensureDirSync(dstDir);
    var pageEjs = CustomEjs.loadComponent("page");
    var htmlStr = pretty(CustomEjs.render(pageEjs, pageData));
    fs.writeFileSync(path.join(dstDir, "index.html"), htmlStr);
}
function buildPage(dstDir, pageData, options) {
    var pageJsFolder = "script";
    var pageJsFilename = "page.js";
    var pageJsMinFilename = "page.min.js";
    var pageCssFolder = "css";
    var pageCssFilename = "page.css";
    var includeScript = (typeof (options === null || options === void 0 ? void 0 : options.noScript) === "boolean") ? !options.noScript : true;
    if (includeScript) {
        pageData.scriptFiles.unshift(pageJsFolder + "/" + ((options === null || options === void 0 ? void 0 : options.minifyScript) ? pageJsMinFilename : pageJsFilename));
    }
    pageData.cssFiles.unshift(pageCssFolder + "/" + pageCssFilename);
    buildPageHtml(dstDir, pageData);
    var components = buildLoadedComponents(dstDir);
    var cssStyle = "";
    var script = "";
    var scriptMinified = "";
    var scriptDeclaration = "";
    for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
        var component = components_1[_i];
        if (component.cssStyle) {
            cssStyle += component.cssStyle;
        }
        if (component.handler) {
            script += component.handler.script + "\n";
            scriptMinified += component.handler.scriptMinified + "\n";
            scriptDeclaration += component.handler.scriptDeclaration + "\n";
        }
    }
    if (options && options.additionalScript) {
        script += options.additionalScript;
        scriptMinified += options.additionalScript;
    }
    if (script) {
        if (includeScript) {
            safeWriteFile(path.join(dstDir, pageJsFolder), pageJsFilename, script);
            safeWriteFile(path.join(dstDir, pageJsFolder), pageJsMinFilename, scriptMinified);
        }
        else {
            console.log("The page needs scripts but the page build options prevents from including them.");
            process.exit(1);
        }
    }
    if (cssStyle) {
        safeWriteFile(path.join(dstDir, pageCssFolder), pageCssFilename, cssStyle);
    }
    return {
        pageScriptDeclaration: (includeScript) ? scriptDeclaration : "",
    };
}
exports.buildPage = buildPage;
