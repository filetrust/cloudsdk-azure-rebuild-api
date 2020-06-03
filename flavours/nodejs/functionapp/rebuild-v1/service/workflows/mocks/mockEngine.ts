/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import EngineService, { FileTypeResponse, EngineStatusResponse, RebuildResponse } from "../../../business/services/engineService";
import FileType from "../../../business/engine/enums/fileType";
import EngineOutcome from "../../../business/engine/enums/engineOutcome";

export default class MockEngine implements EngineService {
    Sdk: import("../../../business/engine/libGlasswallClassic").default;
    Logger: { log: (message: string) => void };

    DisposeInvocations = [];
    Dispose(...args): void {
        this.DisposeInvocations.push(args);
    }
    
    GetLibraryVersionInvocations = [];
    LibVersion = "1.2.3.4";
    GetLibraryVersion(...args): string {
        this.GetLibraryVersionInvocations.push(args);
        return this.LibVersion;
    }
    
    GetFileTypeInvocations = [];
    FileType: FileTypeResponse = {
        fileType: FileType.Bmp,
        fileTypeName: FileType.Bmp.toString()
    }
    GetFileType(...args): FileTypeResponse {
        this.GetFileTypeInvocations.push(args);
        return this.FileType;
    }
    
    SetConfigurationInvocations = [];
    EngineStatusResponse: EngineStatusResponse = {
        engineOutcome: EngineOutcome.Success,
        engineOutcomeName: EngineOutcome.Success.toString()
    }
    SetConfiguration(...args): EngineStatusResponse {
        this.SetConfigurationInvocations.push(args);
        return this.EngineStatusResponse;
    }
    
    RebuildInvocations = [];
    RebuildResponse: RebuildResponse = {
        engineOutcome: EngineOutcome.Success,
        engineOutcomeName: EngineOutcome.Success.toString()
    }
    Rebuild(...args): RebuildResponse {
        this.RebuildInvocations.push(args);
        return this.RebuildResponse;
    }
    
    GetErrorMessageInvocations = [];
    ErrorMessage = "Some Error";
    GetErrorMessage(...args): string {
        this.GetErrorMessageInvocations.push(args);
        return this.ErrorMessage;
    }
}
