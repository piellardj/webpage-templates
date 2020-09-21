import path = require("path");

import IPage from "../../components/page/template-interface";
import * as Builder from "../page-builder";

import { IBody as IHomepageBody } from "../../components/homepage/body/template-interface";
import { IHomepageData } from "./i-homepage-data";

function buildPageData(homepageData: IHomepageData): IPage {
    const homepageBodyData: IHomepageBody = { sections: homepageData.sections };
    const homepageBodyEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "body"));
    const homepageBodyStr = Builder.CustomEjs.render(homepageBodyEjs, homepageBodyData);

    return {
        bodyStr: homepageBodyStr,
        cssFiles: [],
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

    Builder.buildPage(destinationDir, pageData, {
        minifyScript: true,
    });
}

export { build };
