import { IIntro } from "../intro/IIntro";
import { ICanvas } from "../canvas/ICanvas";
import { IControlsBlock } from "../controls-block/IControlsBlock";

export interface IBody {
    title: IIntro["title"];
    introduction: IIntro["introduction"];
    githubProjectName: IIntro["githubProjectName"];
    additionalLinks: IIntro["additionalLinks"];

    indicators: ICanvas["indicators"];
    canvas: {
        enableFullscreen: ICanvas["enableFullscreen"];
    };

    controlsSections: IControlsBlock["controlsSections"];
}
