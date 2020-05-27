/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import ref = require("ref-napi");
import IconvLite = require("iconv-lite");

let wchar_size: number;
let encoding: string;

if (process.platform == "win32") {
    wchar_size = 2;
    encoding = "utf-16le";
} 
else {
    wchar_size = 4;
    encoding = "utf-32le";
}

const wchar_t: ref.Type = Object.create(ref.types.CString);
wchar_t.get = (buffer: Buffer, offset: number): any => {
    const _buf = ref.readPointer(buffer, offset);

    if (ref.isNull(_buf)) {
        return null;
    }
    
    const stringBuf = ref.reinterpretUntilZeros(_buf, wchar_size);
    return IconvLite.decode(stringBuf, encoding);
};

wchar_t.set = (buffer: Buffer, offset: number, value: any): void => {
    let _buf = value;
  
    if (typeof value == "string") {
        _buf = IconvLite.encode(value + "\0", encoding);
    }
  
    ref.writePointer(buffer, offset, _buf);
};

export {
    wchar_t
};