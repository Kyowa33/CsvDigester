import { CsvException } from "./CsvException.ts";
import { CsvProcessor } from "./CsvProcessor.ts";

export interface ParserCallback {
    (progressPercent?: number): void;
}

export class CsvParser {

    public static readonly MAX_SAMPLE_ROWS = 10; // Must be at least 1 to keep the header
    public static readonly BATCH_SIZE = 5000;

    private gridData: Uint8Array[] = [];
    private gridDataCellSample: string[][] = [];
    private processor: CsvProcessor = new CsvProcessor();
    private pseudonymize: boolean = false;
    private separator: string = "";
    private inputData: Uint8Array = new Uint8Array();
    private curIdx: number = 0;
    private rowNum: number = 0;
    private progressCallback: ParserCallback = () => { };
    private returnInfo = { info: new CsvException(), warn: [] as CsvException[] };
    private mustStop: boolean = false;

    constructor() {
        this.reset();
    }

    public init(pseudonymize: boolean, processor: CsvProcessor, inputData: Uint8Array, progressCallback: ParserCallback) {
        this.pseudonymize = pseudonymize;
        this.processor = processor;
        this.inputData = inputData;
        this.progressCallback = progressCallback;
        this.reset();
    }

    public reset() {
        this.returnInfo = { info: new CsvException, warn: [] as CsvException[] };
        this.mustStop = false;
        this.gridData = [];
        this.gridDataCellSample = [];
    }

    public getGridData(): Uint8Array[] {
        return this.gridData;
    }


    public getGridDataCellSample(): string[][] {
        return this.gridDataCellSample;
    }

    public getReturnInfo() {
        return this.returnInfo;
    }

    public stop() {
        this.mustStop = true;
    }

    public async startParse() {
        this.reset();

        if (!this.inputData) {
            this.returnInfo.info = new CsvException(CsvException.CODE_RET_NO_DATA);
            this.progressCallback();
            return;
        }

        this.curIdx = 0;
        while ((this.curIdx < this.inputData.byteLength) && (this.inputData[this.curIdx] != 0x0D) && (this.inputData[this.curIdx] != 0x0A)) {
            this.curIdx++;
        }

        if (this.curIdx === this.inputData.byteLength) {
            this.returnInfo.info = new CsvException(CsvException.CODE_RET_NO_ROWS);
            this.progressCallback();
            return;
        }

        let textDecoder = new TextDecoder();
        let textEncoder = new TextEncoder();

        let header = this.inputData.slice(0, this.curIdx);
        let sHeader = textDecoder.decode(header);
        this.separator = sHeader.includes('\t') ? '\t' : sHeader.includes('|') ? '|' : ';';

        let headers = sHeader.split(this.separator);
        if (!headers || headers.length === 0) {
            this.returnInfo.info = new CsvException(CsvException.CODE_RET_HEADER_MALFORMED);
            this.progressCallback();
            return;
        }

        try {
            headers = await this.processor.processRow(headers, this.pseudonymize);
        }
        catch (e) {
            if (e instanceof CsvException) {
                this.returnInfo.info = e;
            } else {
                this.returnInfo.info = new CsvException(CsvException.CODE_RET_HEADER_MISMATCH);
            }
            this.progressCallback();
            return;
        }
        this.gridDataCellSample.push(headers);
        let sLine = headers.join(this.separator);
        if (this.curIdx < this.inputData.byteLength) {
            sLine += "\n";
        }
        let line = textEncoder.encode(sLine);
        this.gridData.push(line);
        this.rowNum = 1;
        this.progressCallback(0);

        setTimeout(() => { this.parse() }, 1);
    }


    public async parse() {
        try {
            let batchRowCounter = 0;
            while ((batchRowCounter < CsvParser.BATCH_SIZE) && (this.curIdx < this.inputData.byteLength) && (!this.mustStop)) {
                batchRowCounter++;

                let startIdx = this.curIdx;
                let nbLF = 0;
                while ((startIdx < this.inputData.byteLength) && ((this.inputData[startIdx] == 0x0D) || (this.inputData[startIdx] == 0x0A))) {
                    if (this.inputData[startIdx] == 0x0A) {
                        if (nbLF > 0) {
                            // Empty line
                            this.returnInfo.warn.push(new CsvException(CsvException.CODE_RET_ROW_CELL_COUNT_MISMATCH, this.rowNum));
                        }
                        nbLF++;
                        this.rowNum++;
                    }
                    startIdx++;
                }
                this.curIdx = startIdx;
                while ((this.curIdx < this.inputData.byteLength) && (this.inputData[this.curIdx] != 0x0D) && (this.inputData[this.curIdx] != 0x0A)) {
                    this.curIdx++;
                }
                let line = this.inputData.slice(startIdx, this.curIdx);
                let textDecoder = new TextDecoder();
                let sLine = textDecoder.decode(line);
                let cells = sLine.split(this.separator);

                // Empty line : add in warn array
                if ((cells.length === 1 && cells[0].trim() === '') || (cells.length !== this.gridDataCellSample[0].length)) {
                    this.returnInfo.warn.push(new CsvException(CsvException.CODE_RET_ROW_CELL_COUNT_MISMATCH, this.rowNum));
                }
                else {
                    cells = await this.processor.processRow(cells, this.pseudonymize);
                    if (this.rowNum < CsvParser.MAX_SAMPLE_ROWS)
                        this.gridDataCellSample.push(cells);

                    sLine = cells.join(this.separator);
                    if (this.curIdx < this.inputData.byteLength) {
                        sLine += "\n";
                    }
                    let textEncoder = new TextEncoder();
                    line = textEncoder.encode(sLine);

                    this.gridData.push(line);
                }
            }
            if ((this.curIdx < this.inputData.byteLength) && (!this.mustStop)) {
                this.progressCallback(Math.floor(this.curIdx * 100 / this.inputData.byteLength));
                setTimeout(async () => { await this.parse() }, 1);
            } else {
                if (this.mustStop) {
                    this.returnInfo.info = new CsvException(CsvException.CODE_RET_INTERRUPTED, this.rowNum);
                } else {
                    this.returnInfo.info = new CsvException(CsvException.CODE_RET_TERMINATED, this.rowNum);
                }
                this.progressCallback();
            }
        }
        catch (e) {
            if (e instanceof CsvException) {
                // Override the row info
                e.setRow(this.rowNum);
                this.returnInfo.info = e;
            } else {
                this.returnInfo.info = new CsvException(CsvException.CODE_RET_EXCEPTION, this.rowNum, ["" + e]);
            }
            this.progressCallback();
        }
    }

}