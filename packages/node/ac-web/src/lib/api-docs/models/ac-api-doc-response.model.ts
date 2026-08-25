/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcJsonUtils } from "@autocode-ts/autocode";
import { AcApiDocHeader } from "./ac-api-doc-header.model";
import { AcApiDocContent } from "./ac-api-doc-content.model";
import { AcApiDocLink } from "./ac-api-doc-link.model";

export class AcApiDocResponse {
  static readonly KEY_CODE = 'code';
  static readonly KEY_DESCRIPTION = 'description';
  static readonly KEY_HEADERS = 'headers';
  static readonly KEY_CONTENT = 'content';
  static readonly KEY_LINKS = 'links';

  code: number = 0;
  description: string = '';

  headers: Record<string, AcApiDocHeader> = {};

  content: Record<string, AcApiDocContent> = {};

  links: Record<string, AcApiDocLink> = {};

  static instanceFromJson({ jsonData }: { jsonData: Record<string, any> }): AcApiDocResponse {
    const instance = new AcApiDocResponse();
    return instance.fromJson({ jsonData });
  }

  addContent({ content }: { content: AcApiDocContent }): void {
    if (content.encoding && content.encoding.length > 0) {
      this.content[content.encoding] = content;
    } else {
      this.content[Object.keys(this.content).length.toString()] = content;
    }
  }

  fromJson({ jsonData }: { jsonData: Record<string, any> }): this {
    const json = { ...jsonData };

    if (json[AcApiDocResponse.KEY_CONTENT] != undefined) {
      const contentMap = json[AcApiDocResponse.KEY_CONTENT] as Record<string, any>;
      for (const mime in contentMap) {
        this.content[mime] = AcApiDocContent.instanceFromJson({ jsonData: contentMap[mime] });
      }
      delete json[AcApiDocResponse.KEY_CONTENT];
    }

    if (json[AcApiDocResponse.KEY_HEADERS] != undefined) {
      const headersMap = json[AcApiDocResponse.KEY_HEADERS] as Record<string, any>;
      for (const headerName in headersMap) {
        this.headers[headerName] = AcApiDocHeader.instanceFromJson({ jsonData: headersMap[headerName] });
      }
      delete json[AcApiDocResponse.KEY_HEADERS];
    }

    if (json[AcApiDocResponse.KEY_LINKS] != undefined) {
      const linksMap = json[AcApiDocResponse.KEY_LINKS] as Record<string, any>;
      for (const linkName in linksMap) {
        this.links[linkName] = AcApiDocLink.instanceFromJson({ jsonData: linksMap[linkName] });
      }
      delete json[AcApiDocResponse.KEY_LINKS];
    }

    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: json });
    return this;
  }

  toJson(): Record<string, any> {
    const result = AcJsonUtils.getJsonDataFromInstance({ instance: this });
    if (Object.keys(this.content).length > 0) {
      const contentJson: Record<string, any> = {};
      for (const encoding in this.content) {
        contentJson[encoding] = this.content[encoding].toJson();
      }
      result[AcApiDocResponse.KEY_CONTENT] = contentJson;
    }
    return result;
  }

  toString(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }
}
