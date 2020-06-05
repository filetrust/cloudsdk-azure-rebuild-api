import Busboy = require("busboy");
import { reject } from "async";

export type multipart = {
    data: Buffer | string;
    fieldName: string;
    fileName?: string;
    encoding?: string;
    mimetype?: string;
};

export const createBusBoy = (headers: { [header: string]: string }): busboy.Busboy => {
    return new Busboy({ headers });
};

// eslint-disable-next-line no-var
export var parseMultiPartForm = (fileBuffer: Buffer, headers: { [header: string]: string }): Promise<multipart[]> => {
    return new Promise((resolve) => {
        const parts: multipart[] = [];
        const busboy = createBusBoy(headers);
        busboy.on("file", (fieldName, file, fileName, encoding, mimetype) => {
            file.on("data", (data) => {
                parts.push({
                    fieldName: fieldName.toLowerCase(),
                    data,
                    encoding,
                    fileName,
                    mimetype
                });
            });
        });

        busboy.on("field", (fieldName, data) => {
            parts.push({
                fieldName: fieldName.toLowerCase(),
                data
            });
        });

        busboy.on("finish", () => {
            resolve(parts);
        });

        busboy.write(fileBuffer);
    });
};