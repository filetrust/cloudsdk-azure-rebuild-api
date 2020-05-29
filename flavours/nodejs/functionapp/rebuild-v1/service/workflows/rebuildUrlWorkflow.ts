import { RequestWorkflow, RequestWorkflowRequest, RequestWorkflowResponse, ResponseHeaders } from "../requestWorkflow";
import { downloadFile, uploadFile } from "../../common/http/httpFileOperations";
import EngineService, { FileTypeResponse, RebuildResponse } from "../../business/services/engineService";
import Metric from "../../common/metric";
import Enum from "../../common/enum";
import FileType from "../../business/engine/enums/fileType";
import EngineOutcome from "../../business/engine/enums/engineOutcome";
import Timer from "../../common/timer";
import UrlRequest from "../../common/models/UrlRequest";

class RebuildUrlWorkflow implements RequestWorkflow {
    Logger: { log: (message: string) => void };
    Request: RequestWorkflowRequest;
    Response: RequestWorkflowResponse;

    constructor(logger: { log: (message: string) => void }) {
        this.Logger = logger;

        this.Response = {
            headers: RebuildUrlWorkflow.GetDefaultHeaders(),
            statusCode: 200,
            rawBody: ""
        };
    }

    async Handle(): Promise<void> {
        let engineService: EngineService;

        try {
            const payload = new UrlRequest(this.Request.rawBody);

            if (Object.keys(payload.Errors).length) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    error: payload.Errors
                };
                return;
            }

            const fileBuffer = await this.tryDownload(payload);

            if (!fileBuffer) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    error: "Could not download input file"
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

            engineService.SetConfiguration(payload.ContentManagementPolicy);

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

            if (!await this.tryPut(payload, rebuildResponse.protectedFile))
            {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    error: "Could not upload rebuilt file."
                };
            }
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
        }
    }

    loadEngine(): EngineService {
        const timer = Timer.StartNew();
        const engineService = new EngineService(this.Logger);
        const version = engineService.GetLibraryVersion();

        this.Response.headers[Metric.EngineLoadTime] = timer.Elapsed();
        this.Response.headers[Metric.Version] = version;

        this.Logger.log("Engine loaded, version: '" + version + "'");

        return engineService;
    }

    detectFileType(engineService: EngineService, fileBuffer: Buffer): FileTypeResponse {
        const timer = Timer.StartNew();
        const fileType = engineService.GetFileType(fileBuffer);

        this.Response.headers[Metric.DetectFileTypeTime] = timer.Elapsed();
        this.Response.headers[Metric.FileType] = fileType.fileTypeName;

        this.Logger.log("File Type detected as: '" + fileType.fileTypeName + "'");

        return fileType;
    }

    rebuildFile(engineService: EngineService, fileBuffer: Buffer, fileType: FileTypeResponse): RebuildResponse {
        const timer = Timer.StartNew();
        const rebuildResponse = engineService.Rebuild(fileBuffer, fileType.fileTypeName);

        this.Response.headers[Metric.RebuildTime] = timer.Elapsed();
        this.Response.headers[Metric.ProtectedFileSize] = rebuildResponse.protectedFileLength;

        this.Logger.log("Output file length: '" + rebuildResponse.protectedFileLength + "'");

        return rebuildResponse;
    }

    async tryDownload(payload: UrlRequest): Promise<Buffer> {
        const timer = Timer.StartNew();
        let fileBuffer: Buffer;

        try {
            fileBuffer = await downloadFile(payload.InputGetUrl);

            if (fileBuffer && fileBuffer.length) {
                this.Response.headers[Metric.DownloadTime] = timer.Elapsed();
                this.Response.headers[Metric.FileSize] = fileBuffer.length;
                
                this.Logger.log("File downloaded, file length: '" + fileBuffer.length + "'");
            } else {
                throw "File did not contain any data";
            }
        }
        catch (err) {
            this.Logger.log("Could not download input file: " + err.stack);
        }

        return fileBuffer;
    }

    async tryPut(payload: UrlRequest, protectedFile: Buffer): Promise<boolean> {
        const timer = Timer.StartNew();
        let etag: string;

        try {
            etag = await uploadFile(payload.OutputPutUrl, protectedFile);
            this.Response.headers[Metric.UploadEtag] = etag;
            this.Response.headers[Metric.UploadTime] = timer.Elapsed();
            this.Response.headers[Metric.UploadSize] = protectedFile.length;
            return true;
        }
        catch (err) {
            this.Logger.log("Could not upload protected file. " + err.stack);
        }

        return false;
    }

    static GetDefaultHeaders(): ResponseHeaders {
        const headers: ResponseHeaders = {};
        headers[Metric.DetectFileTypeTime] = Metric.DefaultValue;
        headers[Metric.Base64DecodeTime] = Metric.DefaultValue;
        headers[Metric.FileSize] = Metric.DefaultValue;
        headers[Metric.DownloadTime] = Metric.DefaultValue;
        headers[Metric.Version] = Metric.DefaultValue;
        headers[Metric.RebuildTime] = Metric.DefaultValue;
        headers[Metric.FormFileReadTime] = Metric.DefaultValue;
        headers[Metric.UploadSize] = Metric.DefaultValue;
        headers[Metric.UploadTime] = Metric.DefaultValue;
        headers[Metric.UploadEtag] = Metric.DefaultValue;
        headers[Metric.FileType] = Metric.DefaultValue;
        headers[Metric.EngineLoadTime] = Metric.DefaultValue;
        headers[Metric.ProtectedFileSize] = Metric.DefaultValue;
        headers["Content-Type"] = "application/json";
        return headers;
    }
}

export default RebuildUrlWorkflow; 