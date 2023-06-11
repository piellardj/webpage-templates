import path = require("path");
import fs = require("fs");

import showdown from "showdown";

import IPage from "../../components/page/template-interface";
import * as Builder from "../page-builder";

import { IBody as IReadmepageBody } from "../../components/readmepage/body/template-interface";
import { IReadmePageData } from "./i-readmepage-data";

function buildPageData(readmepageData: IReadmePageData): IPage {
    const readmeRaw = fs.readFileSync(readmepageData.readmeFilepath).toString();

    const user = "piellardj";
    const converter = new showdown.Converter();
    let readmeHtml = converter.makeHtml(readmeRaw);
    readmeHtml = readmeHtml.replace(/https:\/\/\S+\.mp4/gm, match => {
        return `<div style="text-align:center">
    <video controls muted><source src="${match}" type="video/mp4"></video>
</div>`;
    });
    const baseImageUrl = `https://github.com/${user}/${readmepageData.repoName}/raw/${readmepageData.branchName}`;
    readmeHtml = readmeHtml.replace(/<img[^>]+src="([^"]+)"[^>]*\/>/gm, (match: string, p1: string) => {
        if (p1.startsWith("https://")) {
            return match; // nothing to change
        }
        return match.replace(p1, `${baseImageUrl}/${p1}`);
    });

    const readmepageBodyData: IReadmepageBody = {
        projectUrl: `https://${user}.github.io/${readmepageData.repoName}/`,
        bodyStr: readmeHtml,
    };

    const readmepageBodyEjs = Builder.CustomEjs.loadComponent(path.join("readmepage", "body"));
    const readmepageBodyStr = Builder.CustomEjs.render(readmepageBodyEjs, readmepageBodyData);

    return {
        bodyStr: readmepageBodyStr,
        cssFiles: [],
        description: `Readme page of my project '${readmepageData.projectName}'. ${readmepageData.description}`,
        scriptFiles: [],
        title: `${readmepageData.projectName} - Explanations`,
    };
}

/**
 * 
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 */
function build(data: IReadmePageData, destinationDir: string): void {
    const pageData: IPage = buildPageData(data);

    Builder.buildPage(destinationDir, pageData, {
        noScript: true,
    });
    Builder.CustomEjs.clearLoadedComponents();
}

export { build };
