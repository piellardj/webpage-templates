import { IBody as IDemopageBody } from "../../components/demopage/body/template-interface";
interface IDemopageEmptyData {
    description: string;
    title: string;
    introduction: IDemopageBody["introduction"];
    githubProjectName: IDemopageBody["githubProjectName"];
    readme?: {
        filepath: string;
        branchName: string;
    };
    additionalLinks: IDemopageBody["additionalLinks"];
    styleFiles: string[];
    scriptFiles: string[];
    body: string;
}
export type { IDemopageEmptyData };
