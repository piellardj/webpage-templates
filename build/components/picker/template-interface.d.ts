interface IOption {
    checked?: boolean;
    value: string;
    label: string;
}
export interface IPicker {
    compact?: string;
    style?: string;
    placeholder?: string;
    id: string;
    options: IOption[];
}
export {};
