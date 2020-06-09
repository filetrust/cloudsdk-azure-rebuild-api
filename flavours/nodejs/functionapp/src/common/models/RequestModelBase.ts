/* eslint-disable @typescript-eslint/no-explicit-any */
import ContentManagementFlags from "../../business/engine/contentManagementFlags";

export default class RebuildWorkflowBase {
    Errors: { [key: string]: string };
    ContentManagementFlags: ContentManagementFlags;

    constructor() {
        this.Errors = {};
    }

    setModelError(key: string, error: string): void {
        this.Errors[key] = error;
    }

    loadCmp(cmpDeserialised: any): void {
        const contentManagementFlags = new ContentManagementFlags();

        if (!cmpDeserialised) {
            this.ContentManagementFlags = contentManagementFlags;
            return;
        }

        const checkSection = (section: string, actualSection: any, expectedSection: any): void => {
            if (!actualSection) {
                // optional section
                return;
            }

            Object.keys(actualSection).forEach(key => {
                if (!Object.keys(expectedSection).includes(key)) {
                    this.Errors[section] = "Unexpected item found in policy: " + key;
                }
            });
        };

        checkSection("ContentManagementPolicy", cmpDeserialised, contentManagementFlags);
        checkSection("PdfContentManagement", cmpDeserialised.PdfContentManagement, contentManagementFlags.PdfContentManagement);
        checkSection("ExcelContentManagement", cmpDeserialised.ExcelContentManagement, contentManagementFlags.ExcelContentManagement);
        checkSection("PowerPointContentManagement", cmpDeserialised.PowerPointContentManagement, contentManagementFlags.PowerPointContentManagement);
        checkSection("WordContentManagement", cmpDeserialised.WordContentManagement, contentManagementFlags.WordContentManagement);
        Object.assign(contentManagementFlags, cmpDeserialised);

        this.ContentManagementFlags = contentManagementFlags;
    }
}