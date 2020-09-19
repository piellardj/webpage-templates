import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "../components/page/template-interface";
import * as Builder from "../page-builder";

import { IBodyEmpty as IDemopageEmptyBody } from "../components/demopage/body-empty/template-interface";
import { IDemopageEmptyData } from "./i-demopage-empty-data";

function buildPageData(demopageEmptyData: IDemopageEmptyData): IPage {
    const demopageBodyEmptyData: IDemopageEmptyBody = demopageEmptyData;
    const demopageBodyEmptyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body-empty"));
    const demopageBodyEmptyStr = Builder.CustomEjs.render(demopageBodyEmptyEjs, demopageBodyEmptyData);

    const cssFiles: string[] = ["css/page.css"];
    if (demopageEmptyData.cssFiles) {
        cssFiles.push(...demopageEmptyData.cssFiles);
    }

    return {
        bodyStr: demopageBodyEmptyStr,
        cssFiles,
        description: demopageEmptyData.description,
        scriptFiles: demopageEmptyData.scriptFiles || [],
        title: demopageEmptyData.title,
    };
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
function build(data: IDemopageEmptyData, destinationDir: string, options?: IBuildOptions): IBuildResult {
    const pageData: IPage = buildPageData(data);

    const pageJsStr = Builder.buildComponentsHandlers(false);
    const pageJsMinStr = Builder.buildComponentsHandlers(true);
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

export { build };
