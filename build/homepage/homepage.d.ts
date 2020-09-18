import { IHomepageData } from "./i-homepage-data";
/**
 *
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 */
declare function build(data: IHomepageData, destinationDir: string): void;
export { build };
