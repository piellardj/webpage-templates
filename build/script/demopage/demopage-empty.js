"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
var path = require("path");
var Builder = __importStar(require("../page-builder"));
var Readmepage = __importStar(require("../readmepage/readmepage"));
function buildPageData(demopageEmptyData, destinationDir) {
    var demopageBodyEmptyData = __assign(__assign({}, demopageEmptyData), { readmeLink: null });
    if (demopageEmptyData.readme) {
        var readmeFolder = "readme";
        var readmeDestFolder = path.join(destinationDir, readmeFolder);
        demopageBodyEmptyData.readmeLink = "/".concat(readmeFolder);
        Readmepage.build({
            readmeFilepath: demopageEmptyData.readme.filepath,
            branchName: demopageEmptyData.readme.branchName,
            description: demopageEmptyData.description,
            projectName: demopageEmptyData.title,
            repoName: demopageEmptyData.githubProjectName,
        }, readmeDestFolder);
    }
    var demopageBodyEmptyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body-empty"));
    var demopageBodyEmptyStr = Builder.CustomEjs.render(demopageBodyEmptyEjs, demopageBodyEmptyData);
    return {
        bodyStr: demopageBodyEmptyStr,
        cssFiles: demopageEmptyData.styleFiles,
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
function build(data, destinationDir) {
    var pageData = buildPageData(data, destinationDir);
    return Builder.buildPage(destinationDir, pageData, {
        noScript: true,
    });
}
exports.build = build;
