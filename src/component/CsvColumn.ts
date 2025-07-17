export class CsvColumn {

    public static COL_UNKNOWN = new CsvColumn("", false, new RegExp("/.*/"), 0);

    private readonly name : string;
    private readonly mandatory : boolean;
    private readonly validRegExp : RegExp;
    private readonly encodingRadix : number;
    
    private tabNextCols : CsvColumn[] = [];

    constructor(name:string, mandatory:boolean, regExp:RegExp, encodingRadix:number) {
        this.name = name;
        this.mandatory = mandatory;
        this.validRegExp = regExp;
        this.encodingRadix = encodingRadix;
    }

    public getName() : string {
        return this.name;
    }

    public isMandatory() : boolean {
        return this.mandatory;
    }

    public isValid(value : string) : boolean {
        return this.validRegExp.test(value);
    }

    public getEncodingRadix() : number {
        return this.encodingRadix;
    }

    public addNextCol(fecCol : CsvColumn) {
        this.tabNextCols.push(fecCol);
    }

    public getTabNextCols() : CsvColumn[] {
        return this.tabNextCols;
    }
}