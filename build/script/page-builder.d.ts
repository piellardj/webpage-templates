import IPage from "../components/page/template-interface";
import * as CustomEjs from "./custom-ejs";
interface IBuildOptions {
    additionalScript?: string;
    minifyScript?: boolean;
    noScript?: boolean;
}
declare function buildPage(dstDir: string, pageData: IPage, options?: IBuildOptions): void;
export { buildPage, CustomEjs, };
