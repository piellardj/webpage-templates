"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Builder = __importStar(require("./page-builder"));
function buildPageData(jsonData) {
    var mainData = { sections: jsonData.sections };
    var mainEjs = Builder.CustomEjs.loadComponent(path.join("homepage", "main"));
    var mainStr = Builder.CustomEjs.render(mainEjs, mainData);
    return {
        cssFiles: ["css/page.css"],
        description: jsonData.description,
        mainStr: mainStr,
        scriptFiles: [],
        title: jsonData.title,
    };
}
function build(dstDir, jsonDataFilepath) {
    var jsonData = JSON.parse(fs.readFileSync(jsonDataFilepath).toString());
    var pageData = buildPageData(jsonData);
    Builder.buildPage(dstDir, pageData);
}
exports.build = build;
