export interface IDailyTrendItem {
  date: string;
  count: number;
}

export class AcExceptionSummary {
  totalExceptions: number = 0;
  totalOccurrences: number = 0;
  unresolvedCount: number = 0;
  topExceptions: any[] = [];
  dailyTrends: IDailyTrendItem[] = [];
  crashFreeSessionRate: number = 100;

  static instanceFromJson({ jsonData }: { jsonData: any }): AcExceptionSummary {
    const summary = new AcExceptionSummary();
    if (!jsonData || typeof jsonData !== 'object') return summary;

    summary.totalExceptions = Number(jsonData.totalExceptions) || 0;
    summary.totalOccurrences = Number(jsonData.totalOccurrences) || 0;
    summary.unresolvedCount = Number(jsonData.unresolvedCount) || 0;
    summary.topExceptions = Array.isArray(jsonData.topExceptions) ? jsonData.topExceptions : [];
    summary.dailyTrends = Array.isArray(jsonData.dailyTrends) ? jsonData.dailyTrends : [];
    summary.crashFreeSessionRate = typeof jsonData.crashFreeSessionRate === 'number' ? jsonData.crashFreeSessionRate : 100;

    return summary;
  }
}
