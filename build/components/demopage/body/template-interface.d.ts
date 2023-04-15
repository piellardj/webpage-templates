import { IIntro } from "../intro/template-interface";
import { ICanvas } from "../canvas/template-interface";
import { IControlsBlock } from "../controls-block/template-interface";
export interface IBody {
    title: IIntro["title"];
    introduction: IIntro["introduction"];
    githubProjectName: IIntro["githubProjectName"];
    additionalLinks: IIntro["additionalLinks"];
    readmeLink: string | null;
    indicators: ICanvas["indicators"];
    canvas: {
        enableFullscreen: ICanvas["enableFullscreen"];
    };
    controlsSections: IControlsBlock["controlsSections"];
}
