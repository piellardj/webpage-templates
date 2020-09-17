import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "./components/page/IPage";
import * as Builder from "./page-builder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPageData(jsonData: any): IPage {
    const mainData = { sections: jsonData.sections };
    const bodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    const bodyStr = Builder.CustomEjs.render(bodyEjs, mainData);

    return {
        bodyStr,
        cssFiles: ["css/page.css"],
        description: jsonData.description,
        scriptFiles: jsonData.scriptFiles || [],
        title: jsonData.title,
    };
}

function build(dstDir: string, jsonDataFilepath: string): void {
    const jsonData: unknown = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    const pageData: IPage = buildPageData(jsonData);

    const pageJsStr = Builder.buildComponentsHandlers(false);
    const pageJsMinStr = Builder.buildComponentsHandlers(true);

    const SCRIPT_FOLDER = "script";
    const PAGE_JS_NAME = "page";

    const pageJsName = PAGE_JS_NAME + ".js";
    const pageJsMinName = PAGE_JS_NAME + ".min.js";

    pageData.scriptFiles.unshift(SCRIPT_FOLDER + "/" + pageJsMinName);
    fse.ensureDirSync(path.join(dstDir, SCRIPT_FOLDER));
    fs.writeFileSync(path.join(dstDir, SCRIPT_FOLDER, pageJsName), pageJsStr);
    fs.writeFileSync(path.join(dstDir, SCRIPT_FOLDER, pageJsMinName), pageJsMinStr);

    Builder.buildPage(dstDir, pageData);
}

export { build };
