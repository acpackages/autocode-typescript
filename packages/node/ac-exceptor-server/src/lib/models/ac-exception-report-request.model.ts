import { AcExceptionReportItem } from './ac-exception-report-item.model';

export class AcExceptionReportRequest {
  item: AcExceptionReportItem = new AcExceptionReportItem();

  static instanceFromJson({ jsonData }: { jsonData: any }): AcExceptionReportRequest {
    const request = new AcExceptionReportRequest();
    if (jsonData?.item) {
      request.item = AcExceptionReportItem.instanceFromJson({ jsonData: jsonData.item });
    } else if (jsonData) {
      request.item = AcExceptionReportItem.instanceFromJson({ jsonData });
    }
    return request;
  }
}
