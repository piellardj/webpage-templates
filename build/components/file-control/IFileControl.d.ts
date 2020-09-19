export interface IFileControlUpload {
    action: "upload";
    compact?: boolean;
    accept?: string[];
    id: string;
    defaultMessage: string;
}
export interface IFileControlDownload {
    action: "download";
    compact?: boolean;
    id: string;
    label: string;
}
