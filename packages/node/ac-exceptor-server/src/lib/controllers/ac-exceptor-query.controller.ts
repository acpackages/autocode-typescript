import {
  AcWebController,
  AcWebRoute,
  AcWebValueFromBody,
  AcWebValueFromQuery,
  AcWebValueFromPath,
  AcWebApiResponse,
} from '@autocode-ts/ac-web';
import { AcExceptionQueryFilter } from '../models/ac-exception-query-filter.model';
import { AcExceptorQueryService } from '../services/ac-exceptor-query.service';
import { AcExceptorServer } from '../../ac-exceptor-server';

@AcWebController()
@AcWebRoute({ path: '/api/v1/exceptions' })
export class AcExceptorQueryController {
  private _queryService?: AcExceptorQueryService;

  constructor(service?: AcExceptorQueryService) {
    if (service) {
      this._queryService = service;
    }
  }

  private get queryService(): AcExceptorQueryService {
    if (this._queryService) {
      return this._queryService;
    }
    if (AcExceptorServer.queryService) {
      return AcExceptorServer.queryService;
    }
    throw new Error('AcExceptorServer has not been initialized. Call AcExceptorServer.initialize() first.');
  }

  /**
   * Return aggregated analytics, top 10 errors, daily crash histogram, and crash-free session estimates.
   * Defined before /{id} to ensure proper route matching precedence.
   */
  @AcWebRoute({ path: '/stats/summary', method: 'get' })
  async getSummaryStats(
    @AcWebValueFromQuery('appId') appId?: string,
    @AcWebValueFromQuery('environment') environment?: string
  ): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const summary = await this.queryService.getSummaryStats({
        appId,
        environment,
      });

      response.data = summary;
      response.value = summary;
      response.setSuccess();
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }

  /**
   * Query grouped exceptions with pagination and filters.
   */
  @AcWebRoute({ path: '', method: 'get' })
  async listExceptions(
    @AcWebValueFromQuery('page') page?: any,
    @AcWebValueFromQuery('pageSize') pageSize?: any,
    @AcWebValueFromQuery('appId') appId?: string,
    @AcWebValueFromQuery('environment') environment?: string,
    @AcWebValueFromQuery('status') status?: string,
    @AcWebValueFromQuery('severity') severity?: string,
    @AcWebValueFromQuery('search') search?: string,
    @AcWebValueFromQuery('sortBy') sortBy?: string,
    @AcWebValueFromQuery('sortOrder') sortOrder?: string
  ): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const filter = AcExceptionQueryFilter.instanceFromJson({
        jsonData: {
          page,
          pageSize,
          appId,
          environment,
          status,
          severity,
          search,
          sortBy,
          sortOrder,
        },
      });

      const result = await this.queryService.listExceptions(filter);
      response.data = result;
      response.value = result;
      response.setSuccess();
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }

  /**
   * Get occurrences for a grouped exception.
   */
  @AcWebRoute({ path: '/{id}/occurrences', method: 'get' })
  async getOccurrences(
    @AcWebValueFromPath('id') id: any,
    @AcWebValueFromQuery('page') page?: any,
    @AcWebValueFromQuery('pageSize') pageSize?: any,
    @AcWebValueFromQuery('deviceId') deviceId?: string
  ): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const exceptionId = Number(id);
      if (isNaN(exceptionId)) {
        throw new Error(`Invalid exception id: ${id}`);
      }

      const result = await this.queryService.listOccurrences({
        exceptionId,
        deviceId,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
      });

      response.data = result;
      response.value = result;
      response.setSuccess();
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }

  /**
   * Update triage status (e.g. open, investigating, resolved, ignored).
   */
  @AcWebRoute({ path: '/{id}/status', method: 'patch' })
  async updateStatus(
    @AcWebValueFromPath('id') id: any,
    @AcWebValueFromBody('status') bodyStatus?: string,
    @AcWebValueFromBody() body?: any
  ): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const exceptionId = Number(id);
      if (isNaN(exceptionId)) {
        throw new Error(`Invalid exception id: ${id}`);
      }

      const newStatus = bodyStatus || body?.status;
      if (!newStatus) {
        throw new Error('Status is required in request body');
      }

      const result = await this.queryService.updateExceptionStatus({
        id: exceptionId,
        status: newStatus,
      });

      response.data = result;
      response.value = result;
      response.setSuccess({ message: `Status updated to ${result.status}` });
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }

  /**
   * Get grouped exception details by ID.
   */
  @AcWebRoute({ path: '/{id}', method: 'get' })
  async getExceptionById(@AcWebValueFromPath('id') id: any): Promise<AcWebApiResponse> {
    const response = new AcWebApiResponse();
    try {
      const exceptionId = Number(id);
      if (isNaN(exceptionId)) {
        throw new Error(`Invalid exception id: ${id}`);
      }

      const details = await this.queryService.getExceptionById(exceptionId);
      if (!details) {
        response.setFailure({ message: `Exception with id ${id} not found` });
        response.data = null;
        return response;
      }

      response.data = details;
      response.value = details;
      response.setSuccess();
    } catch (error: any) {
      response.setException({ exception: error });
      response.data = { success: false, error: error.message };
    }
    return response;
  }
}
