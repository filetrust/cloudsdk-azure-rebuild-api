import HttpFileOperations from "../../../common/http/httpFileOperations";

export default class MockHttpFileOperations implements HttpFileOperations {
    static downloadFileInvocations = [];
    static downloadFileBuffer: Buffer;
    static downloadFile = async (...args): Promise<Buffer> => {
        MockHttpFileOperations.downloadFileInvocations.push(args);
        return MockHttpFileOperations.downloadFileBuffer;
    };

    static uploadFileInvocations = [];
    static etag: string;
    static uploadFile = async (...args): Promise<string> => {
        MockHttpFileOperations.uploadFileInvocations.push(args);
        return MockHttpFileOperations.etag;
    };
}