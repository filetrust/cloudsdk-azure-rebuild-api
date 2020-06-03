import { RequestWorkflowRequest, ResponseHeaders, RequestWorkflowBase } from "./requestWorkflow";
import EngineService, { FileTypeResponse, RebuildResponse } from "../../../business/services/engineService";
import Metric from "../../../common/metric";
import Timer from "../../../common/timer";
import EngineServiceFactory from "../../../business/services/engineServiceFactory";
import { isError } from "util";

class RebuildWorkflowBase extends RequestWorkflowBase {
    constructor(logger: { log: (message: string) => void }, request: RequestWorkflowRequest) {
        super(logger, request);
        
        if (new.target === RebuildWorkflowBase) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }

        this.Response.statusCode = 200;
        this.Response.headers = RebuildWorkflowBase.GetDefaultHeaders();
    }

    Handle(): Promise<void> {
        throw new TypeError("This method must be overidden");
    }

    loadEngine(): EngineService {
        const timer = Timer.StartNew();
        const engineService = EngineServiceFactory.Create(this.Logger);
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
        if (rebuildResponse.protectedFileLength) {
            this.Response.headers[Metric.ProtectedFileSize] = rebuildResponse.protectedFileLength;
        }
        else {
            this.Response.headers[Metric.ProtectedFileSize] = 0;
        }

        this.Logger.log("Output file length: '" + rebuildResponse.protectedFileLength + "'");

        return rebuildResponse;
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
    
    handleEngineFailure(rebuildResponse: RebuildResponse): void {
        if (rebuildResponse.errorMessage && rebuildResponse.errorMessage.toLowerCase().includes("disallow")) {
            this.Response.statusCode = 200;
        }
        else {
            this.Response.statusCode = 422;
        }

        this.Response.rawBody = {
            error: rebuildResponse.errorMessage,
            engineOutcome: rebuildResponse.engineOutcome,
            engineOutcomeName: rebuildResponse.engineOutcomeName,
            engineError: rebuildResponse.errorMessage
        };
    }

    handleUnsupportedFileType(): void {
        this.Response.statusCode = 422;
        this.Response.rawBody = {
            error: "File Type could not be determined to be a supported type"
        };
    }
    
    handleError(err: Error|string): void {
        this.Response.statusCode = 500;
        if (isError(err)) {
            this.Logger.log(err.message + err.stack);
        }
        else {
            this.Logger.log(err);
        }
    }
}

export default RebuildWorkflowBase; 