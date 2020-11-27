export interface ICard {
    // background images must have an aspect ratio of 2:1, and will be displayed with a height of 256px
    background: string; // must be a format supported everywhere (png or jpg)
    background_light?: string; // can be any format (webp etc.)
    background_light_highdpi?: string; // can be any format (webp etc.)

    title: string;
    projectName: string;

    githubLink?: boolean;
    liveLink?: boolean;
    liveLinkArguments?: string;

    /* Each index is a paragraph */
    body: string[];
}
