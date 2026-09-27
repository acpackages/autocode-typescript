import { AcEnumApiDocAssetSource } from '../enums/ac-enum-api-doc-asset-source.enum';
import { AcEnumApiDocRenderer } from '../enums/ac-enum-api-doc-renderer.enum';

export class AcApiDocUiOptions {
  enabled: boolean = true;
  urlPath: string = '/docs';
  jsonPath: string = '/docs/openapi.json';
  swaggerJsonPath: string = '/swagger/swagger.json';
  title: string = 'API Documentation';
  renderer: AcEnumApiDocRenderer = AcEnumApiDocRenderer.Scalar;
  source: AcEnumApiDocAssetSource = AcEnumApiDocAssetSource.Cdn;
  cdnVersion?: string;
  directoryPath?: string;
  files?: Record<string, string>;
  theme: string = 'auto';
  customCss?: string;

  constructor(args?: {
    enabled?: boolean;
    urlPath?: string;
    jsonPath?: string;
    swaggerJsonPath?: string;
    title?: string;
    renderer?: AcEnumApiDocRenderer;
    source?: AcEnumApiDocAssetSource;
    cdnVersion?: string;
    directoryPath?: string;
    files?: Record<string, string>;
    theme?: string;
    customCss?: string;
  }) {
    if (args) {
      if (args.enabled !== undefined) this.enabled = args.enabled;
      if (args.urlPath !== undefined) this.urlPath = args.urlPath;
      if (args.jsonPath !== undefined) this.jsonPath = args.jsonPath;
      if (args.swaggerJsonPath !== undefined) this.swaggerJsonPath = args.swaggerJsonPath;
      if (args.title !== undefined) this.title = args.title;
      if (args.renderer !== undefined) this.renderer = args.renderer;
      if (args.source !== undefined) this.source = args.source;
      if (args.cdnVersion !== undefined) this.cdnVersion = args.cdnVersion;
      if (args.directoryPath !== undefined) this.directoryPath = args.directoryPath;
      if (args.files !== undefined) this.files = args.files;
      if (args.theme !== undefined) this.theme = args.theme;
      if (args.customCss !== undefined) this.customCss = args.customCss;
    }
  }
}
