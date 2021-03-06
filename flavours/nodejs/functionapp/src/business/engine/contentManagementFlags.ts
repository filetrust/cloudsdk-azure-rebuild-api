/* eslint-disable @typescript-eslint/camelcase */
import o2x = require("object-to-xml");

const cloudFlagToEngineFlag = (cloudFlag: number): string => {
    if (cloudFlag === 0)
    {
        return "allow";
    }

    if (cloudFlag === 2)
    {
        return "disallow"; 
    }

    if (cloudFlag === 1)
    {
        return "sanitise"; 
    }

    return "sanitise";
};

const valueOrDefault = (flag?: number): string => {
    if (flag === undefined || flag === null)
    {
        return cloudFlagToEngineFlag(1);
    }

    return cloudFlagToEngineFlag(flag);
};

export type EngineConfig = {
    config:
    {
        pdfConfig:
        {
            acroform: string;
            actions_all: string;
            internal_hyperlinks: string;
            external_hyperlinks: string;
            embedded_files: string;
            embedded_images: string;
            javascript: string;
            metadata: string;
            watermark: "";
        };
        pptConfig:
        {
            embedded_files: string;
            embedded_images: string;
            internal_hyperlinks: string;
            external_hyperlinks: string;
            macros: string;
            metadata: string;
            review_comments: string;
        };
        xlsConfig:
        {
            embedded_files: string;
            embedded_images: string;
            internal_hyperlinks: string;
            external_hyperlinks: string;
            macros: string;
            metadata: string;
            review_comments: string;
            dynamic_data_exchange: string;
        };
        wordConfig:
        {
            embedded_files: string;
            embedded_images: string;
            internal_hyperlinks: string;
            external_hyperlinks: string;
            macros: string;
            metadata: string;
            review_comments: string;
            dynamic_data_exchange: string;
        };
    };
};

class ContentManagementFlags {
    Adapt = (xmlSerialiser: (engineConfig: EngineConfig) => string = o2x): string => {
        const engineConfigObj: EngineConfig = {
            config:
            {
                pdfConfig:
                {
                    acroform: valueOrDefault(this.PdfContentManagement.Acroform),
                    actions_all: valueOrDefault(this.PdfContentManagement.ActionsAll),
                    internal_hyperlinks: valueOrDefault(this.PdfContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.PdfContentManagement.ExternalHyperlinks),
                    embedded_files: valueOrDefault(this.PdfContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.PdfContentManagement.EmbeddedImages),
                    javascript: valueOrDefault(this.PdfContentManagement.Javascript),
                    metadata: valueOrDefault(this.PdfContentManagement.Metadata),
                    watermark: ""
                },
                pptConfig:
                {
                    embedded_files: valueOrDefault(this.PowerPointContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.PowerPointContentManagement.EmbeddedImages),
                    internal_hyperlinks: valueOrDefault(this.PowerPointContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.PowerPointContentManagement.ExternalHyperlinks),
                    macros: valueOrDefault(this.PowerPointContentManagement.Macros),
                    metadata: valueOrDefault(this.PowerPointContentManagement.Metadata),
                    review_comments: valueOrDefault(this.PowerPointContentManagement.ReviewComments)
                },
                xlsConfig:
                {
                    embedded_files: valueOrDefault(this.ExcelContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.ExcelContentManagement.EmbeddedImages),
                    internal_hyperlinks: valueOrDefault(this.ExcelContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.ExcelContentManagement.ExternalHyperlinks),
                    macros: valueOrDefault(this.ExcelContentManagement.Macros),
                    metadata: valueOrDefault(this.ExcelContentManagement.Metadata),
                    review_comments: valueOrDefault(this.ExcelContentManagement.ReviewComments),
                    dynamic_data_exchange: valueOrDefault(this.ExcelContentManagement.DynamicDataExchange)
                },
                wordConfig:
                {
                    embedded_files: valueOrDefault(this.WordContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.WordContentManagement.EmbeddedImages),
                    internal_hyperlinks: valueOrDefault(this.WordContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.WordContentManagement.ExternalHyperlinks),
                    macros: valueOrDefault(this.WordContentManagement.Macros),
                    metadata: valueOrDefault(this.WordContentManagement.Metadata),
                    review_comments: valueOrDefault(this.WordContentManagement.ReviewComments),
                    dynamic_data_exchange: valueOrDefault(this.WordContentManagement.DynamicDataExchange)
                }
            }
        };

        return "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + xmlSerialiser(engineConfigObj);
    }

    PdfContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,
        Javascript: 1,
        Acroform: 1,
        ActionsAll: 1
    }

    ExcelContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,
        DynamicDataExchange: 1,
        Macros: 1,
        ReviewComments: 1
    }

    PowerPointContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,
        Macros: 1,
        ReviewComments: 1
    }

    WordContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,
        DynamicDataExchange: 1,
        Macros: 1,
        ReviewComments: 1
    }
}

export default ContentManagementFlags;