import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "../components/page/template-interface";
import * as Builder from "../page-builder";

import { IBody as IDemopageBody } from "../components/demopage/body/template-interface";
import { IDemopageData } from "./i-demopage-data";
import { supportedControls } from "../components/demopage/controls-block/template-interface";

function buildPageData(demopageData: IDemopageData): IPage {
    const demopageBodyData: IDemopageBody = demopageData;
    const demopageBodyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body"));
    const demopageBodyStr = Builder.CustomEjs.render(demopageBodyEjs, demopageBodyData);

    return {
        bodyStr: demopageBodyStr,
        cssFiles: [
            "css/page.css",
        ],
        description: demopageData.description,
        scriptFiles: demopageData.scriptFiles || [],
        title: demopageData.title,
    };
}

function isNumber(v: unknown): boolean {
    return typeof v === "number";
}

interface IBuildOptions {
    debug: boolean;
}

interface IBuildResult {
    pageScriptDeclaration: string;
}

/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
function build(data: IDemopageData, destinationDir: string, options?: IBuildOptions): IBuildResult {
    const pageData: IPage = buildPageData(data);

    if (!isNumber(data.canvas.width) || !isNumber(data.canvas.height)) {
        console.error("ERROR: provide canvas dimensions with canvas.width and canvas.height.");
    }

    const setSizeStr = `Canvas.setMaxSize(${data.canvas.width},${data.canvas.height});`;

    const pageJsStr = Builder.buildComponentsHandlers(false) + setSizeStr;
    const pageJsMinStr = Builder.buildComponentsHandlers(true) + setSizeStr;
    const pageJsDeclaration = Builder.buildComponentsDeclaration();

    if (pageJsStr) {
        const SCRIPT_FOLDER = "script";
        const PAGE_JS_NAME = "page";

        const pageJsName = PAGE_JS_NAME + ".js";
        const pageJsMinName = PAGE_JS_NAME + ".min.js";

        pageData.scriptFiles.unshift(SCRIPT_FOLDER + "/" + ((options?.debug) ? pageJsName : pageJsMinName));
        fse.ensureDirSync(path.join(destinationDir, SCRIPT_FOLDER));
        fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsName), pageJsStr);
        fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsMinName), pageJsMinStr);
    }

    Builder.buildPage(destinationDir, pageData);

    return {
        pageScriptDeclaration: pageJsDeclaration,
    }
}

export { build, supportedControls };
