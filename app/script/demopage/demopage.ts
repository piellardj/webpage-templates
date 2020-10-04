import path = require("path");

import IPage from "../../components/page/template-interface";
import * as Builder from "../page-builder";

import { IBody as IDemopageBody } from "../../components/demopage/body/template-interface";
import { IDemopageData } from "./i-demopage-data";
import { supportedControls } from "../../components/demopage/controls-block/template-interface";

function buildPageData(demopageData: IDemopageData): IPage {
    const demopageBodyData: IDemopageBody = demopageData;
    const demopageBodyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body"));
    const demopageBodyStr = Builder.CustomEjs.render(demopageBodyEjs, demopageBodyData);

    return {
        bodyStr: demopageBodyStr,
        cssFiles: demopageData.styleFiles || [],
        description: demopageData.description,
        scriptFiles: demopageData.scriptFiles || [],
        title: demopageData.title,
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
function build(data: IDemopageData, destinationDir: string, options?: IBuildOptions): IBuildResult {
    const pageData: IPage = buildPageData(data);
    const adjustCanvasScript = `Page.Canvas.setMaxSize(${data.canvas.width},${data.canvas.height});`;
    const minifyScript = (typeof options !== "undefined") ? !options.debug : false;

    return Builder.buildPage(destinationDir, pageData, {
        additionalScript: adjustCanvasScript,
        minifyScript: minifyScript,
    });
}

export { build, supportedControls };
