import { RequestWorkflow, RequestWorkflowRequest, RequestWorkflowResponse, ResponseHeaders } from "../../requestWorkflow";
import EngineService, { FileTypeResponse, RebuildResponse } from "../../../business/services/engineService";
import Metric from "../../../common/metric";
import Timer from "../../../common/timer";

class RebuildWorkflowBase implements RequestWorkflow {
    Logger: { log: (message: string) => void };
    Request: RequestWorkflowRequest;
    Response: RequestWorkflowResponse;

    constructor(logger: { log: (message: string) => void }) {
        if (new.target === RebuildWorkflowBase) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }

        this.Logger = logger;
        this.Response = {
            headers: RebuildWorkflowBase.GetDefaultHeaders(),
            statusCode: 200,
            rawBody: ""
        };
    }

    Handle(): Promise<void> {
        throw new TypeError("This method must be overidden");
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

export default RebuildWorkflowBase; 