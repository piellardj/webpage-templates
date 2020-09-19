import { ILink } from "../../link/ILink";
import { IParagraphs } from "../../paragraphs/IParagraphs";
export interface IIntro {
    title: string;
    introduction: IParagraphs["paragraphs"];
    githubProjectName: string;
    additionalLinks: ILink[];
}
