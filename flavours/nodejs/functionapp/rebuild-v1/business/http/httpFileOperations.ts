import fetch from "node-fetch";

export const downloadFile = async (fileUrl: string): Promise<Buffer> => {
    const response = await fetch(fileUrl, {
        method: "GET"
    });

    if (!response.ok)
    {
        throw response.statusText;
    }

    return response.buffer();
};

export const uploadFile = async (fileUrl: string, buf: Buffer): Promise<string> => {
    const response = await fetch(fileUrl, {
        method: "PUT",
        body: buf
    });

    if (!response.ok)
    {
        throw response.statusText;
    }

    return response.headers.get("etag");
};