import RebuildWorkflowBase from "./abstraction/rebuildWorkflowBase";
import EngineService from "../../business/services/engineService";
import Enum from "../../common/enum";
import FileType from "../../business/engine/enums/fileType";
import EngineOutcome from "../../business/engine/enums/engineOutcome";
import UrlRequest from "../../common/models/UrlRequest";
import HttpFileOperations from "../../common/http/httpFileOperations";
import Metric from "../../common/metric";
import Timer from "../../common/timer";

class RebuildUrlWorkflow extends RebuildWorkflowBase {
    async Handle(): Promise<void> {
        let engineService: EngineService;

        try {
            const payload = new UrlRequest(this.Request.body);

            if (Object.keys(payload.Errors).length) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    errors: payload.Errors
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
                this.handleUnsupportedFileType();
                return;
            }

            engineService.SetConfiguration(payload.ContentManagementFlags);

            const rebuildResponse = this.rebuildFile(engineService, fileBuffer, fileType);

            if (rebuildResponse.engineOutcome !== EngineOutcome.Success) {
                this.handleEngineFailure(rebuildResponse);
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
            this.handleError(err);
        }
        finally {
            if (engineService)
            {
                engineService.Dispose();
                engineService = null;
            }
        }
    }

    async tryDownload(payload: UrlRequest): Promise<Buffer> {
        const timer = Timer.StartNew();
        let fileBuffer: Buffer;

        try {
            fileBuffer = await HttpFileOperations.downloadFile(payload.InputGetUrl);

            if (fileBuffer) {
                this.Response.headers[Metric.DownloadTime] = timer.Elapsed();
                this.Response.headers[Metric.FileSize] = fileBuffer.length;

                this.Logger.log("File downloaded, file length: '" + fileBuffer.length + "'");
            } 
        }
        catch (err) {
            this.Logger.log("Could not download input file: " + err);
        }

        return fileBuffer;
    }

    async tryPut(payload: UrlRequest, protectedFile: Buffer): Promise<boolean> {
        const timer = Timer.StartNew();
        let etag: string;

        try {
            etag = await HttpFileOperations.uploadFile(payload.OutputPutUrl, protectedFile);
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
}

export default RebuildUrlWorkflow; 