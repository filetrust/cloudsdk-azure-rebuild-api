import RequestModelBase from "./RequestModelBase";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Base64Request extends RequestModelBase {
    Base64: string;

    constructor(requestBody: any) {
        super();

        let payload = requestBody;

        if (!requestBody) {
            this.setModelError("Body", "Not Supplied");
            return;
        }

        if (typeof requestBody == "string") {
            payload = JSON.parse(requestBody);
        }

        if (!payload) {
            this.setModelError("Body", "Not Supplied");
            return;
        }

        if (!payload.Base64) {
            this.setModelError("Base64", "Not Supplied");
        }

        this.Base64 = payload.Base64;
        this.loadCmp(payload.ContentManagementFlags);
    }

    Dispose(): void {
        this.Base64 = null;
    }
}