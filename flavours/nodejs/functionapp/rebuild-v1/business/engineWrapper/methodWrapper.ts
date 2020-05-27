import ref = require("ref-napi");
import ffi = require("ffi-napi");

class MethodWrapper {
    _engine: ffi.DynamicLibrary;
    _entryPointPtr: Buffer;
    _entryPoint: ffi.ForeignFunction;
    _entryPointName: string;

    constructor(engine: ffi.DynamicLibrary, entryPointName: string, returnType: ref.Type | string, paramTypes: Array<ref.Type|string>) {
        this._engine = engine;
        this._entryPointPtr = this._engine.get(entryPointName);

        if (!paramTypes)
        {
            paramTypes = [];
        }

        this._entryPointName = entryPointName;
        this._entryPoint = ffi.ForeignFunction(this._entryPointPtr, returnType, paramTypes);
    }

    Finalise(): void {
        this._engine = null;
        this._entryPointPtr = null;
        this._entryPoint = null;
        this._entryPointName = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Execute(...args: any[]): any {
        if (!args.length)
        {
            return this._entryPoint();
        }

        if (args.length === 1)
        {
            return this._entryPoint(args);
        }

        if (args.length === 2)
        {
            return this._entryPoint(args[0], args[1]);
        }

        if (args.length === 3)
        {
            return this._entryPoint(args[0], args[1], args[2]);
        }

        if (args.length === 4)
        {
            return this._entryPoint(args[0], args[1], args[2], args[3]);
        }

        if (args.length === 5)
        {
            return this._entryPoint(args[0], args[1], args[2], args[3], args[4]);
        }

        if (args.length === 6)
        {
            return this._entryPoint(args[0], args[1], args[2], args[3], args[4], args[5]);
        }
    }
}

export default MethodWrapper;