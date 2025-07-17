import { CsvColumn } from "./CsvColumn.ts";
import { CsvException } from "./CsvException.ts";
import { PseudoAlgo } from "./PseudoAlgo.ts";

import cellBundle from "../formats/CellBundle_Standard.json";
import colBundle from "../formats/ColSpec_FEC.json";
import colBundle2 from "../formats/ColSpec_FEC2.json";
import type { CsvConfig } from "./CsvConfig.ts";

export interface CellSpec {
    cellSpecId: string;
    name: string;
    regex: string;
}

export interface CellBundle {
    content: string;
    name: string;
    version: string;
    date: string;
    types: CellSpec[];
}

export interface ColSpec {
    headerLib: string;
    cellSpecId: string;
    mandatory: boolean;
    encodable: boolean;
    nextCols: string[];
}

export interface ColBundle {
    content: string;
    name: string;
    version: string;
    date: string;
    link: string;
    orderStrict: string;
    valueStrict: string;
    cols: ColSpec[];
}

export class CsvProcessor {

    // private static readonly REGEXP_ALPHANUM = /^[^\t\n\r|;]*$/;
    // private static readonly REGEXP_AMOUNT = /^(?:(-?\d+(\.\d+)?)|(\d+(\.\d+)?-)|)$/;
    // private static readonly REGEXP_DATE_YYYYMMDD = /^(?:([12]\d{3})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])|)$/;

    // private static readonly COL_JOURNAL_CODE = new CsvColumn("JournalCode", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_JOURNAL_LIB = new CsvColumn("JournalLib", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_ECRITURE_NUM = new CsvColumn("EcritureNum", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_ECRITURE_DATE = new CsvColumn("EcritureDate", true, CsvProcessor.REGEXP_DATE_YYYYMMDD, 0);
    // private static readonly COL_COMPTE_NUM = new CsvColumn("CompteNum", true, CsvProcessor.REGEXP_ALPHANUM, 9);
    // private static readonly COL_COMPTE_LIB = new CsvColumn("CompteLib", true, CsvProcessor.REGEXP_ALPHANUM, 64);
    // private static readonly COL_COMP_AUX_NUM = new CsvColumn("CompAuxNum", true, CsvProcessor.REGEXP_ALPHANUM, 9);
    // private static readonly COL_COMP_AUX_LIB = new CsvColumn("CompAuxLib", true, CsvProcessor.REGEXP_ALPHANUM, 64);
    // private static readonly COL_PIECE_REF = new CsvColumn("PieceRef", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_PIECE_DATE = new CsvColumn("PieceDate", true, CsvProcessor.REGEXP_DATE_YYYYMMDD, 0);
    // private static readonly COL_ECRITURE_LIB = new CsvColumn("EcritureLib", true, CsvProcessor.REGEXP_ALPHANUM, 64);
    // private static readonly COL_DEBIT = new CsvColumn("Debit", true, CsvProcessor.REGEXP_AMOUNT, 0);
    // private static readonly COL_CREDIT = new CsvColumn("Credit", true, CsvProcessor.REGEXP_AMOUNT, 0);
    // private static readonly COL_ECRITURE_LET = new CsvColumn("EcritureLet", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_DATE_LET = new CsvColumn("DateLet", true, CsvProcessor.REGEXP_DATE_YYYYMMDD, 0);
    // private static readonly COL_VALID_DATE = new CsvColumn("ValidDate", true, CsvProcessor.REGEXP_DATE_YYYYMMDD, 0);
    // private static readonly COL_MONTANT_DEVISE = new CsvColumn("Montantdevise", true, CsvProcessor.REGEXP_AMOUNT, 0);
    // private static readonly COL_IDEVISE = new CsvColumn("Idevise", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_MONTANT = new CsvColumn("Montant", true, CsvProcessor.REGEXP_AMOUNT, 0);
    // private static readonly COL_SENS = new CsvColumn("Sens", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_DATE_RGLT = new CsvColumn("DateRglt", false, CsvProcessor.REGEXP_DATE_YYYYMMDD, 0);
    // private static readonly COL_MODE_RGLT = new CsvColumn("ModeRglt", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_NAT_OP = new CsvColumn("NatOp", true, CsvProcessor.REGEXP_ALPHANUM, 0);
    // private static readonly COL_ID_CLIENT = new CsvColumn("IdClient", false, CsvProcessor.REGEXP_ALPHANUM, 0);

    // private static readonly COLS_FIRST: CsvColumn[] = [CsvProcessor.COL_JOURNAL_CODE];

