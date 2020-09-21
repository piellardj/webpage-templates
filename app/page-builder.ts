import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");
import pretty = require("pretty");

import IPage from "./components/page/template-interface";

import * as CustomEjs from "./custom-ejs";

const APP_DIR = path.resolve(__dirname, "..", "app");
const BUILD_DIR = path.resolve(__dirname, "..", "build");

function safeWriteFile(directory: string, filename: string, content: string): void {
    fse.ensureDirSync(directory);
    fs.writeFileSync(path.join(directory, filename), content);
}

interface IHandler {
    script: string;
    scriptMinified: string;
    scriptDeclaration: string;
}

interface IComponent {
    cssStyle?: string;
    handler?: IHandler;
}

function buildLoadedComponents(dstDir: string): IComponent[] {
    const components: IComponent[] = [];

    CustomEjs.loadedComponents.forEach((componentName) => {
        /* Copy assets */
        const assetsDir = path.join(APP_DIR, "components", componentName, "assets");
        if (fs.existsSync(assetsDir)) {
            fse.copySync(assetsDir, dstDir);
        }

        /* Load style and scripts */
        const component: IComponent = {};

        const styleFilePath = path.join(BUILD_DIR, "components", componentName, "style.css");
        if (fs.existsSync(styleFilePath)) {
            component.cssStyle = fs.readFileSync(styleFilePath).toString();
        }

        const handlerScriptFilePath = path.join(BUILD_DIR, "components", componentName, "handler.js");
        if (fs.existsSync(handlerScriptFilePath)) {
            const handlerScript = fs.readFileSync(handlerScriptFilePath).toString();

            const handlerScriptMinifiedFilepath = path.join(BUILD_DIR, "components", componentName, "handler.min.js");
            const handlerScriptMinified = fs.readFileSync(handlerScriptMinifiedFilepath).toString();

            const handlerScriptDeclarationFilepath = path.join(BUILD_DIR, "components", componentName, "handler.d.ts");
            const handlerDeclaration = fs.readFileSync(handlerScriptDeclarationFilepath).toString();

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
        pageData.scriptFiles.unshift(pageJsFolder + "/" + ((options?.minifyScript) ? pageJsMinFilename : pageJsFilename));
    }
    pageData.cssFiles.unshift(pageCssFolder + "/" + pageCssFilename);

    buildPageHtml(dstDir, pageData);

    const components = buildLoadedComponents(dstDir);

    let cssStyle = "";
    let script = "";
    let scriptMinified = "";
    let scriptDeclaration = "";
    for (const component of components) {
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
        } else {
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

export {
    buildPage,
    CustomEjs,
};
