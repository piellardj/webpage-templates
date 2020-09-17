import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "./components/page/IPage";
import * as Builder from "./page-builder";

const PAGE_JS_PATH = "script/page.js";
const PAGE_JS_MIN_PATH = "script/page.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPageData(jsonData: any): IPage {
    const mainData = { sections: jsonData.sections };
    const bodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    const bodyStr = Builder.CustomEjs.render(bodyEjs, mainData);

    return {
        bodyStr,
        cssFiles: ["css/page.css"],
        description: jsonData.description,
        scriptFiles: [PAGE_JS_MIN_PATH],
        title: jsonData.title,
    };
}

function build(dstDir: string, jsonDataFilepath: string): void {
    const jsonData: unknown = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    const pageData: IPage = buildPageData(jsonData);

    Builder.buildPage(dstDir, pageData);
    buildHandlers(dstDir);
}

function buildHandlers(dstDir: string): void {
    const pageJsStr = Builder.buildComponentsHandlers(false);
    const pageJsMinStr = Builder.buildComponentsHandlers(true);

    fse.ensureDirSync(path.join(dstDir, "script"));
    fs.writeFileSync(path.join(dstDir, PAGE_JS_PATH), pageJsStr);
    fs.writeFileSync(path.join(dstDir, PAGE_JS_MIN_PATH), pageJsMinStr);
}

export { build };
