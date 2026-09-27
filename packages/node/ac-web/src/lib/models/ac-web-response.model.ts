/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcBindJsonProperty, AcEnumHttpResponseCode, AcJsonUtils } from "@autocode-ts/autocode";
import { AcEnumWebResponseType } from "../enums/ac-enum-web-response-type.enum";


export class AcWebResponse {
  static readonly KEY_COOKIES = 'cookies';
  static readonly KEY_CONTENT = 'content';
  static readonly KEY_HEADERS = 'headers';
  static readonly KEY_RESPONSE_CODE = 'responseCode';
  static readonly KEY_RESPONSE_TYPE = 'responseType';
  static readonly KEY_SESSION = 'session';

  cookies: Record<string, any> = {};
  content: any;

  headers: Record<string, any> = {};

  @AcBindJsonProperty({ key: AcWebResponse.KEY_RESPONSE_CODE })
  responseCode: number = 0;

  @AcBindJsonProperty({ key: AcWebResponse.KEY_RESPONSE_TYPE })
  responseType: string = AcEnumWebResponseType.Text;

  session: Record<string, any> = {};

  static internalError(params: { data?: any; responseCode?: number }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.InternalServerError;
    response.content = params.data;
    return response;
  }

  static json(params: { data: any; responseCode?: number }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.Ok;
    response.responseType = AcEnumWebResponseType.Json;
    response.content = params.data;
    response.headers['Content-Type'] = 'application/json';
    return response;
  }

  static html(params: { html: string; responseCode?: number }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.Ok;
    response.responseType = AcEnumWebResponseType.Html;
    response.content = params.html;
    response.headers['Content-Type'] = 'text/html; charset=utf-8';
    return response;
  }

  static notFound(): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = AcEnumHttpResponseCode.NotFound;
    return response;
  }

  static raw(params: { content: any; responseCode?: number; headers?: Record<string, any> }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.Ok;
    response.responseType = AcEnumWebResponseType.Raw;
    response.content = params.content;
    response.headers = params.headers ?? {};
    return response;
  }

  static redirect(params: { url: string; responseCode?: number }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.TemporaryRedirect;
    response.responseType = AcEnumWebResponseType.Redirect;
    response.content = params.url;
    return response;
  }

  static download(params: { content: any; filename: string; responseCode?: number }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.Ok;
    response.responseType = AcEnumWebResponseType.Download;
    response.content = params.content;
    response.headers['Content-Disposition'] = `attachment; filename="${params.filename}"`;
    response.headers['Content-Type'] = 'application/octet-stream';
    return response;
  }

  static view(params: { template: string; responseCode?: number }): AcWebResponse {
    const response = new AcWebResponse();
    response.responseCode = params.responseCode ?? AcEnumHttpResponseCode.Ok;
    response.responseType = AcEnumWebResponseType.View;
    response.content = `<html><body>View: ${params.template}</body></html>`;
    response.headers['Content-Type'] = 'text/html';
    return response;
  }

  fromJson(jsonData: Record<string, any>): this {
    AcJsonUtils.setInstancePropertiesFromJsonData({ instance: this, jsonData });
    return this;
  }

  toJson(): Record<string, any> {
    return AcJsonUtils.getJsonDataFromInstance({ instance: this });
  }

  toString(): string {
    return JSON.stringify(this.toJson(), null, 2);
  }
}