    private static initialized = false;


    // Init columns' branches possibilities
    public static staticInit() {
        if (CsvProcessor.initialized)
            return;

        CsvProcessor.loadCellBundle(cellBundle as CellBundle);
        CsvProcessor.loadColBundle(colBundle as ColBundle);
        CsvProcessor.loadColBundle(colBundle2 as ColBundle);

        CsvProcessor.initialized = true;
        // CsvProcessor.COL_JOURNAL_CODE.addNextCol(CsvProcessor.COL_JOURNAL_LIB);
        // CsvProcessor.COL_JOURNAL_LIB.addNextCol(CsvProcessor.COL_ECRITURE_NUM);
        // CsvProcessor.COL_ECRITURE_NUM.addNextCol(CsvProcessor.COL_ECRITURE_DATE);
        // CsvProcessor.COL_ECRITURE_DATE.addNextCol(CsvProcessor.COL_COMPTE_NUM);
        // CsvProcessor.COL_COMPTE_NUM.addNextCol(CsvProcessor.COL_COMPTE_LIB);
        // CsvProcessor.COL_COMPTE_LIB.addNextCol(CsvProcessor.COL_COMP_AUX_NUM);
        // CsvProcessor.COL_COMP_AUX_NUM.addNextCol(CsvProcessor.COL_COMP_AUX_LIB);
        // CsvProcessor.COL_COMP_AUX_LIB.addNextCol(CsvProcessor.COL_PIECE_REF);
        // CsvProcessor.COL_PIECE_REF.addNextCol(CsvProcessor.COL_PIECE_DATE);
        // CsvProcessor.COL_PIECE_DATE.addNextCol(CsvProcessor.COL_ECRITURE_LIB);
        // CsvProcessor.COL_ECRITURE_LIB.addNextCol(CsvProcessor.COL_DEBIT);
        // CsvProcessor.COL_ECRITURE_LIB.addNextCol(CsvProcessor.COL_MONTANT);
        // CsvProcessor.COL_DEBIT.addNextCol(CsvProcessor.COL_CREDIT);
        // CsvProcessor.COL_MONTANT.addNextCol(CsvProcessor.COL_SENS);
        // CsvProcessor.COL_CREDIT.addNextCol(CsvProcessor.COL_ECRITURE_LET);
        // CsvProcessor.COL_SENS.addNextCol(CsvProcessor.COL_ECRITURE_LET);
        // CsvProcessor.COL_ECRITURE_LET.addNextCol(CsvProcessor.COL_DATE_LET);
        // CsvProcessor.COL_DATE_LET.addNextCol(CsvProcessor.COL_VALID_DATE);
        // CsvProcessor.COL_VALID_DATE.addNextCol(CsvProcessor.COL_MONTANT_DEVISE);
        // CsvProcessor.COL_MONTANT_DEVISE.addNextCol(CsvProcessor.COL_IDEVISE);
        // CsvProcessor.COL_IDEVISE.addNextCol(CsvProcessor.COL_DATE_RGLT);
        // CsvProcessor.COL_DATE_RGLT.addNextCol(CsvProcessor.COL_MODE_RGLT);
        // CsvProcessor.COL_MODE_RGLT.addNextCol(CsvProcessor.COL_NAT_OP);
        // CsvProcessor.COL_NAT_OP.addNextCol(CsvProcessor.COL_ID_CLIENT);
    }

    public static cellBundles: CellBundle[] = [];
    public static colBundles: ColBundle[] = [];

    private static firstColsFromColBundle: CsvColumn[] = []; // Read from spec
    private static activeBundle: ColBundle | undefined;
    private static config : CsvConfig;

    private rowCount!: number; // Number of processed rows
    private colsSchema!: CsvColumn[]; // Columns read from csv
    private pseudoAlgo!: PseudoAlgo;
    private dictionary!: Map<string, string>;
    

    private reset() {
        this.rowCount = 0;
        this.colsSchema = [];
        this.pseudoAlgo = new PseudoAlgo();
        this.dictionary = new Map<string, string>();
    }

    public static setConfig(cfg : CsvConfig) {
        CsvProcessor.config = cfg;
    }

    public static isOrderStrict() : boolean {
        return this.config.mustFollowColOrder;
    }

    public static isValueStrict() : boolean {
        return this.config.mustTestColRegExp;
    }

    public static getActiveColBundle() : ColBundle | undefined {
        return CsvProcessor.activeBundle;
    }

