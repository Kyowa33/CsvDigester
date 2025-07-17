export class CsvException extends Error {

    public static readonly CODE_RET_UNKNOWN = -1;
    public static readonly CODE_RET_TERMINATED = 0;
    public static readonly CODE_RET_NO_DATA = 1;
    public static readonly CODE_RET_NO_ROWS = 2;
    public static readonly CODE_RET_HEADER_MALFORMED = 3;
    public static readonly CODE_RET_HEADER_MISMATCH = 4;
    public static readonly CODE_RET_INTERRUPTED = 5;
    public static readonly CODE_RET_ROW_CELL_COUNT_MISMATCH = 6;
    public static readonly CODE_RET_EXCEPTION = 7;
    public static readonly CODE_RET_COLUMNS_SPEC = 8;
    public static readonly CODE_RET_CELL_FORMAT_MISMATCH = 9;
    public static readonly CODE_RET_ERR_ENCRYPT = 10;
    public static readonly CODE_RET_ERR_DECRYPT = 11;
    public static readonly CODE_RET_ERR_CIPHER_9 = 12;
    public static readonly CODE_RET_ERR_CIPHER_16 = 13;
    public static readonly CODE_RET_ERR_CIPHER_64 = 14;
    public static readonly CODE_RET_ERR_UNCIPHER_9 = 15;
    public static readonly CODE_RET_ERR_UNCIPHER_16 = 16;
    public static readonly CODE_RET_ERR_UNCIPHER_64 = 17;
    public static readonly CODE_RET_ERR_HASH = 18;
    public static readonly CODE_RET_ERR_BUNDLE_CELL_NONE = 19;
    public static readonly CODE_RET_ERR_BUNDLE_COL_NONE = 20;
    public static readonly CODE_RET_ERR_BUNDLE_COL_CELLSPECID_UNDEFINED = 21;
    public static readonly CODE_RET_ERR_BUNDLE_COL_NO_RADIX = 22;
    public static readonly CODE_RET_ERR_BUNDLE_COL_NEXT_UNDEFINED = 23;
    public static readonly CODE_RET_ERR_BUNDLE_COL_NO_BEGINNING = 24;
    public static readonly CODE_RET_ERR_BUNDLE_COL_NOT_FOUND = 25;
    public static readonly CODE_RET_ERR_BUNDLE_CELL_CORRUPTED = 26;
    public static readonly CODE_RET_ERR_BUNDLE_COL_CORRUPTED = 27;

    private code : number;
    private row : number;
    private params : string[];

    constructor(code:number=CsvException.CODE_RET_UNKNOWN, row:number=-1, params:string[]=[]) {
        super("");
        this.code = code;
        this.row = row;
        this.params = params;
    }

    public getCode() : number {
        return this.code;
    }

    public getRow() : number {
        return this.row;
    }

    public setRow(row : number) {
        this.row = row;
    }

    public getParams() : string[] {
        return this.params;
    }
}