import {
  AcWebController,
  AcWebRoute,
  AcWebValueFromBody,
  AcWebValueFromHeader,
  AcWebApiResponse,
  AcWebRequest,
} from '@autocode-ts/ac-web';
import { AcExceptionReportItem } from '../models/ac-exception-report-item.model';
import { AcExceptionBatchRequest } from '../models/ac-exception-batch-request.model';
import { AcExceptorIngestionService } from '../services/ac-exceptor-ingestion.service';
import { AcExceptorServer } from '../../ac-exceptor-server';

@AcWebController()
@AcWebRoute({ path: '/api/v1/exceptions' })
export class AcExceptorIngestController {
  private _ingestionService?: AcExceptorIngestionService;

  constructor(service?: AcExceptorIngestionService) {
    if (service) {
      this._ingestionService = service;
    }
  }

  private get ingestionService(): AcExceptorIngestionService {
    if (this._ingestionService) {
      return this._ingestionService;
    }
    if (AcExceptorServer.ingestionService) {
      return AcExceptorServer.ingestionService;
    }
    throw new Error('AcExceptorServer has not been initialized. Call AcExceptorServer.initialize() first.');
  }

  /**
   * Ingests a single exception occurrence report.
   * Extracts client IP and User-Agent from headers if not provided in the payload.
   */
  @AcWebRoute({ path: '/report', method: 'post' })
  async report(
    @AcWebValueFromBody() body: any,
    @AcWebValueFromHeader('x-forwarded-for') xForwardedFor?: string,
    @AcWebValueFromHeader('user-agent') userAgentHeader?: string,
    request?: AcWebRequest
  ): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const payload = body?.item ? body.item : body;
      const reportItem =
        payload instanceof AcExceptionReportItem
          ? payload
          : AcExceptionReportItem.instanceFromJson({ jsonData: payload || {} });

      // Automatically extract client IP from headers if not provided
      const clientIp =
        reportItem.ipAddress ||
        (xForwardedFor ? xForwardedFor.split(',')[0].trim() : '') ||
        request?.headers?.['x-forwarded-for'] ||
        '';

      const userAgent =
        reportItem.userAgent ||
        userAgentHeader ||
        request?.headers?.['user-agent'] ||
        '';

      const result = await this.ingestionService.ingestException({
        item: reportItem,
        defaultIpAddress: clientIp,
        defaultUserAgent: userAgent,
      });

      const responseData = {
        success: true,
        exceptionId: result.exceptionId,
        occurrenceId: result.occurrenceId,
      };

      response.data = responseData;
      response.value = responseData;
      response.setSuccess({ message: 'Exception reported successfully' });
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }

  /**
   * Ingests a batch of offline/queued exceptions sent by mobile/desktop clients.
   */
  @AcWebRoute({ path: '/batch', method: 'post' })
  async batch(
    @AcWebValueFromBody() body: any,
    @AcWebValueFromHeader('x-forwarded-for') xForwardedFor?: string,
    @AcWebValueFromHeader('user-agent') userAgentHeader?: string,
    request?: AcWebRequest
  ): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const batchRequest =
        body instanceof AcExceptionBatchRequest
          ? body
          : AcExceptionBatchRequest.instanceFromJson({ jsonData: body });

      const clientIp =
        (xForwardedFor ? xForwardedFor.split(',')[0].trim() : '') ||
        request?.headers?.['x-forwarded-for'] ||
        '';

      const userAgent =
        userAgentHeader ||
        request?.headers?.['user-agent'] ||
        '';

      const result = await this.ingestionService.ingestBatch({
        batch: batchRequest,
        defaultIpAddress: clientIp,
        defaultUserAgent: userAgent,
      });

      const responseData = {
        success: true,
        processedCount: result.processedCount,
        results: result.results,
      };

      response.data = responseData;
      response.value = responseData;
      response.setSuccess({ message: `Successfully processed ${result.processedCount} exceptions` });
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }
}
