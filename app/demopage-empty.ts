import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "./components/page/IPage";
import * as Builder from "./page-builder";

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
    const jsonData: any = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    const pageData: IPage = buildPageData(jsonData);

    const pageJsStr = Builder.buildComponentsHandlers(false);
    const pageJsMinStr = Builder.buildComponentsHandlers(true);

    const PAGE_JS_PATH = "script/page.js";
    const PAGE_JS_MIN_PATH = "script/page.min.js";

    pageData.scriptFiles.unshift((debug) ? PAGE_JS_PATH : PAGE_JS_MIN_PATH);
    fse.ensureDirSync(path.join(dstDir, "script"));
    fs.writeFileSync(path.join(dstDir, PAGE_JS_PATH), pageJsStr);
    fs.writeFileSync(path.join(dstDir, PAGE_JS_MIN_PATH), pageJsMinStr);

    Builder.buildPage(dstDir, pageData);
}

export { build };
