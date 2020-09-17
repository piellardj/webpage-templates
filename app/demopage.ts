import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "./components/page/IPage";
import * as Builder from "./page-builder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPageData(jsonData: any): IPage {
    const bodyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body"));
    const bodyStr = Builder.CustomEjs.render(bodyEjs, jsonData);

    return {
        bodyStr,
        cssFiles: [
            "css/page.css",
        ],
        description: jsonData.description,
        scriptFiles: jsonData.scriptFiles || [],
        title: jsonData.title,
    };
}

function isNumber(v: unknown): boolean {
    return typeof v === "number";
}

function build(dstDir: string, jsonDataFilepath: string, debug = false): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData: any = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    const pageData: IPage = buildPageData(jsonData);

    if (!isNumber(jsonData.canvas.width) || !isNumber(jsonData.canvas.height)) {
        console.error("ERROR: provide canvas dimensions with canvas.width and canvas.height.");
    }

    const setSizeStr = "Canvas.setMaxSize(" + jsonData.canvas.width +
        "," + jsonData.canvas.height + ");";

    const pageJsStr = Builder.buildComponentsHandlers(false) + setSizeStr;
    const pageJsMinStr = Builder.buildComponentsHandlers(true) + setSizeStr;
    const pageJsDeclaration = Builder.buildComponentsDeclaration();

    if (pageJsStr) {
        const SCRIPT_FOLDER = "script";
        const PAGE_JS_NAME = "page";

        const pageJsPath = path.join(SCRIPT_FOLDER, PAGE_JS_NAME + ".js");
        const pageJsMinPath = path.join(SCRIPT_FOLDER, PAGE_JS_NAME + ".min.js");
        const pageJsDeclarationPath = path.join(SCRIPT_FOLDER, PAGE_JS_NAME + ".d.ts");

        pageData.scriptFiles.unshift((debug) ? pageJsPath : pageJsMinPath);
        fse.ensureDirSync(path.join(dstDir, SCRIPT_FOLDER));
        fs.writeFileSync(path.join(dstDir, pageJsPath), pageJsStr);
        fs.writeFileSync(path.join(dstDir, pageJsMinPath), pageJsMinStr);
        fs.writeFileSync(path.join(dstDir, pageJsDeclarationPath), pageJsDeclaration);
    }

    Builder.buildPage(dstDir, pageData);
}

export { build };
