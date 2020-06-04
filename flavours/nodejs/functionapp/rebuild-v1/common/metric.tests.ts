/* eslint-disable @typescript-eslint/no-explicit-any */
/* Third party*/
import "mocha";
import { expect } from "chai";

/** Code in test */
import Metric from "./metric";

describe("metric", () => {
    it("should have correct headers", () => {
        expect(Object.keys(Metric).length).to.equal(14);
        expect(Metric.DetectFileTypeTime).to.equal("gw-metric-detect");
        expect(Metric.Base64DecodeTime).to.equal("gw-metric-decode-base64");
        expect(Metric.FileSize).to.equal("gw-metric-filesize");
        expect(Metric.DownloadTime).to.equal("gw-metric-download");
        expect(Metric.Version).to.equal("gw-version");
        expect(Metric.RebuildTime).to.equal("gw-metric-rebuild");
        expect(Metric.FormFileReadTime).to.equal("gw-metric-formfileread");
        expect(Metric.ProtectedFileSize).to.equal("gw-metric-protectedfilesize");
        expect(Metric.UploadSize).to.equal("gw-metric-uploadsize");
        expect(Metric.UploadTime).to.equal("gw-metric-upload");
        expect(Metric.UploadEtag).to.equal("gw-put-file-etag");
        expect(Metric.FileType).to.equal("gw-file-type");
        expect(Metric.EngineLoadTime).to.equal("gw-engine-load-time");
        expect(Metric.DefaultValue).to.equal("NOT SET");
    });
})