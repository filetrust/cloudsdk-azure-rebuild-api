import fetch from "node-fetch";

export default class HttpFileOperations {
    static downloadFile = async (fileUrl: string): Promise<Buffer> => {
        const response = await fetch(fileUrl, {
            method: "GET"
        });

        if (!response.ok) {
            throw response.statusText;
        }

        return response.buffer();
    };

    static uploadFile = async (fileUrl: string, headers: { [header: string]: string }, buf: Buffer): Promise<string> => {
        const response = await fetch(fileUrl, {
            method: "PUT",
            body: buf,
            headers
        });

        if (!response.ok) {
            throw response.statusText;
        }

        const etag = response.headers.get("etag");

        if (!etag) {
            return "\"\"";
        }

        return etag;
    };
}