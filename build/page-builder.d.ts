import IPage from "./components/page/IPage";
import * as CustomEjs from "./custom-ejs";
declare function buildComponentsDeclaration(): string;
declare function buildComponentsHandlers(minify: boolean): string;
declare function buildPage(dstDir: string, pageData: IPage): void;
export { buildComponentsDeclaration, buildComponentsHandlers, buildPage, CustomEjs, };
