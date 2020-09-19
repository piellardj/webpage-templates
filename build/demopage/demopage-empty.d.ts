import { IDemopageEmptyData } from "./i-demopage-empty-data";
interface IBuildOptions {
    debug: boolean;
}
interface IBuildResult {
    pageScriptDeclaration: string;
}
/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
declare function build(data: IDemopageEmptyData, destinationDir: string, options?: IBuildOptions): IBuildResult;
export { build };
