import { multipart } from "../http/multipartHelper";
import RequestModelBase from "./RequestModelBase";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class FormFileRequest extends RequestModelBase {
    File: Buffer;
    FileName: string;

    constructor(form: multipart[]) {
        super();
        
        if (!form)
        {
            this.setModelError("Form", "Could not read the supplied form.");
            return;
        }

        const filePart = form.find(s => s.fieldName === "file");
        const cmpPart = form.find(s => s.fieldName === "contentmanagementflags");

        if (!filePart) {
            this.setModelError("File", "Not Supplied");
            return;
        }
        else
        if (!filePart.data || !filePart.data.length) {
            this.setModelError("File", "File does not have any data");
            return;
        }

        if (Object.keys(this.Errors).length)
        {
            return;
        }

        this.File = filePart.data as Buffer;
        this.FileName = filePart.fileName;
        this.loadCmp(JSON.parse(cmpPart.data as string));
    }

    Dispose(): void {
        this.File = null;
        this.Errors = null;
    }
}