export class AcExceptionQueryFilter {
  page: number = 1;
  pageSize: number = 20;
  appId?: string;
  environment?: string;
  status?: string;
  severity?: string;
  isHandled?: boolean | number;
  search?: string;
  sortBy: string = 'last_occurred_at';
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  static instanceFromJson({ jsonData }: { jsonData: any }): AcExceptionQueryFilter {
    const filter = new AcExceptionQueryFilter();
    if (!jsonData || typeof jsonData !== 'object') return filter;

    if (jsonData.page !== undefined) filter.page = Math.max(1, Number(jsonData.page) || 1);
    if (jsonData.pageSize !== undefined) filter.pageSize = Math.max(1, Number(jsonData.pageSize) || 20);
    if (jsonData.appId !== undefined) filter.appId = String(jsonData.appId);
    if (jsonData.app_id !== undefined) filter.appId = String(jsonData.app_id);
    if (jsonData.environment !== undefined) filter.environment = String(jsonData.environment);
    if (jsonData.status !== undefined) filter.status = String(jsonData.status);
    if (jsonData.severity !== undefined) filter.severity = String(jsonData.severity);
    if (jsonData.isHandled !== undefined) filter.isHandled = jsonData.isHandled;
    if (jsonData.is_handled !== undefined) filter.isHandled = jsonData.is_handled;
    if (jsonData.search !== undefined) filter.search = String(jsonData.search);
    if (jsonData.sortBy !== undefined) filter.sortBy = String(jsonData.sortBy);
    if (jsonData.sortOrder !== undefined) filter.sortOrder = String(jsonData.sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return filter;
  }
}
