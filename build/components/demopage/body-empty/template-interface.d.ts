import { IIntro } from "../intro/template-interface";
export interface IBodyEmpty {
    title: IIntro["title"];
    introduction: IIntro["introduction"];
    githubProjectName: IIntro["githubProjectName"];
    additionalLinks: IIntro["additionalLinks"];
    body: string;
}
