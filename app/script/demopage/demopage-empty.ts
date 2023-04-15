import path = require("path");

import IPage from "../../components/page/template-interface";
import * as Builder from "../page-builder";
import * as Readmepage from "../readmepage/readmepage";

import { IBodyEmpty as IDemopageEmptyBody } from "../../components/demopage/body-empty/template-interface";
import { IDemopageEmptyData } from "./i-demopage-empty-data";

function buildPageData(demopageEmptyData: IDemopageEmptyData, destinationDir: string): IPage {
    const demopageBodyEmptyData: IDemopageEmptyBody = { ...demopageEmptyData, readmeLink: null };

    if (demopageEmptyData.readme) {
        const readmeFolder = "readme";
        const readmeDestFolder = path.join(destinationDir, readmeFolder);
        demopageBodyEmptyData.readmeLink = `https://piellardj.github.io/${demopageEmptyData.githubProjectName}/${readmeFolder}`;

        Readmepage.build({
            readmeFilepath: demopageEmptyData.readme.filepath,
            branchName: demopageEmptyData.readme.branchName,
            description: demopageEmptyData.description,
            projectName: demopageEmptyData.title,
            repoName: demopageEmptyData.githubProjectName,
        }, readmeDestFolder);
    }

    const demopageBodyEmptyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body-empty"));
    const demopageBodyEmptyStr = Builder.CustomEjs.render(demopageBodyEmptyEjs, demopageBodyEmptyData);

    return {
        bodyStr: demopageBodyEmptyStr,
        cssFiles: demopageEmptyData.styleFiles,
        description: demopageEmptyData.description,
        scriptFiles: demopageEmptyData.scriptFiles || [],
        title: demopageEmptyData.title,
    };
}


interface IBuildResult {
    pageScriptDeclaration: string;
}

/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
function build(data: IDemopageEmptyData, destinationDir: string): IBuildResult {
    const pageData: IPage = buildPageData(data, destinationDir);

    return Builder.buildPage(destinationDir, pageData, {
        noScript: true,
    });
}

export { build };

