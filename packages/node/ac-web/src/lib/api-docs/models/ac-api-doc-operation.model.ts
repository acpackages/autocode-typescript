/* eslint-disable no-prototype-builtins */

import { AcBindJsonProperty, AcJsonUtils } from "@autocode-ts/autocode";
import { AcApiDocParameter } from "./ac-api-doc-parameter.model";
import { AcApiDocResponse } from "./ac-api-doc-response.model";

export class AcApiDocOperation {
  static readonly KEY_DESCRIPTION = "description";
  static readonly KeyParameters = "parameters";
  static readonly KEY_RESPONSES = "responses";
  static readonly KEY_SUMMARY = "summary";

  summary?: string;
  description?: string;

  @AcBindJsonProperty({ key: AcApiDocOperation.KeyParameters, arrayType: AcApiDocParameter })
  parameters: AcApiDocParameter[] = [];

  responses: Record<string, AcApiDocResponse> = {};

  static instanceFromJson({ jsonData }: { jsonData: Record<string, any> }): AcApiDocOperation {
    const instance = new AcApiDocOperation();
    return instance.fromJson({ jsonData });
  }

  fromJson({ jsonData }: { jsonData: Record<string, any> }): this {
    const json = { ...jsonData };

    if (json[AcApiDocOperation.KEY_RESPONSES] != undefined) {
      const responsesMap: Record<string, AcApiDocResponse> = {};
      const responsesJson = json[AcApiDocOperation.KEY_RESPONSES];
      if (responsesJson && typeof responsesJson === 'object') {
        for (const status in responsesJson) {
          if (responsesJson[status] != undefined) {
            responsesMap[status] = AcApiDocResponse.instanceFromJson({ jsonData: responsesJson[status] });
          }
        }
      }
      this.responses = responsesMap;
      delete json[AcApiDocOperation.KEY_RESPONSES];
    }

    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData: json });
    return this;
  }

  toJson(): Record<string, any> {
    const json: Record<string, any> = {};

    if (this.summary !== undefined) {
      json[AcApiDocOperation.KEY_SUMMARY] = this.summary;
    }

    if (this.description !== undefined) {
      json[AcApiDocOperation.KEY_DESCRIPTION] = this.description;
    }

    if (this.parameters.length > 0) {
      json[AcApiDocOperation.KeyParameters] = this.parameters.map(param => param.toJson());
    }

    if (Object.keys(this.responses).length > 0) {
      const respJson: Record<string, any> = {};
      for (const status in this.responses) {
        if (this.responses[status] != undefined) {
          respJson[status] = this.responses[status].toJson();
        }
      }
      json[AcApiDocOperation.KEY_RESPONSES] = respJson;
    }

    return json;
  }

  toString(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }
}
