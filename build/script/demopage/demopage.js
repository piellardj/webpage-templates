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
exports.supportedControls = exports.build = void 0;
var path = require("path");
var Builder = __importStar(require("../page-builder"));
var Readmepage = __importStar(require("../readmepage/readmepage"));
var template_interface_1 = require("../../components/demopage/controls-block/template-interface");
Object.defineProperty(exports, "supportedControls", { enumerable: true, get: function () { return template_interface_1.supportedControls; } });
function buildPageData(demopageData, destinationDir) {
    var demopageBodyData = __assign(__assign({}, demopageData), { readmeLink: null });
    if (demopageData.readme) {
        var readmeFolder = "readme";
        var readmeDestFolder = path.join(destinationDir, readmeFolder);
        demopageBodyData.readmeLink = "https://piellardj.github.io/".concat(demopageData.githubProjectName, "/").concat(readmeFolder);
        Readmepage.build({
            readmeFilepath: demopageData.readme.filepath,
            branchName: demopageData.readme.branchName,
            description: demopageData.description,
            projectName: demopageData.title,
            repoName: demopageData.githubProjectName,
        }, readmeDestFolder);
    }
    var demopageBodyEjs = Builder.CustomEjs.loadComponent(path.join("demopage", "body"));
    var demopageBodyStr = Builder.CustomEjs.render(demopageBodyEjs, demopageBodyData);
    return {
        bodyStr: demopageBodyStr,
        cssFiles: demopageData.styleFiles || [],
        description: demopageData.description,
        scriptFiles: demopageData.scriptFiles || [],
        title: demopageData.title,
    };
}
/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
function build(data, destinationDir, options) {
    var pageData = buildPageData(data, destinationDir);
    var adjustCanvasScript = "Page.Canvas.setMaxSize(".concat(data.canvas.width, ",").concat(data.canvas.height, ");");
    var minifyScript = (typeof options !== "undefined") ? !options.debug : false;
    return Builder.buildPage(destinationDir, pageData, {
        additionalScript: adjustCanvasScript,
        minifyScript: minifyScript,
    });
}
exports.build = build;
