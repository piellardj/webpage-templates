import { IBody as IDemopageBody } from "../components/demopage/body/IBody";

interface IDemopageData {
    description: string;
    title: string;
    introduction: IDemopageBody["introduction"];

    githubProjectName: IDemopageBody["githubProjectName"];
    additionalLinks: IDemopageBody["additionalLinks"];

    scriptFiles: string[];

    indicators: IDemopageBody["indicators"];
    canvas: IDemopageBody["canvas"] & {
        width: number;
        height: number;
    };

    controlsSections: IDemopageBody["controlsSections"];
}

export { IDemopageData }
