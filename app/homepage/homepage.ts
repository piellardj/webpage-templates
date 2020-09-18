import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");

import IPage from "../components/page/IPage";
import * as Builder from "../page-builder";

import { IBody as IHomepageBody } from "../components/homepage/body/IBody";
import { IHomepageData } from "./i-homepage-data";

function buildPageData(homepageData: IHomepageData): IPage {
    const homepageBodyData: IHomepageBody = { sections: homepageData.sections };
    const homepageBodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    const homepageBodyStr = Builder.CustomEjs.render(homepageBodyEjs, homepageBodyData);

    return {
        bodyStr: homepageBodyStr,
        cssFiles: ["css/page.css"],
        description: homepageData.description,
        scriptFiles: [],
        title: homepageData.title,
    };
}

/**
 * 
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 */
function build(data: IHomepageData, destinationDir: string): void {
    const pageData: IPage = buildPageData(data);

    const pageJsStr = Builder.buildComponentsHandlers(false);
    const pageJsMinStr = Builder.buildComponentsHandlers(true);

    const SCRIPT_FOLDER = "script";
    const PAGE_JS_NAME = "page";

    const pageJsName = PAGE_JS_NAME + ".js";
    const pageJsMinName = PAGE_JS_NAME + ".min.js";

    pageData.scriptFiles.unshift(SCRIPT_FOLDER + "/" + pageJsMinName);
    fse.ensureDirSync(path.join(destinationDir, SCRIPT_FOLDER));
    fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsName), pageJsStr);
    fs.writeFileSync(path.join(destinationDir, SCRIPT_FOLDER, pageJsMinName), pageJsMinStr);

    Builder.buildPage(destinationDir, pageData);
}

export { build };
