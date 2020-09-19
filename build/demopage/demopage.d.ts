import { IDemopageData } from "./i-demopage-data";
import { supportedControls } from "../components/demopage/controls-block/IControlsBlock";
interface IBuildOptions {
    debug: boolean;
}
/**
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 * @param options Optional build options
 */
declare function build(data: IDemopageData, destinationDir: string, options?: IBuildOptions): void;
export { build, supportedControls };
