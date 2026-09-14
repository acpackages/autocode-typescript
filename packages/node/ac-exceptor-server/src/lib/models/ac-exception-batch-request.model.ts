import { AcExceptionReportItem } from './ac-exception-report-item.model';

export class AcExceptionBatchRequest {
  exceptions: AcExceptionReportItem[] = [];

  static instanceFromJson({ jsonData }: { jsonData: any }): AcExceptionBatchRequest {
    const batch = new AcExceptionBatchRequest();
    let list: any[] = [];
    if (Array.isArray(jsonData)) {
      list = jsonData;
    } else if (Array.isArray(jsonData?.exceptions)) {
      list = jsonData.exceptions;
    } else if (Array.isArray(jsonData?.items)) {
      list = jsonData.items;
    } else if (Array.isArray(jsonData?.reports)) {
      list = jsonData.reports;
    }

    batch.exceptions = list.map((item) =>
      item instanceof AcExceptionReportItem ? item : AcExceptionReportItem.instanceFromJson({ jsonData: item })
    );
    return batch;
  }
}
