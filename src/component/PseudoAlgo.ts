import { CsvException } from "./CsvException.ts";

export class PseudoAlgo {

    private iv!: ArrayBuffer;
    private cryptoKey!: CryptoKey;

    private static readonly HASH_ALGO = "SHA-256";

    private static readonly ENCODE_ALPHABET_9 = "123456789"; // Avoid 0 to keep safe numeric decoding : no leading zeroes
    private static readonly ENCODE_ALPHABET_16 = "0123456789ABCDEF"; // not used so far
    private static readonly ENCODE_ALPHABET_64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$&0123456789"; // not exactly b64 encoding

    public static readonly RADIX = {
        "64": PseudoAlgo.ENCODE_ALPHABET_64,
        "16": PseudoAlgo.ENCODE_ALPHABET_16,
        "9": PseudoAlgo.ENCODE_ALPHABET_9
    };

    private suffledEncode9 = { value: "" + PseudoAlgo.ENCODE_ALPHABET_9 };
    private suffledDecode9 = new Array<number>(128);
    private suffledEncode16 = { value: "" + PseudoAlgo.ENCODE_ALPHABET_16 };
    private suffledDecode16 = new Array<number>(128);
    private suffledEncode64 = { value: "" + PseudoAlgo.ENCODE_ALPHABET_64 };
    private suffledDecode64 = new Array<number>(128);

