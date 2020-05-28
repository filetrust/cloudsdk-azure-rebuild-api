/* eslint-disable @typescript-eslint/camelcase */
import { existsSync } from "fs";
import ref = require("ref-napi");
import ffi = require("ffi-napi");
import EngineOutcome from "./engineOutcome";
import { wchar_t } from "./node-ref-napi-custom-types";
import MethodWrapper from "./methodWrapper";

const pFile_t = ref.refType(ref.types.void);
const pFileLength_t = ref.refType(ref.types.size_t);

class EngineWrapper {
    _GlasswallEngine: ffi.DynamicLibrary;
    _GWFileErrorMsg: MethodWrapper;
    _GWFileDone: MethodWrapper;
    _GWFileVersion: MethodWrapper;
    _GWDetermineFileTypeFromFileInMem: MethodWrapper;
    _GWFileConfigXML: MethodWrapper;
    _GWMemoryToMemoryProtect: MethodWrapper;

    constructor(libPath: string) {
        if (!existsSync(libPath))
        {
            throw "Cannot find DLL at " + libPath;
        }
        
        this._GlasswallEngine = ffi.DynamicLibrary(libPath);
        this._GWFileErrorMsg = new MethodWrapper(this._GlasswallEngine, "GWFileErrorMsg", wchar_t, []);
        this._GWFileDone = new MethodWrapper(this._GlasswallEngine, "GWFileDone", "int", []);
        this._GWFileVersion = new MethodWrapper(this._GlasswallEngine, "GWFileVersion", wchar_t, []);
        this._GWDetermineFileTypeFromFileInMem = new MethodWrapper(this._GlasswallEngine, "GWDetermineFileTypeFromFileInMem", "int", ["pointer", "size_t"]);
        this._GWFileConfigXML = new MethodWrapper(this._GlasswallEngine, "GWFileConfigXML", "int", [wchar_t]);

        this._GWMemoryToMemoryProtect = new MethodWrapper(this._GlasswallEngine, "GWMemoryToMemoryProtect", "int",
            [
                "pointer",
                "size_t",
                wchar_t,
                pFile_t,
                pFileLength_t
            ]);
    }

    GWFileVersion(): string {
        return this._GWFileVersion.Execute();
    }

    GWDetermineFileTypeFromFileInMem(buffer: Buffer): number {
        if (!buffer)
        {
            throw "Buffer was not defined";
        }

        try 
        {
            return this._GWDetermineFileTypeFromFileInMem.Execute(buffer, buffer.length);
        }
        finally {
            buffer = null;
        }
    }

    GWFileConfigXML(xmlConfig: string): number {
        try {
            return this._GWFileConfigXML.Execute(xmlConfig);
        }
        finally {
            xmlConfig = null;
        }
    }

    GWMemoryToMemoryProtect(buffer: Buffer, fileType: string): { engineOutcome: number; protectedFile?: Buffer } {
        if (!buffer) { 
            throw "Buffer was not defined";
        }

        let engineOutcome: number;
        let protectedFile: Buffer;
        let pFilePtr = ref.alloc(pFile_t);
        let pFileLenPtr = ref.alloc(pFileLength_t);

        try {
            engineOutcome = this._GWMemoryToMemoryProtect.Execute(
                buffer,
                buffer.length,
                fileType,
                pFilePtr,
                pFileLenPtr);

            if (engineOutcome === EngineOutcome.Success) {
                const protectedFileLength = ref.readUInt64LE(pFileLenPtr);
                protectedFile = ref.readPointer(pFilePtr, 0, protectedFileLength);
            }
        }
        finally {
            pFilePtr = null;
            pFileLenPtr = null;
            buffer = null;
            fileType = null;
        }

        return { engineOutcome, protectedFile };
    }

    GWFileErrorMsg(): string {
        return this._GWFileErrorMsg.Execute();
    }

    GWFileDone(): number {
        return this._GWFileDone.Execute();
    }

    Finalise(): void {
        this._GWFileDone.Finalise();
        this._GWFileDone = null;
        this._GWFileVersion.Finalise();
        this._GWFileVersion = null;
        this._GWDetermineFileTypeFromFileInMem.Finalise();
        this._GWDetermineFileTypeFromFileInMem = null;
        this._GWFileConfigXML.Finalise();
        this._GWFileConfigXML = null;
        this._GWMemoryToMemoryProtect.Finalise();
        this._GWMemoryToMemoryProtect = null;
        this._GlasswallEngine.close();
        this._GlasswallEngine = null;
    }
}

export default EngineWrapper;