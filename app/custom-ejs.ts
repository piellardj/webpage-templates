import ejs = require("ejs");
import fs = require("fs");
import path = require("path");

const COMPONENTS_DIR = path.join("app", "components");
const COMPONENTS_DIR_ABSOLUTE = path.resolve(__dirname, "..", COMPONENTS_DIR);

const loadedComponents: Set<string> = new Set();
function registerComponent(componentName: string): void {
    loadedComponents.add(componentName);
}

function resolvePartialPath(name: string) {
    /* Custom components */
    if (path.extname(name) === "") {
        return path.join(COMPONENTS_DIR_ABSOLUTE, name, "template.ejs");
    }

    return name;
}

function processEjs(rawEjs: string): string {
    /* replace */
    let processedStr: string = rawEjs.replace(/#=\(([\w.]*)\)/mg, "<%- $1 %>");

    /* JS line */
    processedStr = processedStr.replace(/^[\s]*# (.*)$/mg, "<%_ $1 _%>");

    /* IsTrue, IsFalse */
    processedStr = processedStr.replace(/IsTrue\(([a-zA-Z0-9]*)\)/mg, "(typeof $1 !== 'undefined' && $1 === true)");
    processedStr = processedStr.replace(/IsFalse\(([a-zA-Z0-9]*)\)/mg, "(typeof $1 !== 'undefined' && $1 === false)");

    /* includes with parameters */
    processedStr = processedStr.replace(/#include\(*'(.*)',(.*)\)/mg,
        (math, p1, p2) => "<%- include('" + resolvePartialPath(p1) + "', " + p2 + ") -%>");

    /* includes without parameters */
    processedStr = processedStr.replace(/#include\(*'(.*)'\)/mg,
        (math, p1) => "<%- include('" + resolvePartialPath(p1) + "') -%>");

    return processedStr;
}

ejs.fileLoader = (filepath: string) => {
    const resolvedPath = resolvePartialPath(filepath);
    const rawStr: string = fs.readFileSync(resolvedPath).toString();
    return processEjs(rawStr);
};

const originalResolveInclude = ejs.resolveInclude;
ejs.resolveInclude = (name: string, filename: string, isDir: boolean) => {
    /* Check if it's a custom component, and if so, remember its name */
    const dirname = path.dirname(name);
    const i = name.indexOf(COMPONENTS_DIR);
    if (i >= 0) {
        const componentName = dirname.slice(i + COMPONENTS_DIR.length + 1);
        registerComponent(componentName);
    }

    return originalResolveInclude(name, filename, isDir);
};

function loadComponent(componentName: string): string {
    registerComponent(componentName);
    return ejs.fileLoader(componentName);
}

function render(ejsStr: string, data: any): string {
    return ejs.render(ejsStr, data);
}

export {
    loadComponent,
    loadedComponents,
    render,
};
