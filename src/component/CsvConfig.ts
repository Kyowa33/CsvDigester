export class CsvConfig {

    public mustFollowColOrder: boolean = true;
    public mustTestColRegExp: boolean = true;
    public fileNameSuffixTab: string[] = ["_encode", "_decode"];


    constructor(cfg:CsvConfig | undefined) {
        if (cfg !== undefined) {
            this.mustFollowColOrder = cfg.mustFollowColOrder;
            this.mustTestColRegExp = cfg.mustTestColRegExp;
            this.fileNameSuffixTab = cfg.fileNameSuffixTab;
        }
    }

    private insertSuffix(filename : string, suffix : string) : string {
        const lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex > 0) {
            // Il y a une extension
            return filename.slice(0, lastDotIndex) + suffix + filename.slice(lastDotIndex);
        } else {
            // Pas d'extension, on ajoute à la fin
            return filename + suffix;
        }
    }

    public getOutputFileName(filename : string, action: number) : string {
        if (filename === "") {
            return "";
        }

        return this.insertSuffix(filename, this.fileNameSuffixTab[action]);
    }

}