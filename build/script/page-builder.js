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
/**
 * Can be a JS script (.js), a minified JS script (.min.js) or a declaration file (.d.ts).
 * The dependency declaration format is '/// <reference path="PATH_TO_DEPENDENCY"/>'.
 */
var LoadedScript = /** @class */ (function () {
    function LoadedScript(filepath) {
        this.dependencies = [];
        var rawScript = fs.readFileSync(filepath).toString();
        var referenceLines = rawScript.match(LoadedScript.referenceRegexp) || [];
        for (var _i = 0, referenceLines_1 = referenceLines; _i < referenceLines_1.length; _i++) {
            var referenceLine = referenceLines_1[_i];
            var match = referenceLine.match(/"(.*)"/);
            if (match && match[1]) {
                this.dependencies.push(match[1]);
            }
            else {
                throw new Error("Should not happen: failed to extract reference name from '" + referenceLine + "'.");
            }
        }
        this.script = rawScript.replace(LoadedScript.referenceRegexp, "");
    }
    LoadedScript.referenceRegexp = /^\/\/\/\s*<\s*reference\s+path\s*=\s*"(.*)"\s*\/>.*$/gm;
    return LoadedScript;
}());
function loadHandlerAndDependencies(dictionary, scriptAbsolutePath) {
    if (dictionary[scriptAbsolutePath]) {
        // console.log("Skipping loading of '" + scriptAbsolutePath + "' because it is already loaded.");
        return;
    }
    var scriptId = scriptAbsolutePath;
    var scriptPath = path.parse(scriptAbsolutePath);
    var script = new LoadedScript(scriptAbsolutePath);
    var scriptMinifiedFilepath = path.format({
        dir: scriptPath.dir,
        name: scriptPath.name,
        ext: ".min.js",
    });
    var scriptMinified = new LoadedScript(scriptMinifiedFilepath);
    var scriptDeclarationFilepath = path.format({
        dir: scriptPath.dir,
        name: scriptPath.name,
        ext: ".d.ts",
    });
    var scriptDeclaration = new LoadedScript(scriptDeclarationFilepath);
    var dependenciesAbsolutePaths = [];
    for (var _i = 0, _a = script.dependencies; _i < _a.length; _i++) {
        var rawDependencyPath = _a[_i];
        // handlers.js contain references to .ts files, but we want to include their .js transpiled version.
        var dependencyPath = path.parse(rawDependencyPath);
        dependencyPath.ext = ".js";
        dependencyPath.base = "";
        var actualPath = path.format(dependencyPath);
        dependenciesAbsolutePaths.push(path.resolve(scriptPath.dir, actualPath));
    }
    dictionary[scriptId] = {
        id: scriptId,
        script: script.script,
        scriptMinified: scriptMinified.script,
        scriptDeclaration: scriptDeclaration.script,
        dependenciesIds: dependenciesAbsolutePaths,
    };
    for (var _b = 0, dependenciesAbsolutePaths_1 = dependenciesAbsolutePaths; _b < dependenciesAbsolutePaths_1.length; _b++) {
        var dependencyPath = dependenciesAbsolutePaths_1[_b];
        loadHandlerAndDependencies(dictionary, dependencyPath);
    }
}
function orderDependencies(unorderedHandlers) {
    var registeredHandlers = [];
    var registeredHandlersSet = new Set(); // for faster lookup than looping through registeredHandlers.id
    while (unorderedHandlers.length > 0) {
        var handlersLeft = [];
        for (var _i = 0, unorderedHandlers_1 = unorderedHandlers; _i < unorderedHandlers_1.length; _i++) {
            var handler = unorderedHandlers_1[_i];
            var allDependenciesRegistered = true;
            for (var _a = 0, _b = handler.dependenciesIds; _a < _b.length; _a++) {
                var dependency = _b[_a];
                if (!registeredHandlersSet.has(dependency)) {
                    allDependenciesRegistered = false;
                    break;
                }
            }
            if (allDependenciesRegistered) {
                registeredHandlers.push(handler);
                registeredHandlersSet.add(handler.id);
            }
            else {
                handlersLeft.push(handler);
            }
        }
        if (handlersLeft.length === unorderedHandlers.length) {
            for (var _c = 0, handlersLeft_1 = handlersLeft; _c < handlersLeft_1.length; _c++) {
                var handlerLeft = handlersLeft_1[_c];
                console.log(handlerLeft.id + " depends on:");
                for (var _d = 0, _e = handlerLeft.dependenciesIds; _d < _e.length; _d++) {
                    var dependency = _e[_d];
                    console.log("  - " + dependency);
                }
            }
            throw new Error("Failed to order dependencies (maybe circular dependencies ?).");
        }
        unorderedHandlers = handlersLeft;
    }
    return registeredHandlers;
}
function buildLoadedComponents(dstDir) {
    var components = {
        cssStyles: [],
        handlers: {},
    };
    CustomEjs.loadedComponents.forEach(function (componentName) {
        /* Copy assets */
        var assetsDir = path.join(APP_DIR, "components", componentName, "assets");
        if (fs.existsSync(assetsDir)) {
            fse.copySync(assetsDir, dstDir);
        }
        /* Load style and scripts */
        var componentDirectory = path.join(BUILD_DIR, "components", componentName);
        var styleFilePath = path.join(componentDirectory, "style.css");
        if (fs.existsSync(styleFilePath)) {
            var style = fs.readFileSync(styleFilePath).toString();
            components.cssStyles.push(style);
        }
        var handlerScriptFilePath = path.join(componentDirectory, "handler.js");
        if (fs.existsSync(handlerScriptFilePath)) {
            loadHandlerAndDependencies(components.handlers, handlerScriptFilePath);
        }
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
        var filename = (options === null || options === void 0 ? void 0 : options.minifyScript) ? pageJsMinFilename : pageJsFilename;
        pageData.scriptFiles.unshift(pageJsFolder + "/" + filename);
    }
    pageData.cssFiles.unshift(pageCssFolder + "/" + pageCssFilename);
    buildPageHtml(dstDir, pageData);
    var components = buildLoadedComponents(dstDir);
    var cssStyle = "";
    for (var _i = 0, _a = components.cssStyles; _i < _a.length; _i++) {
        var componentStyle = _a[_i];
        cssStyle += componentStyle;
    }
    if (cssStyle) {
        safeWriteFile(path.join(dstDir, pageCssFolder), pageCssFilename, cssStyle);
    }
    var orderedHandlers = orderDependencies(Object.values(components.handlers));
    var script = "";
    var scriptMinified = "";
    var scriptDeclaration = "";
    for (var _b = 0, orderedHandlers_1 = orderedHandlers; _b < orderedHandlers_1.length; _b++) {
        var handler = orderedHandlers_1[_b];
        script += handler.script + "\n";
        scriptMinified += handler.scriptMinified + "\n";
        scriptDeclaration += handler.scriptDeclaration + "\n";
    }
    if (options && options.additionalScript) {
        script += options.additionalScript;
        scriptMinified += options.additionalScript;
    }
    var hasScript = script && /\S/.test(script); // script must have at least one non-whistespace character
    if (hasScript) {
        if (includeScript) {
            safeWriteFile(path.join(dstDir, pageJsFolder), pageJsFilename, script);
            safeWriteFile(path.join(dstDir, pageJsFolder), pageJsMinFilename, scriptMinified);
        }
        else {
            console.log("The page needs scripts but the page build options prevents from including them.");
            console.log("===");
            console.log(script);
            console.log("===");
            process.exit(1);
        }
    }
    return {
        pageScriptDeclaration: scriptDeclaration,
    };
}
exports.buildPage = buildPage;
