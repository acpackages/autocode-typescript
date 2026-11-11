import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";
import { IReportFormatDefinition, IReportFormatScenario, REPORT_FORMATS } from "./format-test-templates";

@AcElement({
  selector: 'format-test-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-light overflow-hidden">
      <app-header
        [title]="'AcReport : Format Test & Multi-Page Engine'"
        [dropdownItems]="dropdownItems"
      ></app-header>

      <div class="flex-fill d-flex overflow-hidden">
        <!-- Left Sidebar: Format Selection & Controls -->
        <div class="sidebar-panel bg-white border-end d-flex flex-column shadow-sm" style="width: 380px; min-width: 340px; z-index: 10;">
          <div class="p-3 border-bottom bg-light">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h6 class="fw-bold mb-0 text-dark">
                <i class="fa-solid fa-file-invoice text-primary me-2"></i>Report Formats
              </h6>
              <span class="badge bg-primary rounded-pill">{{formats.length}} available</span>
            </div>
            <small class="text-muted">Select a template to render and process in the preview iframe.</small>
          </div>

          <div class="flex-fill overflow-auto p-3">
            <!-- Format List -->
            <label class="form-label small fw-bold text-uppercase text-muted mb-2">Available Templates</label>
            <div class="list-group mb-3 shadow-sm">
              <button
                *for="let fmt of formats"
                type="button"
                class="list-group-item list-group-item-action p-3"
                [class.active]="selectedFormat.id === fmt.id"
                (click)="selectFormat(fmt)"
              >
                <div class="d-flex w-100 justify-content-between align-items-start mb-1">
                  <h6 class="mb-0 fw-bold" [class.text-white]="selectedFormat.id === fmt.id">{{fmt.name}}</h6>
                  <span class="badge" [class.bg-white]="selectedFormat.id === fmt.id" [class.text-primary]="selectedFormat.id === fmt.id" [class.bg-secondary]="selectedFormat.id !== fmt.id">
                    {{fmt.badge}}
                  </span>
                </div>
                <p class="mb-1 small" [class.text-white-50]="selectedFormat.id === fmt.id" [class.text-muted]="selectedFormat.id !== fmt.id">
                  {{fmt.description}}
                </p>
                <small class="text-uppercase" style="font-size: 10px; letter-spacing: 0.5px;" [class.text-white-50]="selectedFormat.id === fmt.id" [class.text-muted]="selectedFormat.id !== fmt.id">
                  Category: {{fmt.category}}
                </small>
              </button>
            </div>

            <!-- Scenario / Preset Selector -->
            <div class="card mb-3 border-0 bg-light">
              <div class="card-body p-3">
                <label class="form-label small fw-bold mb-2">
                  <i class="fa-solid fa-sliders text-primary me-1"></i> Data Scenario / Preset
                </label>
                <select class="form-select form-select-sm" [(acModel)]="selectedScenarioIndex" (change)="onScenarioChange()">
                  <option *for="let sc of selectedFormat.scenarios; index as i" [value]="i">{{sc.label}}</option>
                </select>
              </div>
            </div>

            <!-- Actions Panel -->
            <div class="d-grid gap-2 mb-3">
              <button class="btn btn-primary btn-sm fw-semibold shadow-sm" (click)="renderActiveFormat()">
                <i class="fa-solid fa-arrows-rotate me-2"></i> Process & Render Report
              </button>
              <button class="btn btn-outline-dark btn-sm fw-semibold" (click)="printReport()">
                <i class="fa-solid fa-print me-2"></i> Print Preview Frame
              </button>
            </div>

            <!-- Report Status Card -->
            <div class="card border-0 bg-light shadow-sm mb-3">
              <div class="card-body p-3">
                <h6 class="fw-bold mb-2 small text-uppercase text-muted">Execution Metrics</h6>
                <div class="d-flex justify-content-between py-1 border-bottom small">
                  <span class="text-muted">Pages Generated:</span>
                  <span class="badge bg-success fs-7">{{totalPages}} Pages</span>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom small">
                  <span class="text-muted">Template ID:</span>
                  <span class="fw-mono text-dark">{{selectedFormat.id}}</span>
                </div>
                <div class="d-flex justify-content-between py-1 border-bottom small">
                  <span class="text-muted">Render Time:</span>
                  <span class="fw-semibold text-primary">{{renderTimeMs}} ms</span>
                </div>
                <div class="d-flex justify-content-between pt-1 small">
                  <span class="text-muted">Status:</span>
                  <span class="text-success fw-bold"><i class="fa-solid fa-circle-check me-1"></i> {{statusMessage}}</span>
                </div>
              </div>
            </div>

            <!-- Collapsible Data Editor -->
            <div class="card border-0 bg-light shadow-sm mb-3">
              <div class="card-header bg-transparent border-0 p-3 pb-0 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0 small text-uppercase text-muted">
                  <i class="fa-solid fa-code me-1 text-primary"></i> Data (JSON)
                </h6>
                <button class="btn btn-link btn-sm p-0 text-decoration-none" (click)="toggleDataEditor()">
                  {{showDataEditor ? 'Hide' : 'Edit'}}
                </button>
              </div>
              <div class="card-body p-3 pt-2" *if="showDataEditor">
                <textarea
                  class="form-control font-monospace small"
                  rows="9"
                  style="font-size: 11px;"
                  [(acModel)]="liveJsonData"
                ></textarea>
                <button class="btn btn-outline-primary btn-sm w-100 mt-2" (click)="applyCustomData()">
                  Apply JSON Data & Re-render
                </button>
              </div>
            </div>

            <!-- Collapsible HTML Template Editor -->
            <div class="card border-0 bg-light shadow-sm mb-3">
              <div class="card-header bg-transparent border-0 p-3 pb-0 d-flex justify-content-between align-items-center">
                <h6 class="fw-bold mb-0 small text-uppercase text-muted">
                  <i class="fa-solid fa-code-compare me-1 text-primary"></i> Template (HTML)
                </h6>
                <button class="btn btn-link btn-sm p-0 text-decoration-none" (click)="toggleHtmlEditor()">
                  {{showHtmlEditor ? 'Hide' : 'Edit'}}
                </button>
              </div>
              <div class="card-body p-3 pt-2" *if="showHtmlEditor">
                <textarea
                  class="form-control font-monospace small"
                  rows="9"
                  style="font-size: 11px;"
                  [(acModel)]="liveHtmlTemplate"
                ></textarea>
                <button class="btn btn-outline-primary btn-sm w-100 mt-2" (click)="applyCustomHtml()">
                  Apply Template HTML & Re-render
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Right Side: Iframe Report Canvas Preview -->
        <div class="flex-fill d-flex flex-column bg-secondary bg-opacity-75 overflow-hidden">
          <!-- Canvas Toolbar -->
          <div class="bg-dark text-white px-4 py-2 d-flex justify-content-between align-items-center shadow-sm" style="min-height: 48px;">
            <div class="d-flex align-items-center gap-3">
              <span class="fw-bold fs-6">
                <i class="fa-solid fa-eye me-2 text-info"></i>{{selectedFormat.name}}
              </span>
              <span class="badge bg-primary">{{totalPages}} Pages Rendered</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-light" title="Print this preview" (click)="printReport()">
                <i class="fa-solid fa-print me-1"></i> Print
              </button>
              <button class="btn btn-sm btn-outline-info" title="Refresh & re-process" (click)="renderActiveFormat()">
                <i class="fa-solid fa-arrows-rotate me-1"></i> Refresh
              </button>
            </div>
          </div>

          <!-- Iframe Container -->
          <div class="flex-fill position-relative overflow-hidden p-2 d-flex justify-content-center align-items-stretch" style="background-color: #525659;">
            <iframe
              #frame
              class="w-100 h-100 shadow rounded"
              style="border: none; background-color: #525659;"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .sidebar-panel {
      transition: width 0.2s ease-in-out;
    }
    .list-group-item.active {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    .fs-7 {
      font-size: 0.85rem;
    }
    .fw-mono {
      font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 11px;
    }
  `
})
export class FormatTestPage {
  @AcViewChild('#frame') frame!: HTMLIFrameElement;

  formats: IReportFormatDefinition[] = REPORT_FORMATS;
  selectedFormat: IReportFormatDefinition = REPORT_FORMATS[0];
  selectedScenarioIndex: number = 0;

  report!: AcReport;
  totalPages: number = 0;
  renderTimeMs: number = 0;
  statusMessage: string = 'Ready';

  showDataEditor: boolean = false;
  showHtmlEditor: boolean = false;
  liveJsonData: string = '';
  liveHtmlTemplate: string = '';

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Process Report', callback: () => this.renderActiveFormat() },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.selectFormat(this.formats[0]);
  }

  selectFormat(format: IReportFormatDefinition) {
    this.selectedFormat = format;
    this.selectedScenarioIndex = 0;
    this.liveHtmlTemplate = format.html;
    this.syncLiveDataJson();
    // Allow DOM to stabilize then render
    setTimeout(() => {
      this.renderActiveFormat();
    }, 50);
  }

  onScenarioChange() {
    this.syncLiveDataJson();
    this.renderActiveFormat();
  }

  syncLiveDataJson() {
    const scenario = this.selectedFormat.scenarios[this.selectedScenarioIndex] || this.selectedFormat.scenarios[0];
    this.liveJsonData = JSON.stringify(scenario.data, null, 2);
  }

  toggleDataEditor() {
    this.showDataEditor = !this.showDataEditor;
  }

  toggleHtmlEditor() {
    this.showHtmlEditor = !this.showHtmlEditor;
  }

  applyCustomData() {
    try {
      JSON.parse(this.liveJsonData);
      this.renderActiveFormat();
    } catch (e: any) {
      alert(`Invalid JSON: ${e.message}`);
    }
  }

  applyCustomHtml() {
    this.renderActiveFormat();
  }

  async renderActiveFormat() {
    const iframe = this.frame;
    if (!iframe) {
      setTimeout(() => this.renderActiveFormat(), 50);
      return;
    }

    const startTime = performance.now();
    this.statusMessage = 'Processing...';

    // 1. Prepare data
    let data: any;
    try {
      data = JSON.parse(this.liveJsonData);
    } catch {
      const scenario = this.selectedFormat.scenarios[this.selectedScenarioIndex] || this.selectedFormat.scenarios[0];
      data = JSON.parse(JSON.stringify(scenario.data));
    }

    // 2. Execute format pre-processing script if defined
    if (this.selectedFormat.preProcessScript) {
      try {
        const fn = new Function('data', this.selectedFormat.preProcessScript);
        fn(data);
      } catch (err) {
        console.warn('Format pre-process script failed:', err);
      }
    }

    // 3. Prepare HTML template
    const rawHtml = this.liveHtmlTemplate || this.selectedFormat.html;

    // 4. Construct complete HTML document for the iframe
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${this.selectedFormat.name}</title>
  <link rel="stylesheet" href="/assets/vendor/bootstrap-5.3.7/css/bootstrap.min.css">
  <link rel="stylesheet" href="/assets/vendor/font-awesome/css/all.min.css">
  <style>
    html, body {
      margin: 0;
      padding: 20px 0;
      background-color: #525659;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    [ac-page] {
      background-color: white;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      margin: 24px auto;
      box-sizing: border-box;
    }
    [ac-report] {
      margin: auto;
      width: fit-content;
    }
    @media print {
      html, body {
        padding: 0;
        background-color: white;
      }
      [ac-page] {
        box-shadow: none;
        margin: 0;
      }
    }
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-thumb {
      background: #71717a;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #a1a1aa;
    }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;

    // 5. Write to iframe
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      this.statusMessage = 'Iframe unavailable';
      return;
    }

    doc.open();
    doc.write(fullHtml);
    doc.close();

    // 6. Give the browser a microtask to parse the DOM
    await new Promise((resolve) => setTimeout(resolve, 60));

    // 7. Find the [ac-report] element in the iframe
    const reportElement = doc.querySelector('[ac-report]') as HTMLElement;
    if (!reportElement) {
      this.statusMessage = 'No [ac-report] tag found';
      return;
    }

    // 8. Instantiate and run AcReport
    try {
      this.report = new AcReport({ element: reportElement });
      await this.report.generate({
        data: data,
        callback: () => {
          if (this.selectedFormat.postProcessCallback) {
            this.selectedFormat.postProcessCallback(doc);
          }
        }
      });

      this.totalPages = this.report.pages.length;
      this.renderTimeMs = Math.round(performance.now() - startTime);
      this.statusMessage = `Rendered (${this.totalPages} pages in ${this.renderTimeMs}ms)`;
    } catch (err: any) {
      console.error('AcReport generation error in iframe:', err);
      this.statusMessage = `Error: ${err.message}`;
    }
  }

  printReport() {
    if (this.frame && this.frame.contentWindow) {
      this.frame.contentWindow.focus();
      this.frame.contentWindow.print();
    } else if (this.report) {
      this.report.print();
    }
  }
}
