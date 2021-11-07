import { IBody as IDemopageBody } from "../../components/demopage/body/template-interface";

interface IDemopageData {
    description: string;
    title: string;
    introduction: IDemopageBody["introduction"];

    githubProjectName: IDemopageBody["githubProjectName"];
    additionalLinks: IDemopageBody["additionalLinks"];

    styleFiles?: string[];
    scriptFiles: string[];

    indicators: IDemopageBody["indicators"];
    canvas: IDemopageBody["canvas"] & {
        width: number;
        height: number;
    };

    controlsSections: IDemopageBody["controlsSections"];
}

export type { IDemopageData };
