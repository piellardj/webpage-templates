import fs = require("fs");
import path = require("path");

import IPage from "./components/page/IPage";
import * as Builder from "./page-builder";

function buildPageData(jsonData: any): IPage {
    const mainData = { sections: jsonData.sections };
    const mainEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "main"));
    const mainStr = Builder.CustomEjs.render(mainEjs, mainData);

    return {
        cssFiles: ["css/page.css"],
        description: jsonData.description,
        mainStr,
        scriptFiles: [],
        title: jsonData.title,
    };
}

function build(dstDir: string, jsonDataFilepath: string): void {
    const jsonData: any = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    const pageData: IPage = buildPageData(jsonData);

    Builder.buildPage(dstDir, pageData);
}

export { build };
