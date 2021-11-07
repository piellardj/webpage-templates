import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");
import pretty = require("pretty");

import IPage from "../components/page/template-interface";

import * as CustomEjs from "./custom-ejs";

const APP_DIR = path.resolve(__dirname, "..", "..", "app");
const BUILD_DIR = path.resolve(__dirname, "..", "..", "build");

function safeWriteFile(directory: string, filename: string, content: string): void {
    fse.ensureDirSync(directory);
    fs.writeFileSync(path.join(directory, filename), content);
}

/**
 * Can be a JS script (.js), a minified JS script (.min.js) or a declaration file (.d.ts).
 * The dependency declaration format is '/// <reference path="PATH_TO_DEPENDENCY"/>'.
 */
class LoadedScript {
    public readonly script: string; // all dependencies declaration line are removed
    public readonly dependencies: string[]; // raw (non-resolved) path to dependencies

    public constructor(filepath: string) {
        this.dependencies = [];

        const rawScript = fs.readFileSync(filepath).toString();
        const referenceLines: string[] = rawScript.match(LoadedScript.referenceRegexp) || [];
        for (const referenceLine of referenceLines) {
            const match = referenceLine.match(/"(.*)"/);
            if (match && match[1]) {
                this.dependencies.push(match[1]);
            } else {
                throw new Error("Should not happen: failed to extract reference name from '" + referenceLine + "'.");
            }
        }

        this.script = rawScript.replace(LoadedScript.referenceRegexp, "");
    }

    private static referenceRegexp = /^\/\/\/\s*<\s*reference\s+path\s*=\s*"(.*)"\s*\/>.*$/gm;
}

interface IHandler {
    id: string;

    script: string;
    scriptMinified: string;
    scriptDeclaration: string;

    dependenciesIds: string[]; // script files
}

type HandlerDictionary = { [handlerId: string]: IHandler };

function loadHandlerAndDependencies(dictionary: HandlerDictionary, scriptAbsolutePath: string): void {
    if (dictionary[scriptAbsolutePath]) {
        // console.log("Skipping loading of '" + scriptAbsolutePath + "' because it is already loaded.");
        return;
    }

    const scriptId = scriptAbsolutePath;
    const scriptPath = path.parse(scriptAbsolutePath);

    const script = new LoadedScript(scriptAbsolutePath);

    const scriptMinifiedFilepath = path.format({
        dir: scriptPath.dir,
        name: scriptPath.name,
        ext: ".min.js",
    });
    const scriptMinified = new LoadedScript(scriptMinifiedFilepath);

    const scriptDeclarationFilepath = path.format({
        dir: scriptPath.dir,
        name: scriptPath.name,
        ext: ".d.ts",
    });
    const scriptDeclaration = new LoadedScript(scriptDeclarationFilepath);

    const dependenciesAbsolutePaths: string[] = [];
    for (const rawDependencyPath of script.dependencies) {
        // handlers.js contain references to .ts files, but we want to include their .js transpiled version.
        const dependencyPath = path.parse(rawDependencyPath);
        dependencyPath.ext = ".js";
        dependencyPath.base = "";
        const actualPath = path.format(dependencyPath);
        dependenciesAbsolutePaths.push(path.resolve(scriptPath.dir, actualPath));
    }

    dictionary[scriptId] = {
        id: scriptId,
        script: script.script,
        scriptMinified: scriptMinified.script,
        scriptDeclaration: scriptDeclaration.script,
        dependenciesIds: dependenciesAbsolutePaths,
    };

    for (const dependencyPath of dependenciesAbsolutePaths) {
        loadHandlerAndDependencies(dictionary, dependencyPath);
    }
}

