import { RequestHandler, requestHandlerReturnType, requestHandlerArgs } from "../requestHandler";
import { downloadFile, uploadFile } from "../business/http/httpFileOperations";
import EngineService, { FileTypeResponse, RebuildResponse } from "../business/engineWrapper/engineService";
import Metric from "../business/metric";
import Enum from "../business/enum";
import FileType from "../business/fileType";
import EngineOutcome from "../business/engineWrapper/engineOutcome";
import Timer from "../business/timer";
import UrlRequest from "./models/UrlRequest";

const tryDownload = async (payload: UrlRequest): Promise<{ fileBuffer?: Buffer; fileDownloadErrors?: { [key: string]: string }; elapsed: string }> => {
    const timer = Timer.StartNew();
    const fileDownloadErrors = {};
    let fileBuffer: Buffer;

    try {
        fileBuffer = await downloadFile(payload.InputGetUrl);

        if (!fileBuffer || !fileBuffer.length) {
            fileDownloadErrors["InputGetUrl"] = "The file provided had no data";
        }
    }
    catch (err) {
        this.Logger.log(err);
        fileDownloadErrors["InputGetUrl"] = "Could not download input file.";
    }

    return { fileBuffer, fileDownloadErrors, elapsed: timer.Elapsed() };
};

const tryPut = async (payload: UrlRequest, protectedFile: Buffer): Promise<{ etag?: string; fileUploadErrors?: { [key: string]: string }; putTime: string }> => {
    const timer = Timer.StartNew();
    const fileUploadErrors = {};
    let etag: string;

    try {
        etag = await uploadFile(payload.OutputPutUrl, protectedFile);
    }
    catch (err) {
        this.Logger.log(err);
        fileUploadErrors["OutputPutUrl"] = "Could not upload protected file.";
    }

    return { etag, fileUploadErrors, putTime: timer.Elapsed() };
};


const getResponseHeaders = (args: requestHandlerArgs): { [header: string]: string } => {
    args.headers[Metric.DetectFileTypeTime] = Metric.DefaultValue;
    args.headers[Metric.Base64DecodeTime] = Metric.DefaultValue;
    args.headers[Metric.FileSize] = Metric.DefaultValue;
    args.headers[Metric.DownloadTime] = Metric.DefaultValue;
    args.headers[Metric.Version] = Metric.DefaultValue;
    args.headers[Metric.RebuildTime] = Metric.DefaultValue;
    args.headers[Metric.FormFileReadTime] = Metric.DefaultValue;
    args.headers[Metric.UploadSize] = Metric.DefaultValue;
    args.headers[Metric.UploadTime] = Metric.DefaultValue;
    args.headers[Metric.UploadEtag] = Metric.DefaultValue;
    args.headers[Metric.FileType] = Metric.DefaultValue;
    args.headers[Metric.EngineLoadTime] = Metric.DefaultValue;
    return args.headers;
};

const loadEngine = (): { engineService: EngineService; version: string; engineLoadTime: string } => {
    const timer = Timer.StartNew();
    const engineService = new EngineService(this.Logger);
    const version = engineService.GetLibraryVersion();

    return {
        engineService,
        engineLoadTime: timer.Elapsed(),
        version
    };
};

const detectFileType = (engineService: EngineService, fileBuffer: Buffer): { fileTypeDetectionTime: string; fileType: FileTypeResponse } => {
    const timer = Timer.StartNew();
    const fileType = engineService.GetFileType(fileBuffer);

    return {
        fileTypeDetectionTime: timer.Elapsed(),
        fileType
    };
};

const rebuildFile = (engineService: EngineService, fileBuffer: Buffer, fileType: FileTypeResponse): { rebuildTime: string; rebuildResponse: RebuildResponse } => {
    const timer = Timer.StartNew();
    const rebuildResponse = engineService.Rebuild(fileBuffer, fileType.fileTypeName);

    return {
        rebuildTime: timer.Elapsed(),
        rebuildResponse
    };
};

class RebuildUrlRequestHandler implements RequestHandler {
    Logger: { log: (message: string) => void };
    Timer: Timer;

    constructor(logger: { log: (message: string) => void }) {
        this.Logger = logger;
        this.Timer = Timer.StartNew();
    }

    async Handle(args: requestHandlerArgs): Promise<requestHandlerReturnType> {
        const payload = new UrlRequest(args.rawBody);
        const responseHeaders = getResponseHeaders(args);

        if (Object.keys(payload.Errors).length) {
            return {
                headers: responseHeaders,
                rawBody: payload.Errors,
                statusCode: 400
            };
        }

        const { fileBuffer, fileDownloadErrors } = await tryDownload(payload);

        if (Object.keys(fileDownloadErrors).length) {
            return {
                headers: responseHeaders,
                rawBody: fileDownloadErrors,
                statusCode: 400
            };
        }

        const engineLoadResponse = loadEngine();

        try {
            responseHeaders[Metric.EngineLoadTime] = engineLoadResponse.engineLoadTime;
            responseHeaders[Metric.Version] = engineLoadResponse.version;

            const { fileTypeDetectionTime, fileType } = detectFileType(engineLoadResponse.engineService, fileBuffer);
            responseHeaders[Metric.DetectFileTypeTime] = fileTypeDetectionTime;
            responseHeaders[Metric.FileType] = fileType.fileTypeName;

            if (fileType.fileTypeName === Enum.GetString(FileType, FileType.Unknown)) {
                return {
                    headers: responseHeaders,
                    rawBody: {
                        errors: {
                            "File Type Detection": "File Type could not be determined to be a supported type"
                        }
                    },
                    statusCode: 422
                };
            }

            engineLoadResponse.engineService.SetConfiguration(payload.ContentManagementPolicy);

            const { rebuildResponse, rebuildTime } = rebuildFile(engineLoadResponse.engineService, fileBuffer, fileType);
            responseHeaders[Metric.RebuildTime] = rebuildTime;

            if (!rebuildResponse || rebuildResponse.engineOutcome !== EngineOutcome.Success) {
                let statusCode = 422;
                if (rebuildResponse.errorMessage && rebuildResponse.errorMessage.toLowerCase().includes("disallow")) {
                    statusCode = 200;
                }

                return {
                    headers: responseHeaders,
                    statusCode,
                    rawBody: {
                        errorMessage: "File could not be determined to be a supported file",
                        engineOutcome: rebuildResponse.engineOutcome,
                        engineOutcomeName: rebuildResponse.engineOutcomeName,
                        engineError: rebuildResponse.errorMessage
                    }
                };
            }

            responseHeaders[Metric.UploadSize] = rebuildResponse.protectedFile.length.toString();
            this.Logger.log("Output file length: '" + rebuildResponse.protectedFile.length + "'");

            const { etag, putTime, fileUploadErrors } = await tryPut(payload, rebuildResponse.protectedFile);

            if (fileUploadErrors) {
                return {
                    statusCode: 400,
                    headers: responseHeaders,
                    rawBody: fileUploadErrors
                };
            }

            responseHeaders[Metric.UploadTime] = putTime;
            responseHeaders[Metric.UploadEtag] = etag;

            return {
                statusCode: 200,
                headers: responseHeaders,
                rawBody: ""
            };
        }
        finally {
            engineLoadResponse.engineService.Finalise();
            engineLoadResponse.engineService = null;
        }
    }
}

export default RebuildUrlRequestHandler;