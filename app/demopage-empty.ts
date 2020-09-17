import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "./components/page/IPage";
import * as Builder from "./page-builder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPageData(jsonData: any): IPage {
    const bodyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body-empty"));
    const bodyStr = Builder.CustomEjs.render(bodyEjs, jsonData);

    const cssFiles: string[] = ["css/page.css"];
    if (jsonData.cssFiles) {
        cssFiles.push(...jsonData.cssFiles);
    }

    return {
        bodyStr,
        cssFiles,
        description: jsonData.description,
        scriptFiles: jsonData.scriptFiles || [],
        title: jsonData.title,
    };
}

function build(dstDir: string, jsonDataFilepath: string, debug: boolean = false): void {
    const jsonData: unknown = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    const pageData: IPage = buildPageData(jsonData);

    const pageJsStr = Builder.buildComponentsHandlers(false);
    const pageJsMinStr = Builder.buildComponentsHandlers(true);
    const pageJsDeclaration = Builder.buildComponentsDeclaration();

    if (pageJsStr) {
        const SCRIPT_FOLDER = "script";
        const PAGE_JS_NAME = "page";

        const pageJsName = PAGE_JS_NAME + ".js";
        const pageJsMinName = PAGE_JS_NAME + ".min.js";
        const pageJsDeclarationName = PAGE_JS_NAME + ".d.ts";

        pageData.scriptFiles.unshift(SCRIPT_FOLDER + "/" + ((debug) ? pageJsName : pageJsMinName));
        fse.ensureDirSync(path.join(dstDir, SCRIPT_FOLDER));
        fs.writeFileSync(path.join(dstDir, SCRIPT_FOLDER, pageJsName), pageJsStr);
        fs.writeFileSync(path.join(dstDir, SCRIPT_FOLDER, pageJsMinName), pageJsMinStr);
        fs.writeFileSync(path.join(dstDir, SCRIPT_FOLDER, pageJsDeclarationName), pageJsDeclaration);
    }

    Builder.buildPage(dstDir, pageData);
}

export { build };
