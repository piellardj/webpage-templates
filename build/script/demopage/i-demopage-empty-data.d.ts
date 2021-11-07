import { IBody as IDemopageBody } from "../../components/demopage/body/template-interface";
interface IDemopageEmptyData {
    description: string;
    title: string;
    introduction: IDemopageBody["introduction"];
    githubProjectName: IDemopageBody["githubProjectName"];
    additionalLinks: IDemopageBody["additionalLinks"];
    scriptFiles: string[];
    cssFiles: string[];
    body: string;
}
export type { IDemopageEmptyData };
