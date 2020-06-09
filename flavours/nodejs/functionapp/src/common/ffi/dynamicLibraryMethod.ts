import ref = require("ref-napi");
import ffi = require("ffi-napi");

class DynamicLibraryMethod {
    dynamicLibrary: ffi.DynamicLibrary;
    entryPointPtr: Buffer;
    entryPoint: ffi.ForeignFunction;
    entryPointName: string;

    constructor(dynamicLibrary: ffi.DynamicLibrary, entryPointName: string, returnType: ref.Type | string, paramTypes?: Array<ref.Type|string>) {
        this.dynamicLibrary = dynamicLibrary;
        this.entryPointPtr = this.dynamicLibrary.get(entryPointName);

        if (!paramTypes)
        {
            paramTypes = [];
        }

        this.entryPointName = entryPointName;
        this.entryPoint = ffi.ForeignFunction(this.entryPointPtr, returnType, paramTypes);
    }

    Dispose(): void {
        this.dynamicLibrary = null;
        this.entryPointPtr = null;
        this.entryPoint = null;
        this.entryPointName = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Execute(...args: any[]): any {
        if (!args.length)
        {
            return this.entryPoint();
        }

        if (args.length === 1)
        {
            return this.entryPoint(args[0]);
        }

        if (args.length === 2)
        {
            return this.entryPoint(args[0], args[1]);
        }

        if (args.length === 3)
        {
            return this.entryPoint(args[0], args[1], args[2]);
        }

        if (args.length === 4)
        {
            return this.entryPoint(args[0], args[1], args[2], args[3]);
        }

        if (args.length === 5)
        {
            return this.entryPoint(args[0], args[1], args[2], args[3], args[4]);
        }

        if (args.length === 6)
        {
            return this.entryPoint(args[0], args[1], args[2], args[3], args[4], args[5]);
        }

        return this.entryPoint(...args);
    }
}

export default DynamicLibraryMethod;