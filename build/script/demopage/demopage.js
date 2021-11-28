"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var template_interface_1 = require("../../components/demopage/controls-block/template-interface");
Object.defineProperty(exports, "supportedControls", { enumerable: true, get: function () { return template_interface_1.supportedControls; } });
function buildPageData(demopageData) {
    var demopageBodyData = demopageData;
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
    var pageData = buildPageData(data);
    var adjustCanvasScript = "Page.Canvas.setMaxSize(".concat(data.canvas.width, ",").concat(data.canvas.height, ");");
    var minifyScript = (typeof options !== "undefined") ? !options.debug : false;
    return Builder.buildPage(destinationDir, pageData, {
        additionalScript: adjustCanvasScript,
        minifyScript: minifyScript,
    });
}
exports.build = build;
