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

    public getOutputFileName(filename : string, action: number) : string {
        if (filename === "") {
            return "";
        }

        let lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex < 0) {
            lastDotIndex = filename.length;
        }

        let name = filename.slice(0, lastDotIndex);
        let ext = filename.slice(lastDotIndex+1);

        for (let sufCur in this.fileNameSuffixTab) {
            const suf = this.fileNameSuffixTab[sufCur];
            let sufIdx = lastDotIndex-suf.length;
            if (filename.indexOf(suf) === sufIdx) {
                name = filename.slice(0, sufIdx);
                break;
            }
        }

        return name + this.fileNameSuffixTab[action] + ((ext.length > 0) ? "." + ext : "");
    }

}