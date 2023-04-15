import { ILink } from "../../link/template-interface";
import { IParagraphs } from "../../paragraphs/template-interface";
export interface IIntro {
    title: string;
    introduction: IParagraphs["paragraphs"];
    githubProjectName: string;
    additionalLinks: ILink[];
    readmeLink: string | null;
}
