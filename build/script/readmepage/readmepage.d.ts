import { IReadmePageData } from "./i-readmepage-data";
/**
 *
 * @param data Data describing the contents of the page
 * @param destinationDir Root directory in which the generated files will be copied
 */
declare function build(data: IReadmePageData, destinationDir: string): void;
export { build };
