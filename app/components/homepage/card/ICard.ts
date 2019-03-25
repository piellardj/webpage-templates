interface ICard {
    /* path to the background image */
    background: string;

    title: string;
    projectName: string;

    githubLink?: string;
    liveLink?: string;

    /* Each index is a paragraph */
    body: string[];
}

export default ICard;
