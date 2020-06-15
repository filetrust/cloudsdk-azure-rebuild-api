import RequestModelBase from "./RequestModelBase";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class UrlRequest extends RequestModelBase {
    InputGetUrl: string;
    OutputPutUrl: string;
    OutputPutUrlRequestHeaders: { [header: string]: string }

    constructor(payload: any) {
        super();

        if (!payload) {
            this.setModelError("Body", "Not Supplied");
            return;
        }

        if (!(payload.InputGetUrl && payload.InputGetUrl.length)) {
            this.setModelError("InputGetUrl", "Not Supplied");
        }

        if (!(payload.OutputPutUrl && payload.OutputPutUrl.length)) {
            this.setModelError("OutputPutUrl", "Not Supplied");
        }

        if (Object.keys(this.Errors).length) {
            return;
        }

        this.InputGetUrl = payload.InputGetUrl;
        this.OutputPutUrl = payload.OutputPutUrl;
        this.OutputPutUrlRequestHeaders = payload.OutputPutUrlRequestHeaders;
        this.loadCmp(payload.ContentManagementFlags);
    }
}