/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-prototype-builtins */
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { from, Observable } from "rxjs";
import { AcEnumHttpMethod } from "../enums/ac-enum-http-method.enum";
import { Autocode } from "./autocode";
import { blobToBase64 } from '@autocode-ts/ac-extensions';
import { AcEnumHttpResponseCode } from "../enums/ac-enum-http-response-code.enum";

export interface IAcHttpUploadProgressEvent {
  loaded: number;
  total?: number;
  /** Upload completion percentage (0–100), or undefined when total is unknown */
  percentage?: number;
}

export interface IAcHttpRequest {
  url:string,
  queryParams?: { [key: string]: string | number },
  data?:any,
  formData?:FormData
  headers?: { [key: string]: string }
  /** Called periodically with upload progress while sending FormData/file payloads */
  onUploadProgress?: (event: IAcHttpUploadProgressEvent) => void;
}

export interface IAcHttpResponse {
  data?:any,
  status:AcEnumHttpResponseCode,
  details?:any,
}

export class AcHttp {
  baseUrl: string = '';
  requestInterceptor?: ( request: IAcHttpRequest) => IAcHttpRequest;

  private axiosInstance = axios.create();

  convertObjectToFormData({
    formData,
    data,
    parentKey,
  }: {
    formData: FormData;
    data: any;
    parentKey?: string;
  }): void {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const formKey = parentKey ? `${parentKey}[${key}]` : key;
        const isFileType = data[key] instanceof File || data[key] instanceof Blob;
        if (typeof data[key] === 'object' && !isFileType && data[key] !== null) {
          if (Object.keys(data[key]).length > 0) {
            this.convertObjectToFormData({ formData, data: data[key], parentKey: formKey });
          } else {
            formData.append(formKey, '');
          }
        } else {
          formData.append(formKey, Autocode.validValue({ value: data[key] }) ? data[key] : '');
        }
      }
    }
  }

  private async doAxios({
    request,
    method,
  }: {
    request: IAcHttpRequest;
    method: AcEnumHttpMethod;
  }): Promise<IAcHttpResponse> {
    const response: IAcHttpResponse = {
      status: AcEnumHttpResponseCode.Unknown,
    };
    if (this.requestInterceptor) {
      request = this.requestInterceptor( request );
    }
    request = this.processRequestParams( request );

    const config: AxiosRequestConfig = {
      url: request.url,
      method: method.toLowerCase() as any,
      headers: request.headers,
      data: method === AcEnumHttpMethod.Get || method === AcEnumHttpMethod.Delete ? undefined : request.formData,
      onUploadProgress: request.onUploadProgress
        ? (progressEvent: any) => {
            const total = progressEvent.total as number | undefined;
            request.onUploadProgress!({
              loaded: progressEvent.loaded as number,
              total,
              percentage: total ? Math.round((progressEvent.loaded * 100) / total) : undefined,
            });
          }
        : undefined,
    };

    try {
      const axiosResponse: AxiosResponse = await this.axiosInstance(config);
      response.status = axiosResponse.status;
      response.data = axiosResponse.data;
    } catch (err: any) {
      response.status = AcEnumHttpResponseCode.Error;
      response.details = err;
    }
    return response;
  }

  // ========= Observable wrappers =========
  requestObservable({
    request,
    method = AcEnumHttpMethod.Get,
  }: {
    request: IAcHttpRequest;
    method?: AcEnumHttpMethod;
  }): Observable<IAcHttpResponse> {
    return from(this.doAxios({ request, method }));
  }

  getObservable( request: IAcHttpRequest): Observable<IAcHttpResponse> {
    return this.requestObservable({ request, method: AcEnumHttpMethod.Get });
  }

  postObservable( request: IAcHttpRequest): Observable<IAcHttpResponse> {
    return this.requestObservable({ request, method: AcEnumHttpMethod.Post });
  }

  putObservable( request: IAcHttpRequest): Observable<IAcHttpResponse> {
    return this.requestObservable({ request, method: AcEnumHttpMethod.Put });
  }

  deleteObservable( request: IAcHttpRequest): Observable<IAcHttpResponse> {
    return this.requestObservable({ request, method: AcEnumHttpMethod.Delete });
  }

  // ========= Promise wrappers =========
  requestPromise({
    request,
    method = AcEnumHttpMethod.Get,
  }: {
    request: IAcHttpRequest;
    method?: AcEnumHttpMethod;
  }): Promise<IAcHttpResponse> {
    return this.doAxios({ request, method });
  }

  getPromise( request: IAcHttpRequest): Promise<IAcHttpResponse> {
    return this.requestPromise({ request, method: AcEnumHttpMethod.Get });
  }

  postPromise( request: IAcHttpRequest): Promise<IAcHttpResponse> {
    return this.requestPromise({ request, method: AcEnumHttpMethod.Post });
  }

  putPromise( request: IAcHttpRequest): Promise<IAcHttpResponse> {
    return this.requestPromise({ request, method: AcEnumHttpMethod.Put });
  }

  deletePromise( request: IAcHttpRequest): Promise<IAcHttpResponse> {
    return this.requestPromise({ request, method: AcEnumHttpMethod.Delete });
  }

  // ========= Utilities =========
  private processRequestParams( request: IAcHttpRequest): IAcHttpRequest {
    const params: IAcHttpRequest = { ...request };

    // Query params
    if (params.queryParams) {
      const queryParams: string[] = [];
      Object.keys(params.queryParams).forEach((key) => {
        queryParams.push(key + '=' + params.queryParams![key]);
      });

      if (queryParams.length > 0) {
        if (params.url.indexOf('?') < 0) {
          params.url += '?';
        }
        params.url += queryParams.join('&');
      }
    }

    // Convert data → FormData
    if (params.data) {
      if (params.formData == undefined || params.formData == null) {
        params.formData = new FormData();
      }
      this.convertObjectToFormData({ formData: params.formData, data: params.data });
    }

    // Prefix base URL
    if (this.baseUrl !== '') {
      if (params.url.indexOf('http') !== 0) {
        params.url = this.baseUrl + params.url;
      }
    }

    return params;
  }

  async getFileContentAsBase64FromUrl({ url }: { url: string }) {
    try {
      const response = await this.axiosInstance.get(url, {
        responseType: 'blob',
      });
      return await blobToBase64(response.data);
    } catch (error) {
      console.error('Error fetching file from URL:', error);
      throw error;
    }
  }
}

