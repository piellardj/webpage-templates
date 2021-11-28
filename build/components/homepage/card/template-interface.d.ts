export interface ICard {
    background: string;
    background_blurred: string;
    background_light?: string;
    background_light_highdpi?: string;
    title: string;
    projectName: string;
    githubLink?: boolean;
    liveLink?: boolean;
    liveLinkArguments?: string;
    body: string[];
}
