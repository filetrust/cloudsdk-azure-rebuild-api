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

class RebuildFileWorkflow extends RebuildWorkflowBase {
    constructor(logger: { log: (message: string) => void }) {
        super(logger);
    }

    async Handle(): Promise<void> {
        let engineService: EngineService;
        const multipartForm = await this.tryReadForm();
        let payload: FormFileRequest;

        try {
            payload = new FormFileRequest(multipartForm);
            if (Object.keys(payload.Errors).length) {
                this.Response.statusCode = 400;
                this.Response.rawBody = {
                    error: payload.Errors
                };
                return;
            }

            engineService = this.loadEngine();

            const fileType = this.detectFileType(engineService, payload.File);

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

            const rebuildResponse = this.rebuildFile(engineService, payload.File, fileType);

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

            this.Response.headers["Content-Disposition"] = contentDisposition(payload.FileName);
            this.Response.headers["Content-Length"] =  rebuildResponse.protectedFile.length.toString();
            this.Response.headers["Content-Type"] = "application/octet-stream";
            this.Response.rawBody = rebuildResponse.protectedFile;
        }
        catch (err) {
            this.Response.statusCode = 500;
            this.Response.rawBody = {
                error: err.toString()
            };
        }
        finally {
            if (engineService) {
                engineService.Dispose();
                engineService = null;
            }

            payload.Dispose();
            payload = null;
        }
    }
    
    async tryReadForm(): Promise<multipart[]> {
        const timer = Timer.StartNew();

        try {
            const form = await parseMultiPartForm(this.Request.body, this.Request.headers);

            this.Response.headers[Metric.FormFileReadTime] = timer.Elapsed();

            const file = form.find(s => s.fieldName.toLowerCase() === "file");

            if (!file) {
                throw "File could not be found in form";
            }

            if (file.data && file.data.length) {
                this.Response.headers[Metric.Base64DecodeTime] = timer.Elapsed();
                this.Response.headers[Metric.FileSize] = file.data.length;

                this.Logger.log("File found in form, file length: '" + file.data.length + "'");
            } else {
                throw "File did not contain any data";
            }

            this.Response.headers[Metric.FileSize] = file.data.length;

            return form;
        }
        catch (err) {
            this.Logger.log(err);
            return null;
        }
    }
}

export default RebuildFileWorkflow; 