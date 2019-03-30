import fs = require("fs");
import fse = require("fs-extra");
import path = require("path");
import pretty = require("pretty");

import IPage from "./components/page/IPage";

import * as CustomEjs from "./custom-ejs";

const APP_DIR = path.resolve(__dirname,  "..", "app");
const BUILD_DIR = path.resolve(__dirname, "..", "build");

function buildLoadedComponents(dstDir: string): void {
    const cssDir = path.join(dstDir, "css");
    fse.ensureDirSync(cssDir);

    let concatenatedCssStr = "";
    CustomEjs.loadedComponents.forEach((component) => {
        /* Build CSS */
        const styleFilePath = path.join(BUILD_DIR, "components", component, "style.css");
        if (fs.existsSync(styleFilePath)) {
            concatenatedCssStr += fs.readFileSync(styleFilePath);
        }

        /* Copy assets */
        const assetsDir = path.resolve(APP_DIR, "components", component, "assets");
        if (fs.existsSync(assetsDir)) {
            fse.copySync(assetsDir, dstDir);
        }
    });

    fs.writeFileSync(path.join(cssDir, "page.css"), concatenatedCssStr);
}

function buildComponentsHandlers(minify: boolean): string {
    const filename = (minify) ? "handler.min.js" : "handler.js";

    let concatenatedJsStr = "";
    CustomEjs.loadedComponents.forEach((component) => {
        /* Build CSS */
        const jsFilepath = path.join(BUILD_DIR, "components", component, filename);
        if (fs.existsSync(jsFilepath)) {
            concatenatedJsStr += fs.readFileSync(jsFilepath) + "\n";
        }
    });

    return concatenatedJsStr;
}

function buildPageHtml(dstDir: string, pageData: IPage): void {
    fse.ensureDirSync(dstDir);

    const pageEjs = CustomEjs.loadComponent("page");
    const htmlStr = pretty(CustomEjs.render(pageEjs, pageData));
    fs.writeFileSync(path.join(dstDir, "index.html"), htmlStr);
}

function buildPage(dstDir: string, pageData: IPage): void {
    buildPageHtml(dstDir, pageData);
    buildLoadedComponents(dstDir);
}

export {
    buildComponentsHandlers,
    buildPage,
    CustomEjs,
};
