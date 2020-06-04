import Busboy = require("busboy");

export type multipart = {
    data: Buffer | string;
    fieldName: string;
    fileName?: string;
    encoding?: string;
    mimetype?: string;
};

export var createBusBoy = (headers: { [header: string]: string }): busboy.Busboy => {
    return new Busboy({ headers });
}

// eslint-disable-next-line no-var
export var parseMultiPartForm = (fileBuffer: Buffer, headers: { [header: string]: string }): Promise<multipart[]> => {
    return new Promise((resolve, reject) => {
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
        }).on("field", (fieldName, data) => {
            parts.push({
                fieldName: fieldName.toLowerCase(),
                data
            });
        });

        const success = busboy.write(fileBuffer, cb => {
            if (cb) {
                reject(cb);
            }
        });

        if (success) {
            reject("Could not parse form.");
        }

        resolve(parts);
    });
};