import ContentManagementFlags from "../../business/engine/contentManagementFlags";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class UrlRequest {
    Errors: { [key: string]: string };
    InputGetUrl: string;
    OutputPutUrl: string;
    ContentManagementPolicy: ContentManagementFlags;

    constructor(requestBody: any) {
        this.Errors = {};
        let payload = requestBody;

        try {
            if (!requestBody) {
                this.Errors["Body"] = "Not Supplied";
                return;
            }

            if (typeof requestBody == "string")
            {
                payload = JSON.parse(requestBody);                
            }

            if (!payload) {
                this.Errors["Body"] = "Not Supplied";
            }
            else {
                if (!payload.InputGetUrl) {
                    this.Errors["InputGetUrl"] = "Not Supplied";
                }

                if (!payload.OutputPutUrl) {
                    this.Errors["OutputPutUrl"] = "Not Supplied";
                }

                this.InputGetUrl = payload.InputGetUrl;
                this.OutputPutUrl = payload.OutputPutUrl;

                const contentManagementFlags = new ContentManagementFlags();

                if (payload.ContentManagementFlags) {
                    Object.assign(contentManagementFlags, payload.ContentManagementFlags);
                }

                this.ContentManagementPolicy = contentManagementFlags;
            }
        }
        catch (err) {
            this.Errors["body"] = "The request was not a valid JSON.";
        }
    }
}