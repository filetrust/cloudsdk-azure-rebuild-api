/* eslint-disable @typescript-eslint/camelcase */
import { existsSync } from "fs";
import { types, alloc, refType, readPointer, readUInt64LE } from "ref-napi";
import { DynamicLibrary } from "ffi-napi";
import EngineOutcome from "./enums/engineOutcome";
import { wchar_t } from "../../common/ffi/custom-types/wchar_t";
import MethodWrapper from "../../common/ffi/dynamicLibraryMethod";

const pFile_t = refType(types.void);
const pFileLength_t = refType(types.size_t);

class LibGlasswallClassic {
    _GlasswallEngine: DynamicLibrary;
    _GWFileErrorMsg: MethodWrapper;
    _GWFileDone: MethodWrapper;
    _GWFileVersion: MethodWrapper;
    _GWDetermineFileTypeFromFileInMem: MethodWrapper;
    _GWFileConfigXML: MethodWrapper;
    _GWMemoryToMemoryProtect: MethodWrapper;

    constructor(libPath: string) {
        console.log("loading " + libPath);
        if (!existsSync(libPath)) {
            throw "Cannot find DLL at " + libPath;
        }

        console.log("found " + libPath);
        try {
            console.log("ffi.dynamiclibrary loading");
            this._GlasswallEngine = new DynamicLibrary(libPath);            
            console.log("ffi.dynamiclibrary loaded ");
            this._GWFileErrorMsg = new MethodWrapper(this._GlasswallEngine, "GWFileErrorMsg", wchar_t, []);
            console.log("_GWFileErrorMsg loaded ");
            this._GWFileDone = new MethodWrapper(this._GlasswallEngine, "GWFileDone", "int", []);
            console.log("_GWFileDone loaded ");
            this._GWFileVersion = new MethodWrapper(this._GlasswallEngine, "GWFileVersion", wchar_t, []);
            console.log("_GWFileVersion loaded ");
            this._GWDetermineFileTypeFromFileInMem = new MethodWrapper(this._GlasswallEngine, "GWDetermineFileTypeFromFileInMem", "int", ["pointer", "size_t"]);
            console.log("_GWDetermineFileTypeFromFileInMem loaded ");
            this._GWFileConfigXML = new MethodWrapper(this._GlasswallEngine, "GWFileConfigXML", "int", [wchar_t]);
            console.log("_GWFileConfigXML loaded ");

            this._GWMemoryToMemoryProtect = new MethodWrapper(this._GlasswallEngine, "GWMemoryToMemoryProtect", "int",
                [
                    "pointer",
                    "size_t",
                    wchar_t,
                    pFile_t,
                    pFileLength_t
                ]);
                
            console.log("engine loaded from: " + libPath);
        }
        catch (err) {
            console.log(err);
        }
    }

    GWFileVersion(): string {
        return this._GWFileVersion.Execute();
    }

    GWDetermineFileTypeFromFileInMem(buffer: Buffer): number {
        if (!buffer) {
            throw "Buffer was not defined";
        }

        try {
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
        let pFilePtr = alloc(pFile_t);
        let pFileLenPtr = alloc(pFileLength_t);

        try {
            engineOutcome = this._GWMemoryToMemoryProtect.Execute(
                buffer,
                buffer.length,
                fileType,
                pFilePtr,
                pFileLenPtr);

            if (engineOutcome === EngineOutcome.Success) {
                const protectedFileLength = readUInt64LE(pFileLenPtr);
                protectedFile = readPointer(pFilePtr, 0, protectedFileLength);
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

    Dispose(): void {
        this._GWFileDone.Dispose();
        this._GWFileDone = null;
        this._GWFileVersion.Dispose();
        this._GWFileVersion = null;
        this._GWDetermineFileTypeFromFileInMem.Dispose();
        this._GWDetermineFileTypeFromFileInMem = null;
        this._GWFileConfigXML.Dispose();
        this._GWFileConfigXML = null;
        this._GWMemoryToMemoryProtect.Dispose();
        this._GWMemoryToMemoryProtect = null;
        this._GlasswallEngine.close();
        this._GlasswallEngine = null;
    }
}

export default LibGlasswallClassic;