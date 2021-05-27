interface IOption {
    checked?: boolean;
    value: string;
    label: string;
}

export interface ISelect {
    id: string;
    options: IOption[];
    placeholder: string;
}
