/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import ref = require("ref-napi");
import IconvLite = require("iconv-lite");
import { getProcessPlatform } from "../../platform";

const wchar_t: ref.Type = Object.create(ref.types.CString);
wchar_t.get = (buffer: Buffer, offset: number): any => {
    const _buf = ref.readPointer(buffer, offset);

    if (ref.isNull(_buf)) {
        return null;
    }

    let wchar_size: number;
    let encoding: string;

    if (getProcessPlatform() == "win32") {
        wchar_size = 2;
        encoding = "utf-16le";
    }
    else {
        wchar_size = 4;
        encoding = "utf-32le";
    }

    const stringBuf = ref.reinterpretUntilZeros(_buf, wchar_size);
    return IconvLite.decode(stringBuf, encoding);
};

wchar_t.set = (buffer: Buffer, offset: number, value: string|Buffer): void => {
    let encoding: string;

    if (getProcessPlatform() == "win32") {
        encoding = "utf-16le";
    }
    else {
        encoding = "utf-32le";
    }

    if (typeof value == "string") {
        ref.writePointer(buffer, offset, IconvLite.encode(value + "\0", encoding));
    } else {
        ref.writePointer(buffer, offset, value);
    }

};

export {
    wchar_t
};