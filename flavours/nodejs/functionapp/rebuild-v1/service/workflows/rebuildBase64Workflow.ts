import RebuildWorkflowBase from "./abstraction/rebuildWorkflowBase";
import EngineService from "../../business/services/engineService";
import Enum from "../../common/enum";
import FileType from "../../business/engine/enums/fileType";
import EngineOutcome from "../../business/engine/enums/engineOutcome";
import Base64Request from "../../common/models/Base64Request";
import Timer from "../../common/timer";
import Metric from "../../common/metric";

class RebuildBase64Workflow extends RebuildWorkflowBase {
    constructor(logger: { log: (message: string) => void }) {
        super(logger);
    }

    async Handle(): Promise<void> {
        let engineService: EngineService;
        let payload: Base64Request;

        try {
            payload = new Base64Request(this.Request.body);

            if (Object.keys(payload.Errors).length) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    error: payload.Errors
                };
                return;
            }

            const fileBuffer = await this.tryParseBase64(payload.Base64);

            if (!fileBuffer) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    error: "Could not parse input file"
                };
                return;
            }

            engineService = this.loadEngine();

            const fileType = this.detectFileType(engineService, fileBuffer);

            if (fileType.fileTypeName === Enum.GetString(FileType, FileType.Unknown)) {
                this.Response.statusCode = 422;
                this.Response.rawBody = {
                    errors: {
                        "File Type Detection": "File Type could not be determined to be a supported type"
                    }
                };

                return;
            }

            engineService.SetConfiguration(payload.ContentManagementFlags);

            const rebuildResponse = this.rebuildFile(engineService, fileBuffer, fileType);

            if (rebuildResponse.engineOutcome !== EngineOutcome.Success) {
                if (rebuildResponse.errorMessage && rebuildResponse.errorMessage.toLowerCase().includes("disallow")) {
                    this.Response.statusCode = 200;
                }
                else {
                    this.Response.statusCode = 422;
                }

                this.Response.rawBody = {
                    errorMessage: "File could not be determined to be a supported file",
                    engineOutcome: rebuildResponse.engineOutcome,
                    engineOutcomeName: rebuildResponse.engineOutcomeName,
                    engineError: rebuildResponse.errorMessage
                };

                return;
            }

            const base64 = rebuildResponse.protectedFile.toString("base64");
            this.Response.headers["Content-Length"] =  base64.length.toString();
            this.Response.headers["Content-Type"] =  "text/plain";
            this.Response.rawBody = base64;
        }
        catch (err) {
            this.Response.statusCode = 500;
            this.Response.rawBody = {
                error: err
            };
        }
        finally {
            if (engineService)
            {
                engineService.Dispose();
                engineService = null;
            }

            payload.Dispose();
            payload = null;
        }
    }
    
    async tryParseBase64(base64: string): Promise<Buffer> {
        const timer = Timer.StartNew();
        let fileBuffer: Buffer;

        try {
            fileBuffer = Buffer.from(base64, "base64");

            if (fileBuffer && fileBuffer.length) {
                this.Response.headers[Metric.Base64DecodeTime] = timer.Elapsed();
                this.Response.headers[Metric.FileSize] = fileBuffer.length;

                this.Logger.log("File decoded from Base64, file length: '" + fileBuffer.length + "'");
            } else {
                throw "File did not contain any data";
            }
        }
        catch (err) {
            this.Logger.log("Could not download input file: " + err.stack);
        }

        return fileBuffer;
    }
}

export default RebuildBase64Workflow; 