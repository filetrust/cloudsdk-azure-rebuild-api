import RebuildWorkflowBase from "./abstraction/rebuildWorkflowBase";
import EngineService from "../../business/services/engineService";
import Enum from "../../common/enum";
import FileType from "../../business/engine/enums/fileType";
import EngineOutcome from "../../business/engine/enums/engineOutcome";
import { multipart, parseMultiPartForm } from "../../common/http/multipartHelper";
import Timer from "../../common/timer";
import Metric from "../../common/metric";
import FormFileRequest from "../../common/models/FormFileRequest";
import contentDisposition = require("content-disposition");
import { isError } from "util";

class RebuildFileWorkflow extends RebuildWorkflowBase {
    async Handle(): Promise<void> {
        let engineService: EngineService;
        let payload: FormFileRequest;

        try {
            const multipartForm = await this.tryReadForm();
            payload = new FormFileRequest(multipartForm);
            if (Object.keys(payload.Errors).length) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    errors: payload.Errors
                };
                return;
            }

            engineService = this.loadEngine();

            const fileType = this.detectFileType(engineService, payload.File);

            if (fileType.fileTypeName === Enum.GetString(FileType, FileType.Unknown)) {
                this.handleUnsupportedFileType();
                return;
            }

            engineService.SetConfiguration(payload.ContentManagementFlags);

            const rebuildResponse = this.rebuildFile(engineService, payload.File, fileType);

            if (rebuildResponse.engineOutcome !== EngineOutcome.Success) {
                this.handleEngineFailure(rebuildResponse);
                return;
            }

            this.Response.headers["Content-Disposition"] = contentDisposition(payload.FileName);
            this.Response.headers["Content-Length"] =  rebuildResponse.protectedFile.length;
            this.Response.headers["Content-Type"] = "application/octet-stream";
            this.Response.rawBody = rebuildResponse.protectedFile;
        }
        catch (err) {
            this.handleError(err);
        }
        finally {
            if (engineService) {
                engineService.Dispose();
                engineService = null;
            }

            if (payload)
            {
                payload.Dispose();
                payload = null;
            }
        }
    }
    
    async tryReadForm(): Promise<multipart[]> {
        const timer = Timer.StartNew();

        try {
            const form = await parseMultiPartForm(this.Request.body, this.Request.headers);
            const file = form.find(s => s.fieldName.toLowerCase() === "file");

            if (!file) {
                throw "File could not be found in form";
            }

            if (file.data) {
                this.Response.headers[Metric.FormFileReadTime] = timer.Elapsed();
                this.Response.headers[Metric.FileSize] = file.data.length;

                this.Logger.log("File found in form, file length: '" + file.data.length + "'");
            }
            
            return form;
        }
        catch (err) {
            this.Logger.log(err);
            return null;
        }
    }
}

export default RebuildFileWorkflow; 