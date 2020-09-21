import IPage from "../components/page/template-interface";
import * as CustomEjs from "./custom-ejs";
interface IBuildOptions {
    additionalScript?: string;
    minifyScript?: boolean;
    noScript?: boolean;
}
interface IBuildResult {
    pageScriptDeclaration: string;
}
declare function buildPage(dstDir: string, pageData: IPage, options?: IBuildOptions): IBuildResult;
export { buildPage, CustomEjs, };
