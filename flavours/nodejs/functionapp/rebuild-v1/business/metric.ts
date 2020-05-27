const Metric = {
    DetectFileTypeTime:  "gw-metric-detect",
    Base64DecodeTime:  "gw-metric-decode-base64",
    FileSize:  "gw-metric-filesize",
    DownloadTime:  "gw-metric-download",
    Version:  "gw-version",
    RebuildTime:  "gw-metric-rebuild",
    FormFileReadTime:  "gw-metric-formfileread",
    UploadSize:  "gw-metric-uploadsize",
    UploadTime:  "gw-metric-upload",
    UploadEtag:  "gw-put-file-etag",
    FileType:  "gw-file-type",  
    EngineLoadTime: "gw-engine-load-time",
    
    StartHeapUsed:     "gw-memory-heap-used-at-start",
    StartHeapTotal:    "gw-memory-heap-total-used-at-start",
    StartRSS:          "gw-memory-rss-used-at-start",
    StartExternal:     "gw-memory-external-used-at-start",
    StartArrayBuffers: "gw-memory-array-buffers-used-at-start",

    EndHeapUsed:     "gw-memory-heap-used-at-end",
    EndHeapTotal:    "gw-memory-heap-total-used-at-end",
    EndRSS:          "gw-memory-rss-used-at-end",
    EndExternal:     "gw-memory-external-used-at-end",
    EndArrayBuffers: "gw-memory-array-buffers-used-at-end",
    
    DefaultValue:  "NOT SET"
};

export default Metric;