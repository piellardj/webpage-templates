"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ejs = require("ejs");
var fs = require("fs");
var path = require("path");
var COMPONENTS_DIR = path.join("app", "components");
var COMPONENTS_DIR_ABSOLUTE = path.resolve(__dirname, "..", COMPONENTS_DIR);
var loadedComponents = new Set();
exports.loadedComponents = loadedComponents;
function registerComponent(componentName) {
    loadedComponents.add(componentName);
}
function resolvePartialPath(name) {
    /* Custom components */
    if (path.extname(name) === "") {
        return path.join(COMPONENTS_DIR_ABSOLUTE, name, "template.ejs");
    }
    return name;
}
function processEjs(rawEjs) {
    /* replace */
    var processedStr = rawEjs.replace(/#=\(([\w.]*)\)/mg, "<%- $1 %>");
    /* JS line */
    processedStr = processedStr.replace(/^[\s]*# (.*)$/mg, "<%_ $1 _%>");
    /* IsTrue, IsFalse */
    processedStr = processedStr.replace(/IsTrue\(([a-zA-Z0-9]*)\)/mg, "(typeof $1 !== 'undefined' && $1 === true)");
    processedStr = processedStr.replace(/IsFalse\(([a-zA-Z0-9]*)\)/mg, "(typeof $1 !== 'undefined' && $1 === false)");
    /* includes with parameters */
    processedStr = processedStr.replace(/#include\(*'(.*)',(.*)\)/mg, function (math, p1, p2) { return "<%- include('" + resolvePartialPath(p1) + "', " + p2 + ") -%>"; });
    /* includes without parameters */
    processedStr = processedStr.replace(/#include\(*'(.*)'\)/mg, function (math, p1) { return "<%- include('" + resolvePartialPath(p1) + "') -%>"; });
    return processedStr;
}
ejs.fileLoader = function (filepath) {
    var resolvedPath = resolvePartialPath(filepath);
    var rawStr = fs.readFileSync(resolvedPath).toString();
    return processEjs(rawStr);
};
var originalResolveInclude = ejs.resolveInclude;
ejs.resolveInclude = function (name, filename, isDir) {
    /* Check if it's a custom component, and if so, remember its name */
    var dirname = path.dirname(name);
    var i = name.indexOf(COMPONENTS_DIR);
    if (i >= 0) {
        var componentName = dirname.slice(i + COMPONENTS_DIR.length + 1);
        registerComponent(componentName);
    }
    return originalResolveInclude(name, filename, isDir);
};
function loadComponent(componentName) {
    registerComponent(componentName);
    return ejs.fileLoader(componentName);
}
exports.loadComponent = loadComponent;
function render(ejsStr, data) {
    return ejs.render(ejsStr, data);
}
exports.render = render;
