/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcJsonUtils } from "@autocode-ts/autocode";
import { AcApiDocContent } from "./ac-api-doc-content.model";

export class AcApiDocRequestBody {
  static readonly KEY_DESCRIPTION = 'description';
  static readonly KEY_CONTENT = 'content';
  static readonly KEY_REQUIRED = 'required';

  description?: string = '';

  content: Record<string, AcApiDocContent> = {};

  required: boolean = false;

  static instanceFromJson({ jsonData }: { jsonData: Record<string, any> }): AcApiDocRequestBody {
    const instance = new AcApiDocRequestBody();
    return instance.fromJson({ jsonData });
  }

  fromJson({ jsonData }: { jsonData: Record<string, any> }): this {
    const json = { ...jsonData };
    if (json[AcApiDocRequestBody.KEY_CONTENT] != undefined) {
      const contentMap = json[AcApiDocRequestBody.KEY_CONTENT] as Record<string, any>;
      for (const mime in contentMap) {
        this.content[mime] = AcApiDocContent.instanceFromJson({ jsonData: contentMap[mime] });
      }
      delete json[AcApiDocRequestBody.KEY_CONTENT];
    }
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: json });
    return this;
  }

  addContent({ content }: { content: AcApiDocContent }): void {
    if (content.encoding && content.encoding.length > 0) {
      this.content[content.encoding] = content;
    } else {
      this.content[Object.keys(this.content).length.toString()] = content;
    }
  }

  toJson(): Record<string, any> {
    const result: Record<string, any> = {};

    if (this.description && this.description.length > 0) {
      result[AcApiDocRequestBody.KEY_DESCRIPTION] = this.description;
    }
    if (this.required) {
      result[AcApiDocRequestBody.KEY_REQUIRED] = this.required;
    }
    if (Object.keys(this.content).length > 0) {
      const contentJson: Record<string, any> = {};
      for (const encoding in this.content) {
        contentJson[encoding] = this.content[encoding].toJson();
      }
      result[AcApiDocRequestBody.KEY_CONTENT] = contentJson;
    }
    return result;
  }

  toString(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }
}