function orderDependencies(unorderedHandlers: IHandler[]): IHandler[] {
    const registeredHandlers: IHandler[] = [];
    const registeredHandlersSet = new Set<string>(); // for faster lookup than looping through registeredHandlers.id

    while (unorderedHandlers.length > 0) {
        const handlersLeft: IHandler[] = [];

        for (const handler of unorderedHandlers) {
            let allDependenciesRegistered = true;
            for (const dependency of handler.dependenciesIds) {
                if (!registeredHandlersSet.has(dependency)) {
                    allDependenciesRegistered = false;
                    break;
                }
            }

            if (allDependenciesRegistered) {
                registeredHandlers.push(handler);
                registeredHandlersSet.add(handler.id);
            } else {
                handlersLeft.push(handler);
            }
        }

        if (handlersLeft.length === unorderedHandlers.length) {
            for (const handlerLeft of handlersLeft) {
                console.log(handlerLeft.id + " depends on:");
                for (const dependency of handlerLeft.dependenciesIds) {
                    console.log("  - " + dependency);
                }
            }

            throw new Error("Failed to order dependencies (maybe circular dependencies ?).");
        }
        unorderedHandlers = handlersLeft;
    }

    return registeredHandlers;
}

interface ILoadedComponents {
    cssStyles: string[];
    handlers: HandlerDictionary;
}

function buildLoadedComponents(dstDir: string): ILoadedComponents {
    const components: ILoadedComponents = {
        cssStyles: [],
        handlers: {},
    };

    CustomEjs.loadedComponents.forEach((componentName) => {
        /* Copy assets */
        const assetsDir = path.join(APP_DIR, "components", componentName, "assets");
        if (fs.existsSync(assetsDir)) {
            fse.copySync(assetsDir, dstDir);
        }

        /* Load style and scripts */
        const componentDirectory = path.join(BUILD_DIR, "components", componentName);

        const styleFilePath = path.join(componentDirectory, "style.css");
        if (fs.existsSync(styleFilePath)) {
            const style = fs.readFileSync(styleFilePath).toString();
            components.cssStyles.push(style);
        }

        const handlerScriptFilePath = path.join(componentDirectory, "handler.js");
        if (fs.existsSync(handlerScriptFilePath)) {
            loadHandlerAndDependencies(components.handlers, handlerScriptFilePath);
        }
    });

    return components;
}

function buildPageHtml(dstDir: string, pageData: IPage): void {
    fse.ensureDirSync(dstDir);

    const pageEjs = CustomEjs.loadComponent("page");
    const htmlStr = pretty(CustomEjs.render(pageEjs, pageData));
    fs.writeFileSync(path.join(dstDir, "index.html"), htmlStr);
}

interface IBuildOptions {
    additionalScript?: string;
    minifyScript?: boolean;
    noScript?: boolean;
}

interface IBuildResult {
    pageScriptDeclaration: string;
}

function buildPage(dstDir: string, pageData: IPage, options?: IBuildOptions): IBuildResult {
    const pageJsFolder = "script";
    const pageJsFilename = "page.js";
    const pageJsMinFilename = "page.min.js";

    const pageCssFolder = "css";
    const pageCssFilename = "page.css";

    const includeScript = (typeof options?.noScript === "boolean") ? !options.noScript : true;

    if (includeScript) {
        const filename = (options?.minifyScript) ? pageJsMinFilename : pageJsFilename;
        pageData.scriptFiles.unshift(pageJsFolder + "/" + filename);
    }
    pageData.cssFiles.unshift(pageCssFolder + "/" + pageCssFilename);

    buildPageHtml(dstDir, pageData);

    const components = buildLoadedComponents(dstDir);

    let cssStyle = "";
    for (const componentStyle of components.cssStyles) {
        cssStyle += componentStyle;
    }
    if (cssStyle) {
        safeWriteFile(path.join(dstDir, pageCssFolder), pageCssFilename, cssStyle);
    }

    const orderedHandlers = orderDependencies(Object.values(components.handlers));
    let script = "";
    let scriptMinified = "";
    let scriptDeclaration = "";
    for (const handler of orderedHandlers) {
        script += handler.script + "\n";
        scriptMinified += handler.scriptMinified + "\n";
        scriptDeclaration += handler.scriptDeclaration + "\n";
    }
    if (options && options.additionalScript) {
        script += options.additionalScript;
        scriptMinified += options.additionalScript;
    }

    const hasScript = script && /\S/.test(script); // script must have at least one non-whistespace character
    if (hasScript) {
        if (includeScript) {
            safeWriteFile(path.join(dstDir, pageJsFolder), pageJsFilename, script);
            safeWriteFile(path.join(dstDir, pageJsFolder), pageJsMinFilename, scriptMinified);
        } else {
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

export {
    buildPage,
    CustomEjs,
};
