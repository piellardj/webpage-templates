import ejs = require("ejs");
import fs = require("fs");
import path = require("path");

const COMPONENTS_DIR = path.posix.join("app", "components");
const COMPONENTS_DIR_ABSOLUTE = path.resolve(__dirname, "..", "..", COMPONENTS_DIR);

const loadedComponents: Set<string> = new Set();
function registerComponent(componentName: string): void {
    loadedComponents.add(componentName);
}

function resolvePartialPath(name: string): string {
    /* Custom components */
    if (path.extname(name) === "") {
        return path.posix.join(COMPONENTS_DIR_ABSOLUTE, name, "template.ejs").replace(/\\/g, "/");
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
        (_match, p1, p2) => "<%- include('" + resolvePartialPath(p1) + "', " + p2 + ") -%>");

    /* includes without parameters */
    processedStr = processedStr.replace(/#include\(*'(.*)'\)/mg,
        (_match, p1) => "<%- include('" + resolvePartialPath(p1) + "') -%>");

    return processedStr;
}

ejs.fileLoader = (filepath: string): string => {
    const resolvedPath = resolvePartialPath(filepath);
    const rawStr: string = fs.readFileSync(resolvedPath).toString();
    return processEjs(rawStr);
};

ejs.resolveInclude = (name: string): string => {
    /* Check if it's a custom component, and if so, remember its name */
    const dirname = path.dirname(name);
    const i = name.indexOf(COMPONENTS_DIR);
    if (i >= 0) {
        const componentName = dirname.slice(i + COMPONENTS_DIR.length + 1);
        registerComponent(componentName);
    }

    return name;
};

function loadComponent(componentName: string): string {
    registerComponent(componentName);
    return ejs.fileLoader(componentName).toString();
}

function render(ejsStr: string, data: ejs.Data): string {
    /* Need to provide a fake file name for Windows because of a bug in EJS. */
    if (process.platform === "win32") {
        return ejs.render(ejsStr, data, {filename: "FAKE"});
    }
    return ejs.render(ejsStr, data);
}

export {
    loadComponent,
    loadedComponents,
    render,
};
