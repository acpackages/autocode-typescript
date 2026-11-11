import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcReport } from "@autocode-ts/ac-report-engine";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'reports-toc-and-sections-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-secondary bg-opacity-10">
      <app-header
        [title]="'AcReport : TOC, Sections & Group Continuation'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-auto p-4">
        <div class="row g-4">
          <!-- Control Panel -->
          <div class="col-lg-3">
             <div class="card shadow-sm border-0 sticky-top" style="top: 1rem;">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Enterprise Document Features</h6>

                   <div class="alert alert-info py-2 px-3 small mb-3">
                      <i class="fa-solid fa-circle-info me-1"></i>
                      Demonstrating:
                      <ul class="mb-0 mt-1 ps-3">
                        <li><strong>Dynamic TOC</strong>: Automatically aggregates sections &amp; page numbers.</li>
                        <li><strong>Group Continuation</strong>: <code>ac:group-header</code> auto-repeats on splits.</li>
                        <li><strong>Multi-Column</strong>: <code>ac-page-columns="2"</code> newspaper flow.</li>
                        <li><strong>Section Numbers</strong>: Independent page numbering per section.</li>
                      </ul>
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Page Columns Layout</label>
                      <select class="form-select form-select-sm" [(acModel)]="columnLayout" (change)="updateColumns()">
                         <option value="1">Standard 1-Column</option>
                         <option value="2">2-Column Newspaper Layout</option>
                         <option value="3">3-Column Brochure Layout</option>
                      </select>
                   </div>

                   <div class="mb-3">
                      <label class="form-label small fw-semibold">Rows in Project Scope ({{data.tasks.length}} items)</label>
                      <input type="range" class="form-range" min="15" max="60" step="5" [(acModel)]="taskCount" (change)="onSliderChange()" />
                      <div class="small text-muted text-end">{{taskCount}} items</div>
                   </div>

                   <div class="d-grid gap-2 mt-4">
                      <button class="btn btn-primary btn-sm" (click)="generateReport()">
                        <i class="fa-solid fa-arrows-rotate me-2"></i> Regenerate Document
                      </button>
                      <button class="btn btn-outline-secondary btn-sm" (click)="printReport()">
                        <i class="fa-solid fa-print me-2"></i> Print Preview
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Report Preview -->
          <div class="col-lg-9">
             <div class="report-canvas p-4 bg-white shadow mx-auto" #reportContainer ac-report>
                 
                 <!-- DOCUMENT PAGE TEMPLATE -->
                 <div class="page" ac-page ac-page-size="A4" ac-page-orientation="portrait" [attr.ac-page-columns]="columnLayout" style="padding: 25mm 20mm;">
                    
                    <!-- Top Document Header -->
                    <div class="d-flex justify-content-between border-bottom pb-3 mb-4" ac-report-header>
                       <div>
                          <h4 class="fw-bold text-dark mb-0">Enterprise Transformation Blueprint</h4>
                          <span class="text-muted small">AutoCode Software Solutions &bull; Architectural Dossier</span>
                       </div>
                       <div class="text-end">
                          <span class="badge bg-primary">Section: {{page.sectionName}}</span>
                       </div>
                    </div>

                    <!-- Dynamic Table of Contents Block -->
                    <div class="card border border-primary bg-light p-3 mb-4 shadow-sm" ac:toc>
                       <h6 class="fw-bold text-primary mb-2">
                          <i class="fa-solid fa-list-ol me-2"></i> Document Table of Contents
                       </h6>
                       <div class="small text-muted mb-2">Page references below are dynamically resolved during pagination:</div>
                    </div>

                    <!-- SECTION 1 -->
                    <div class="mb-4" ac:section="1. Executive Summary" ac:section-name="Summary">
                       <h5 class="fw-bold text-primary border-bottom pb-2">1. Executive Summary</h5>
                       <p class="small text-muted">
                          This strategic report establishes the technical architecture, continuous integration roadmap, and security compliance baselines for the next three calendar years. Distributed ledger reconciliation ensures absolute immutability.
                       </p>
                    </div>

                    <!-- SECTION 2 with Hierarchical Group Header -->
                    <div class="mb-4" ac:section="2. Operational Task Ledgers" ac:section-name="Operations">
                       <h5 class="fw-bold text-primary border-bottom pb-2">2. Operational Task Ledgers</h5>
                       
                       <!-- Master Group Header -->
                       <div class="p-2 bg-dark text-white rounded mb-2 d-flex justify-content-between align-items-center" ac:group-header="Core Infrastructure Tasks">
                          <span class="fw-bold small"><i class="fa-solid fa-layer-group me-1"></i> Core Infrastructure &amp; Security Pipeline</span>
                          <span class="badge bg-primary">Sprint Phase Alpha</span>
                       </div>

                       <!-- Multi-page item loop -->
                       <table class="table table-sm table-striped border mb-3">
                          <thead class="table-light">
                             <tr>
                                <th style="width: 50px;">#</th>
                                <th>Task Description</th>
                                <th style="width: 100px;">Assignee</th>
                                <th style="width: 110px;" class="text-end">Allocation</th>
                             </tr>
                          </thead>
                          <tbody>
                             <tr *for="let t of data.tasks; index as i">
                                <td>{{i + 1}}</td>
                                <td>{{t.title}}</td>
                                <td><span class="badge bg-light text-dark border">{{t.owner}}</span></td>
                                <td class="text-end fw-bold">$ {{t.cost}}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>

                    <!-- SECTION 3 -->
                    <div class="mt-4 p-3 border rounded bg-light" ac:section="3. Risk &amp; Governance Schedule" ac:section-name="Governance">
                       <h5 class="fw-bold text-primary border-bottom pb-2">3. Risk &amp; Governance Schedule</h5>
                       <p class="small text-muted mb-0">
                          All cloud nodes are safeguarded under zero-trust identity federation protocols. Continuous vulnerability remediation metrics are audited weekly by the security oversight committee.
                       </p>
                    </div>

                    <!-- Footer with Section and Global Page Tokens -->
                    <div class="border-top pt-2 mt-auto d-flex justify-content-between small text-muted" ac-page-footer>
                       <div>Section {{page.sectionName}}: Page {{page.sectionPageNumber}} of {{page.sectionTotalPages}}</div>
                       <div>Overall Document: Page {{page.pageNumber}} of {{page.totalPages}}</div>
                    </div>

                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .report-canvas {
      width: 210mm;
      min-height: 297mm;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  `
})
export class ReportsTocAndSectionsPage {
  @AcViewChild('#reportContainer') reportContainer!: HTMLElement;
  report!: AcReport;

  columnLayout: string = '1';
  taskCount: number = 35;

  data = {
    tasks: [] as Array<{ title: string; owner: string; cost: string }>
  };

  dropdownItems: IAppMenuItem[] = [
    { label: 'Actions', isHeader: true },
    { label: 'Print Preview', callback: () => this.printReport() }
  ];

  acOnInit() {
    this.populateTasks(this.taskCount);
    this.report = new AcReport({ element: this.reportContainer });
    this.generateReport();
  }

  setTasks(count: number) {
    this.taskCount = count;
    this.populateTasks(count);
    this.generateReport();
  }

  onSliderChange() {
    this.populateTasks(Number(this.taskCount));
    this.generateReport();
  }

  updateColumns() {
    this.generateReport();
  }

  populateTasks(count: number) {
    const owners = ['Architect Team', 'SecOps', 'Cloud Infra', 'Database SRE', 'Platform QA'];
    const list = [];
    for (let i = 1; i <= count; i++) {
      list.push({
        title: `Deployment pipeline security verification matrix item #${100 + i}`,
        owner: owners[i % owners.length],
        cost: (1500 + ((i * 123) % 4500)).toLocaleString()
      });
    }
    this.data.tasks = list;
  }

  async generateReport() {
    this.report.clear();
    await this.report.generate({ data: this.data });
  }

  printReport() {
    this.report.print();
  }
}
