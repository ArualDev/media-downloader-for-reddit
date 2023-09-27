export default interface DownloadData {
    url: string;
    readonly isValid: boolean;
    readonly name: string;
    readonly qualityString: string;
    download: () => void;
}