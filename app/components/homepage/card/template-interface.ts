export interface ICard {
    /* path to the background image */
    background: string;

    title: string;
    projectName: string;

    githubLink?: boolean;
    liveLink?: boolean;
    liveLinkArguments?: string;

    /* Each index is a paragraph */
    body: string[];
}