    public async init(pass: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pass);
        const hash = await window.crypto.subtle.digest(PseudoAlgo.HASH_ALGO, data);
        if (hash) {
            try {
                this.iv = hash.slice(0, 16);
                this.cryptoKey = await window.crypto.subtle.importKey(
                    "raw",
                    hash,
                    { name: "AES-CBC" },
                    false,
                    ["encrypt", "decrypt"]
                );

                // Must be an even length
                if ((hash.byteLength & 1) !== 0)
                    throw new CsvException(CsvException.CODE_RET_ERR_HASH, 0, [PseudoAlgo.HASH_ALGO]);

                this.shuffleAlphabets(new Uint8Array(hash));
            }
            catch (e) {
                throw new CsvException(CsvException.CODE_RET_ERR_HASH, 0, [PseudoAlgo.HASH_ALGO]);
            }
        } else {
            throw new CsvException(CsvException.CODE_RET_ERR_HASH, 0, [PseudoAlgo.HASH_ALGO]);
        }
    }

    private shuffle(tabEncodeFrom: string, tabEncodeTo: any, tabDecode: Array<number>, hash: Uint8Array) {
        let i: number;
        let tmpTabEncodeTo: string[] = tabEncodeFrom.split("");

        for (i = 0; i < hash.byteLength; i += 2) {
            const b1 = hash[i] % tabEncodeFrom.length;
            const b2 = hash[i + 1] % tabEncodeFrom.length;

            // Swap pseudo randomly according to hash values
            let tmp = tmpTabEncodeTo[b2];
            tmpTabEncodeTo[b2] = tmpTabEncodeTo[b1];
            tmpTabEncodeTo[b1] = tmp;
        }

        tabEncodeTo.value = tmpTabEncodeTo.join("");

        for (let i: number = 0; i < tmpTabEncodeTo.length; i++) {
            tabDecode[tmpTabEncodeTo[i].charCodeAt(0)] = i;
        }

        // console.log("Shuffled alphabet : " + tabEncodeTo.value);
    }

    private shuffleAlphabets(hash: Uint8Array) {
        this.shuffle(PseudoAlgo.ENCODE_ALPHABET_9, this.suffledEncode9, this.suffledDecode9, hash);
        this.shuffle(PseudoAlgo.ENCODE_ALPHABET_16, this.suffledEncode16, this.suffledDecode16, hash);
        this.shuffle(PseudoAlgo.ENCODE_ALPHABET_64, this.suffledEncode64, this.suffledDecode64, hash);
    }

    public async encrypt(dataStr: string, base: number): Promise<string> {
        if (dataStr.length === 0) {
            return "";
        }

        // console.log("encrypt : " + dataStr + " into base " + base);

        const encoder = new TextEncoder();
        const arrayBuffer = encoder.encode(dataStr).buffer;
        let cipheredText;
        try {
            cipheredText = await window.crypto.subtle.encrypt(
                { name: "AES-CBC", iv: this.iv },
                this.cryptoKey,
                arrayBuffer
            );
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_ENCRYPT);
        }
        const bytes = new Uint8Array(cipheredText);
        let cipheredtext;

        if (base === 9)
            cipheredtext = this.uint8ArrayToBase9(bytes);
        else
            if (base === 16)
                cipheredtext = this.uint8ArrayToBase16(bytes);
            else
                cipheredtext = this.uint8ArrayToBase64(bytes);

        // console.log("encrypted : " + dataStr + " -> " + cipheredtext);

        return cipheredtext;
    }

    public async decrypt(cipheredText: string, base: number): Promise<string> {
        if (cipheredText.length === 0) {
            return "";
        }

        // console.log("decrypt : " + cipheredText + " from base " + base);

        let bytes;
        if (base === 9)
            bytes = this.base9ToUint8Array(cipheredText);
        else
            if (base === 16)
                bytes = this.base16ToUint8Array(cipheredText);
            else
                bytes = this.base64ToUint8Array(cipheredText);

        let decryptedBuffer: ArrayBuffer;
        try {
            decryptedBuffer = await window.crypto.subtle.decrypt(
                { name: "AES-CBC", iv: this.iv },
                this.cryptoKey,
                bytes.buffer
            );
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_DECRYPT);
        }

        const decoder = new TextDecoder('utf-8');
        const decodedText = decoder.decode(decryptedBuffer);
        // console.log("decrypted : " + cipheredText + " -> " + decodedText);
        return decodedText;
    }


    public uint8ArrayToBase64(bytes: Uint8Array): string {
        try {
            let result = "";
            const len = bytes.length;

            for (let i = 0; i < len; i += 3) {
                const byte1 = bytes[i];
                const byte2 = bytes[i + 1] !== undefined ? bytes[i + 1] : 0;
                const byte3 = bytes[i + 2] !== undefined ? bytes[i + 2] : 0;

                const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                result +=
                    this.suffledEncode64.value[(triplet >> 18) & 0x3f] +
                    this.suffledEncode64.value[(triplet >> 12) & 0x3f] +
                    (i + 1 >= len ? this.suffledEncode64.value[64] : this.suffledEncode64.value[(triplet >> 6) & 0x3f]) +
                    (i + 2 >= len ? this.suffledEncode64.value[64] : this.suffledEncode64.value[triplet & 0x3f]);
            }
            return result;
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_CIPHER_64);
        }

    }


    public base64ToUint8Array(base64Str: string): Uint8Array {
        try {
            let i = 0;
            const len = base64Str.length;
            let validLen = base64Str.indexOf(this.suffledEncode64.value[64]);
            if (validLen < 0) validLen = len;

            const bufferLength = ((validLen * 3) / 4);
            const res = new Uint8Array(bufferLength);

            let tmpIndex = 0;
            const quad = [0, 0, 0, 0];

            while (i < len) {
                quad[0] = this.suffledDecode64[base64Str.charCodeAt(i++)];
                quad[1] = this.suffledDecode64[base64Str.charCodeAt(i++)];
                quad[2] = this.suffledDecode64[base64Str.charCodeAt(i++)];
                quad[3] = this.suffledDecode64[base64Str.charCodeAt(i++)];

                const triple = (quad[0] << 18) | (quad[1] << 12) | (quad[2] << 6) | quad[3];

                const b1 = (triple >> 16) & 0xFF;
                const b2 = (triple >> 8) & 0xFF;
                const b3 = triple & 0xFF;

                if (tmpIndex + 3 <= bufferLength) {
                    res[tmpIndex + 0] = b1;
                    res[tmpIndex + 1] = b2;
                    res[tmpIndex + 2] = b3;
                    tmpIndex += 3;
                } else {
                    if (tmpIndex < bufferLength) res[tmpIndex++] = b1;
                    if (tmpIndex < bufferLength) res[tmpIndex++] = b2;
                    if (tmpIndex < bufferLength) res[tmpIndex++] = b3;
                }
            }
            return res;
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_UNCIPHER_64);
        }
    }


    public uint8ArrayToBase16(bytes: Uint8Array): string {
        try {
            let result = '';
            const len = bytes.length;
            let i;

            for (i = 0; i < len; i++) {
                const byte = bytes[i];

                result +=
                    this.suffledEncode16.value[(byte >> 4) & 0x0f] +
                    this.suffledEncode16.value[byte & 0x0f];
            }

            return result;
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_CIPHER_16);
        }
    }


    public base16ToUint8Array(base16Str: string): Uint8Array {
        try {
            let i = 0;
            base16Str = base16Str.toUpperCase();
            const len = base16Str.length;
            if ((len & 1) !== 0) {
                throw new Error("Not a hex string : odd number of digits.");
            }
            const res = new Uint8Array(len / 2);
            let byte;
            let tmpIndex = 0;

            while (i < len) {
                byte = this.suffledDecode16[base16Str.charCodeAt(i++)] << 4;
                byte |= this.suffledDecode16[base16Str.charCodeAt(i++)];
                res[tmpIndex++] = byte;
            }

            return res;
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_UNCIPHER_16);
        }
    }


    public uint8ArrayToBase9(bytes: Uint8Array): string {
        try {
            let result = '';
            const len = bytes.length;
            let i;

            for (i = 0; i < len; i++) {
                const byte = bytes[i];

                result +=
                    this.suffledEncode9.value[Math.floor(byte / 81) % 9] +
                    this.suffledEncode9.value[Math.floor(byte / 9) % 9] +
                    this.suffledEncode9.value[byte % 9];
            }

            return result;
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_CIPHER_9);
        }
    }


    public base9ToUint8Array(base9Str: string): Uint8Array {
        try {
            let i = 0;
            const len = base9Str.length;
            if ((len % 3) !== 0) {
                throw new Error("Not a B9 string : number of digits is not a multiple of 3.");
            }
            const res = new Uint8Array(len / 3);
            let byte;
            let tmpIndex = 0;

            while (i < len) {
                byte = this.suffledDecode9[base9Str.charCodeAt(i++)] * 81;
                byte += this.suffledDecode9[base9Str.charCodeAt(i++)] * 9;
                byte += this.suffledDecode9[base9Str.charCodeAt(i++)];
                res[tmpIndex++] = byte;
            }

            return res;
        }
        catch (e) {
            throw new CsvException(CsvException.CODE_RET_ERR_UNCIPHER_9);
        }
    }

}