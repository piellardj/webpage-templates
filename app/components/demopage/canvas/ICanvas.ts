export interface IIndicator {
    id: string;
    label: string;
}

export interface ICanvas {
    indicators: IIndicator[];
    enableFullscreen: boolean;
}
