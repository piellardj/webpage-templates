import ejs = require("ejs");
declare const loadedComponents: Set<string>;
declare function clearLoadedComponents(): void;
declare function loadComponent(componentName: string): string;
declare function render(ejsStr: string, data: ejs.Data): string;
export { clearLoadedComponents, loadComponent, loadedComponents, render, };
