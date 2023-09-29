export default interface DownloadData {
    url: string;
    readonly isValid: boolean;
    readonly name: string;
    readonly qualityString: string;
    readonly fileSize: number | null;
    fetchFileSize: () => Promise<void>;
    download: () => void;
}