    /**
     * 
     * @param bundle Add or replace a cell bundle
     * @returns void
     */
    public static loadCellBundle(bundle: CellBundle) {
        let name = bundle.name;

        if (bundle.content !== "CELLSPEC") {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_CELL_CORRUPTED);
        }

        for (let bundleIdx in CsvProcessor.cellBundles) {
            let cb = CsvProcessor.cellBundles[bundleIdx];
            if (cb.name === name) {
                CsvProcessor.cellBundles[bundleIdx] = bundle;
                return;
            }
        }

        CsvProcessor.cellBundles.push(bundle);
    }

    /**
     * 
     * @param bundle Add or replace a cell bundle
     * @returns void
     */
    public static loadColBundle(bundle: ColBundle) {
        let name = bundle.name;

        if (bundle.content !== "COLSPEC") {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_CORRUPTED);
        }

        for (let bundleIdx in CsvProcessor.colBundles) {
            let cb = CsvProcessor.colBundles[bundleIdx];
            if (cb.name === name) {
                CsvProcessor.colBundles[bundleIdx] = bundle;
                return;
            }
        }

        CsvProcessor.colBundles.push(bundle);
    }

    /**
     * Load a column specification bundle
     * Find the possible entry points (columns with no predecessors)
     * Assign the appropriate encoding according to the cell regex test
     * @param bundle
     */
    public static applyColBundle(index: number) {
        CsvProcessor.firstColsFromColBundle = [];

        if (CsvProcessor.cellBundles.length === 0) {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_CELL_NONE);
        }

        if (CsvProcessor.colBundles.length === 0) {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NONE);
        }

        if ((index < 0) || (index >= CsvProcessor.colBundles.length) || (!CsvProcessor.colBundles[index])) {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NOT_FOUND, 0, ["" + index]);
        }
        let bundle : ColBundle = CsvProcessor.colBundles[index];

        CsvProcessor.activeBundle = bundle;

        const radixKeys = Object.keys(PseudoAlgo.RADIX);
        const radixVals = Object.values(PseudoAlgo.RADIX);

        let firstCols: ColSpec[] = [];
        let convCols: CsvColumn[] = [];

        for (let colIdx in bundle.cols) {
            let col = bundle.cols[colIdx];
            firstCols.push(col);
            // console.log("col " + col.headerLib);
            let cellSpec = CsvProcessor.findCellSpec(col.cellSpecId);
            if (cellSpec === null) {
                // console.error("Le type de donnée " + col.cellSpecId + " n'est pas défini.");
                throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_CELLSPECID_UNDEFINED, 0, [col.headerLib, col.cellSpecId]);
            }
            let radix = 0;
            let regexp = new RegExp(cellSpec.regex);

            if (col.encodable) {
                for (let radixIdx in radixKeys) {
                    let key = radixKeys[radixIdx];
                    let val = radixVals[radixIdx];
                    if (regexp.test(val)) {
                        radix = Math.max(radix, Number.parseFloat(key));
                    }
                }
                // console.log("radix compatible : " + radix);
                if (radix === 0) {
                    // console.error("Le type de donnée " + col.cellSpecId + " n'est pas encodable en respectant le format.");
                    throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NO_RADIX, 0, [col.headerLib, col.cellSpecId]);
                }
            }
            let csvCol = new CsvColumn(col.headerLib, col.mandatory, regexp, radix);
            convCols.push(csvCol);
        }

        for (let colIdx in bundle.cols) {
            let colBun = bundle.cols[colIdx];
            let colCsv = convCols[colIdx];
            // console.log("colBun " + colBun.headerLib);

            for (let i = 0; i < colBun.nextCols.length; i++) {
                let nextHeaderLib = colBun.nextCols[i];

                // Attach nextCols
                let k;
                for (k = 0; k < convCols.length; k++) {
                    if (convCols[k].getName() === nextHeaderLib) {
                        colCsv.addNextCol(convCols[k]);
                        break;
                    }
                }
                if (k === convCols.length) {
                    // console.error("La colonne " + nextHeaderLib + " n'est pas définie.");
                    throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NEXT_UNDEFINED, 0, [colBun.headerLib, nextHeaderLib]);
                }

                if (CsvProcessor.isOrderStrict()) {
                    // Eliminate referenced cols to keep the beginning cols only
                    for (let j = 0; j < firstCols.length; j++) {
                        if (firstCols[j].headerLib === nextHeaderLib) {
                            firstCols.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        }

        if (firstCols.length === 0) {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NO_BEGINNING);
        }

        for (let i = 0; i < firstCols.length; i++) {
            let k;
            for (k = 0; k < convCols.length; k++) {
                if (convCols[k].getName() === firstCols[i].headerLib) {
                    CsvProcessor.firstColsFromColBundle.push(convCols[k]);
                    break;
                }
            }
            if (k === convCols.length) {
                // console.error("La colonne " + firstCols[i].headerLib + " n'est pas définie.");
                throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NEXT_UNDEFINED, 0, [firstCols[i].headerLib]);
            }
        }
    }

    private static findCellSpec(cellSpecId: string): CellSpec | null {
        for (let bundleIdx in CsvProcessor.cellBundles) {
            let cb = CsvProcessor.cellBundles[bundleIdx];
            for (let cellSpecIdx in cb.types) {
                let cbt = cb.types[cellSpecIdx];
                if (cbt.cellSpecId === cellSpecId) {
                    return cbt;
                }
            }
        }
        return null;
    }

    public async init(pass: string) {
        this.reset();
        await this.pseudoAlgo.init(pass);
    }

    public getDictionary(): Map<string, string> {
        return this.dictionary;
    }

    private processHeaderOrdered(fields: string[]): string[] {
        let row: string[] = [];
        let colIndex: number = 0;
        let nextCols: CsvColumn[] = CsvProcessor.firstColsFromColBundle;
        while (nextCols.length > 0) {
            let found = false;
            let added = false;
            for (let curColIdx in nextCols) {
                let curCol = nextCols[curColIdx];
                if (curCol.getName() === fields[colIndex]) {
                    row.push(curCol.getName());
                    this.colsSchema.push(curCol);
                    nextCols = curCol.getTabNextCols();
                    colIndex++;
                    found = true;
                    added = true;
                    break;
                }
                if (!curCol.isMandatory()) {
                    found = true;
                }
            }
            if (!found)
                throw new CsvException(CsvException.CODE_RET_COLUMNS_SPEC, 1, ["" + (colIndex + 1), fields[colIndex]]);
            if (!added)
                break;
        }
        return row;
    }

    private processHeaderUnordered(fields: string[]): string[] {
        let row: string[] = [];
        let colIndex: number = 0;
        let nextCols: CsvColumn[] = CsvProcessor.firstColsFromColBundle;
        while (colIndex < fields.length) {
            let found = false;
            for (let curColIdx in nextCols) {
                let curCol = nextCols[curColIdx];
                if (curCol.getName() === fields[colIndex]) {
                    row.push(fields[colIndex]);
                    this.colsSchema.push(curCol);
                    colIndex++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Ignore unknown columns
                row.push(fields[colIndex]);
                this.colsSchema.push(CsvColumn.COL_UNKNOWN);
                colIndex++;
            }
        }
        return row;
    }

    private processHeader(fields: string[]): string[] {
        if (CsvProcessor.activeBundle === undefined) {
            throw new CsvException(CsvException.CODE_RET_ERR_BUNDLE_COL_NONE);
        }

        if (CsvProcessor.isOrderStrict()) {
            return this.processHeaderOrdered(fields);
        } else {
            return this.processHeaderUnordered(fields);
        }
    }


    public async processRow(fields: string[], pseudonymize: boolean): Promise<string[]> {
        let row: string[] = [];

        this.rowCount++;
        if (this.rowCount === 1) {
            row = this.processHeader(fields);
        }
        else {
            for (let idx = 0; idx < this.colsSchema.length; idx++) {
                let curCol = this.colsSchema[idx];
                let curField = fields[idx];
                if ((CsvProcessor.isValueStrict()) && (!curCol.isValid(curField))) {
                    throw new CsvException(CsvException.CODE_RET_CELL_FORMAT_MISMATCH, (this.rowCount + 1), ["" + (idx + 1), curField]);
                }
                if (curCol.getEncodingRadix() !== 0) {
                    try {
                        let processedValue = this.dictionary.get(curField);
                        if (!processedValue) {
                            if (pseudonymize)
                                processedValue = await this.pseudoAlgo.encrypt(curField, curCol.getEncodingRadix());
                            else
                                processedValue = await this.pseudoAlgo.decrypt(curField, curCol.getEncodingRadix());

                            this.dictionary.set(curField, processedValue);
                        }
                        curField = processedValue;
                    }
                    catch (e) {
                        if (e instanceof CsvException) {
                            throw new CsvException(e.getCode(), -1 /* will be overridden */, ["" + (idx + 1)]);
                        }
                        throw new CsvException(CsvException.CODE_RET_EXCEPTION, -1, ["" + e]);
                    }
                }
                row.push(curField);
            }
        }

        return row;
    }

}