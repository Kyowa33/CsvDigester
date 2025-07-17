export class CsvConfig {

    public mustFollowColOrder: boolean = true;
    public mustTestColRegExp: boolean = true;

    constructor(cfg:CsvConfig | undefined) {
        if (cfg !== undefined) {
            this.mustFollowColOrder = cfg.mustFollowColOrder;
            this.mustTestColRegExp = cfg.mustTestColRegExp;
        }
    }
}