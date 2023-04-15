import path = require("path");

import IPage from "../../components/page/template-interface";
import * as Builder from "../page-builder";
import * as Readmepage from "../readmepage/readmepage";

import { IBody as IDemopageBody } from "../../components/demopage/body/template-interface";
import { supportedControls } from "../../components/demopage/controls-block/template-interface";
import { IDemopageData } from "./i-demopage-data";

function buildPageData(demopageData: IDemopageData, destinationDir: string): IPage {
    const demopageBodyData: IDemopageBody = { ...demopageData, readmeLink: null };

    if (demopageData.readme) {
        const readmeFolder = "readme";
        const readmeDestFolder = path.join(destinationDir, readmeFolder);
        demopageBodyData.readmeLink = `/${readmeFolder}`;

        Readmepage.build({
            readmeFilepath: demopageData.readme.filepath,
            branchName: demopageData.readme.branchName,
            description: demopageData.description,
            projectName: demopageData.title,
            repoName: demopageData.githubProjectName,
        }, readmeDestFolder);
    }

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
    const pageData: IPage = buildPageData(data, destinationDir);
    const adjustCanvasScript = `Page.Canvas.setMaxSize(${data.canvas.width},${data.canvas.height});`;
    const minifyScript = (typeof options !== "undefined") ? !options.debug : false;

    return Builder.buildPage(destinationDir, pageData, {
        additionalScript: adjustCanvasScript,
        minifyScript: minifyScript,
    });
}

export { build, supportedControls };

