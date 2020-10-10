export interface ICard {
    background: string;
    title: string;
    projectName: string;
    githubLink?: boolean;
    liveLink?: boolean;
    liveLinkArguments?: string;
    body: string[];
}
