import path = require("path");

import IPage from "../../components/page/template-interface";
import * as Builder from "../page-builder";

import { IBodyEmpty as IDemopageEmptyBody } from "../../components/demopage/body-empty/template-interface";
import { IDemopageEmptyData } from "./i-demopage-empty-data";

function buildPageData(demopageEmptyData: IDemopageEmptyData): IPage {
    const demopageBodyEmptyData: IDemopageEmptyBody = demopageEmptyData;
    const demopageBodyEmptyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body-empty"));
    const demopageBodyEmptyStr = Builder.CustomEjs.render(demopageBodyEmptyEjs, demopageBodyEmptyData);

    return {
        bodyStr: demopageBodyEmptyStr,
        cssFiles: demopageEmptyData.cssFiles,
        description: demopageEmptyData.description,
        scriptFiles: demopageEmptyData.scriptFiles || [],
        title: demopageEmptyData.title,
    };
}

/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
function build(data: IDemopageEmptyData, destinationDir: string): void {
    const pageData: IPage = buildPageData(data);

    Builder.buildPage(destinationDir, pageData, {
        noScript: true,
    });
}

export { build };
