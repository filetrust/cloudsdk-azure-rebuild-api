import Enum from "../enum";
import FileType from "../fileType";
import EngineOutcome from "./engineOutcome";
import EngineWrapper from "./engineWrapper";
import ContentManagementFlags from "./contentManagementFlags";

export type EngineStatusResponse = {
    engineOutcome: number;
    engineOutcomeName: string;
};

export type FileTypeResponse = {
    fileType: number;
    fileTypeName: string;
}

export type RebuildResponse = {
    errorMessage?: string;
    engineOutcome: number;
    engineOutcomeName: string;
    protectedFile?: Buffer;
    protectedFileLength?: number;
}

class EngineService {
    EngineWrapper: EngineWrapper;
    Logger: { log: (message: string) => void };

    constructor(logger: { log: (message: string) => void }) {
        this.Logger = logger;
        const path = (process.platform == "win32" ?
            "..\\..\\..\\lib\\windows\\SDK\\glasswall.classic.dll"
            : "../../../lib/linux/SDK/libglasswall.classic.so");
        this.Logger.log("Loading engine from " + path);
        this.EngineWrapper = new EngineWrapper(path);
    }

    Finalise(): void {
        this.EngineWrapper.Finalise();
        this.EngineWrapper = null;
        this.Logger = null;
    }

    GetLibraryVersion(): string {
        try {
            return this.EngineWrapper.GWFileVersion();
        }
        catch (err) {
            this.Logger.log(err);
            return "Error Retrieving";
        }
    }

    GetFileType(buffer: Buffer): FileTypeResponse {
        if (!buffer) {
            throw "Buffer was not defined";
        }

        try {
            const fileType = this.EngineWrapper.GWDetermineFileTypeFromFileInMem(buffer);
            const fileTypeName = Enum.GetString(FileType, fileType);

            this.Logger.log("File Type: '" + fileType + "' - '" + fileTypeName + "'");

            return {
                fileType,
                fileTypeName
            };
        }
        catch (err) {
            this.Logger.log("Error, defaulting to Unknown. Error: " + err.toString());
        }
        finally {
            buffer = null;
        }

        return {
            fileType: FileType.Unknown,
            fileTypeName: Enum.GetString(FileType, FileType.Unknown)
        };
    }

    SetConfiguration(contentManagementFlags: ContentManagementFlags): EngineStatusResponse {
        try {
            const xmlConfig = contentManagementFlags.Adapt();
            const engineOutcome = this.EngineWrapper.GWFileConfigXML(xmlConfig);
            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                const error = this.EngineWrapper.GWFileErrorMsg();
                throw `Could not set Engine Configuration, status: ${engineOutcomeName} error: ${error}`;
            }

            this.Logger.log("Successfully set configuration");

            return {
                engineOutcome,
                engineOutcomeName
            };
        }
        catch (err) {
            this.Logger.log("Could not set engine config, inner error " + err);
            throw err;
        }
    }

    Rebuild(buffer: Buffer, fileType: string): RebuildResponse {
        if (!buffer) {
            throw "Buffer was not defined";
        }

        try {
            const { engineOutcome, protectedFile } =
                this.EngineWrapper.GWMemoryToMemoryProtect(
                    buffer,
                    fileType);

            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                const errorMessage = this.EngineWrapper.GWFileErrorMsg();

                this.Logger.log("Unable to protect file: " + errorMessage);

                return {
                    errorMessage,
                    engineOutcome,
                    engineOutcomeName,
                    protectedFile,
                    protectedFileLength: 0
                };
            }

            this.Logger.log("Successfully rebuilt file.");

            return {
                errorMessage: "",
                engineOutcome,
                engineOutcomeName,
                protectedFile,
                protectedFileLength: protectedFile.length,
            };
        }
        catch (err) {
            this.Logger.log("Error rebuilding file: " + err.toString());
            throw err;
        }
        finally {
            buffer = null;
            fileType = null;
        }
    }

    GetErrorMessage(): string {
        try {
            return this.EngineWrapper.GWFileErrorMsg();
        }
        catch (err) {
            this.Logger.log("Error getting Error from engine: " + err);
            throw err;
        }
    }
}

export default EngineService;