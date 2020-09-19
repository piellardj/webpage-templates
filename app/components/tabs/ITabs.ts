interface IOption {
    label: string;
    value: string;
    checked?: boolean;
    enabled?: boolean;
}

export interface ITabs {
    compact?: boolean;
    unique?: boolean;

    id: string;
    options: IOption[];
}
