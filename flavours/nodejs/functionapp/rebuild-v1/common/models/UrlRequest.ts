import RequestModelBase from "./RequestModelBase";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class UrlRequest extends RequestModelBase {
    InputGetUrl: string;
    OutputPutUrl: string;

    constructor(requestBody: any) {
        super();

        if (!requestBody) {
            this.setModelError("Body", "Not Supplied");
            return;
        }

        let payload = requestBody;
        if (typeof requestBody == "string") {
            payload = JSON.parse(requestBody);
        }

        if (!payload) {
            this.setModelError("Body", "Not Supplied.");
        }
        else {
            if (!payload.InputGetUrl) {
                this.setModelError("InputGetUrl", "Not Supplied.");
            }

            if (!payload.OutputPutUrl) {
                this.setModelError("OutputPutUrl", "Not Supplied.");
            }

            if (Object.keys(this.Errors).length)
            {
                return;
            }

            this.InputGetUrl = payload.InputGetUrl;
            this.OutputPutUrl = payload.OutputPutUrl;
            this.loadCmp(payload.ContentManagementFlags);
        }
    }
}