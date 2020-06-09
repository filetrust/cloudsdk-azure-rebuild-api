import Enum from "../../common/enum";
import FileType from "../engine/enums/fileType";
import EngineOutcome from "../engine/enums/engineOutcome";
import LibGlasswallClassic from "../engine/libGlasswallClassic";
import ContentManagementFlags from "../engine/contentManagementFlags";
import { ArgumentNullException, ArgumentException } from "../../common/errors/errors";

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
    Sdk: LibGlasswallClassic;
    Logger: { log: (message: string) => void };

    constructor(logger: { log: (message: string) => void }) {
        this.Logger = logger;
        this.Sdk = new LibGlasswallClassic(
            process.cwd() + (process.platform == "win32" ?
                "\\dist\\lib\\windows\\SDK\\glasswall.classic.dll"
                : "/dist/lib/linux/SDK/libglasswall.classic.so"));
    }

    Dispose(): void {
        this.Sdk.Dispose();
        this.Sdk = null;
        this.Logger = null;
    }

    GetLibraryVersion(): string {
        try {
            return this.Sdk.GWFileVersion();
        }
        catch (err) {
            this.Logger.log(err);
            return "Error Retrieving";
        }
    }

    GetFileType(buffer: Buffer): FileTypeResponse {
        if (!buffer) {
            throw new ArgumentNullException("buffer");
        }

        if (!buffer.length) {
            throw new ArgumentException("buffer", "Buffer cannot be empty.");
        }

        try {
            const fileType = this.Sdk.GWDetermineFileTypeFromFileInMem(buffer);
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
        if (!contentManagementFlags) {
            throw new ArgumentNullException("contentManagementFlags");
        }

        try {
            const xmlConfig = contentManagementFlags.Adapt();
            const engineOutcome = this.Sdk.GWFileConfigXML(xmlConfig);
            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                const error = this.Sdk.GWFileErrorMsg();
                throw `Could not set Engine Configuration, status: ${engineOutcomeName} error: ${error}`;
            }
            else {
                this.Logger.log("Successfully set configuration");
            }

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
            throw new ArgumentNullException("buffer");
        }

        if (!buffer.length) {
            throw new ArgumentException("buffer", "Buffer cannot be empty.");
        }

        if (!fileType) {
            throw new ArgumentNullException("fileType");
        }

        try {
            const { engineOutcome, protectedFile } =
                this.Sdk.GWMemoryToMemoryProtect(
                    buffer,
                    fileType);

            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                const errorMessage = this.Sdk.GWFileErrorMsg();

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
                protectedFileLength: protectedFile?.length,
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
            return this.Sdk.GWFileErrorMsg();
        }
        catch (err) {
            this.Logger.log("Error getting Error from engine: " + err.toString());
            throw err;
        }
    }
}

export default EngineService;