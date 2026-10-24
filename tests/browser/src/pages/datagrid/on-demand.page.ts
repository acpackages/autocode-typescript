/* eslint-disable @typescript-eslint/no-explicit-any */
import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import {
  AcDatagridElement,
  AC_DATAGRID_EXTENSION_NAME
} from "@autocode-ts/ac-browser";
import {
  AcDataManager,
  AC_DATA_MANAGER_EVENT,
  IAcOnDemandRequestArgs
} from "@autocode-ts/autocode";
import { customersData } from "../../data/customers-data";
import { IAppMenuItem } from "../../_app.export";

@AcElement({
  selector: 'datagrid-on-demand-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcDatagridElement : On-Demand Data'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="p-3 flex-fill overflow-hidden d-flex flex-column">
        <!-- Toolbar -->
        <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
          <div class="flex-grow-1" style="max-width: 350px;">
            <input
              #searchInput
              type="text"
              class="form-control form-control-sm"
              placeholder="Search server rows..."
              (input)="onSearch($event)"
            />
          </div>
          <button class="btn btn-sm btn-outline-secondary" (click)="refreshData()">
            <i class="fa fa-refresh me-1"></i> Refresh
          </button>
          <div class="btn-group btn-group-sm">
            <button
              class="btn"
              [class.btn-primary]="latency === 30"
              [class.btn-outline-primary]="latency !== 30"
              (click)="setLatency(30)"
            >
              30ms
            </button>
            <button
              class="btn"
              [class.btn-primary]="latency === 200"
              [class.btn-outline-primary]="latency !== 200"
              (click)="setLatency(200)"
            >
              200ms
            </button>
            <button
              class="btn"
              [class.btn-primary]="latency === 800"
              [class.btn-outline-primary]="latency !== 800"
              (click)="setLatency(800)"
            >
              800ms
            </button>
          </div>
          <div class="ms-auto d-flex align-items-center gap-2">
            <span
              id="on-demand-status"
              class="badge"
              [class.bg-warning]="isLoading"
              [class.text-dark]="isLoading"
              [class.bg-success]="!isLoading"
            >
              {{ statusText }}
            </span>
          </div>
        </div>

        <!-- Datagrid -->
        <div class="flex-fill border rounded overflow-hidden">
          <ac-datagrid #grid class="h-100"></ac-datagrid>
        </div>
      </div>
    </div>
  `
})
export class DatagridOnDemandPage {
  @AcViewChild('#grid') grid!: AcDatagridElement;
  @AcViewChild('#searchInput') searchInput!: HTMLInputElement;

  latency: number = 200;
  isLoading: boolean = false;
  statusText: string = 'Initializing...';

  /** Mock server-side data manager that holds the complete dataset */
  private mockServerDataManager: AcDataManager = new AcDataManager();

  dropdownItems: IAppMenuItem[] = [
    { label: 'Grid Actions', isHeader: true },
    { label: 'Refresh Data', callback: () => this.refreshData() },
    { label: 'Reset Search', callback: () => this.clearSearch() },
    { label: 'Latency: Fast (30ms)', callback: () => this.setLatency(30) },
    { label: 'Latency: Normal (200ms)', callback: () => this.setLatency(200) },
    { label: 'Latency: Slow (800ms)', callback: () => this.setLatency(800) }
  ];

  acOnInit() {
    this.initMockServerData();
    this.setupDatagrid();
  }

  /**
   * Initializes the mock server data manager with a large set of customer records.
   */
  private initMockServerData() {
    const rawData = customersData.slice(0, 5000).map((row, i) => ({
      index: i + 1,
      ...row
    }));
    this.mockServerDataManager.data = rawData;
  }

  /**
   * Configures the grid columns, extensions, pagination, and on-demand function.
   */
  private setupDatagrid() {
    const api = this.grid.datagridApi;

    api.animateRows = false;
    api.useVirtualScrolling = false;
    api.usePagination = true;

    // Enable Extensions
    api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging });
    api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.KeyboardActions });
    api.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging });

    api.columnDefinitions = [
      {
        field: 'index',
        title: 'SrNo.',
        width: 80,
        cellClass: 'text-center',
        headerCellClass: 'text-center',
        allowSort: true
      },
      { field: 'first_name', title: 'First Name', allowEdit: true, allowSort: true },
      { field: 'last_name', title: 'Last Name', allowEdit: true, allowSort: true },
      { field: 'company', title: 'Company', allowSort: true },
      { field: 'city', title: 'City', allowSort: true },
      { field: 'country', title: 'Country', allowSort: true },
      { field: 'email', title: 'Email', allowSort: true },
      { field: 'phone_1', title: 'Phone' },
      { field: 'salary', title: 'Salary', allowSort: true },
      { field: 'website', title: 'Website', visible: false, flex: 1 }
    ];

    // Wire up events for status tracking
    api.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.BeforeGetOnDemandData,
      callback: () => {
        this.isLoading = true;
        this.statusText = 'Fetching from server...';
      }
    });

    api.dataManager.on({
      event: AC_DATA_MANAGER_EVENT.GetOnDemandDataSuccessCallback,
      callback: () => {
        this.isLoading = false;
        const total = api.dataManager.totalRows;
        this.statusText = `Ready (${total} rows available)`;
      }
    });

    // Provide the on-demand handler that simulates a remote server
    api.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      const startIndex = args.startIndex ?? 0;
      const rowsCount = args.rowsCount ?? 50;

      this.isLoading = true;
      this.statusText = `Requesting items ${startIndex} to ${startIndex + rowsCount}...`;

      if (args.filterGroup) {
        this.mockServerDataManager.filterGroup = args.filterGroup;
      }
      if (args.sortOrder) {
        this.mockServerDataManager.sortOrder = args.sortOrder;
      }
      this.mockServerDataManager.searchQuery = args.searchQuery ?? '';
      this.mockServerDataManager.processRows();

      const totalCount = this.mockServerDataManager.totalRows;
      const dataRows = await this.mockServerDataManager.getData({
        startIndex,
        rowsCount
      });

      // Extract raw data records from mock server data rows
      const data = dataRows.map((row: any) => (row && row.data ? row.data : row));

      setTimeout(() => {
        args.successCallback({
          data,
          totalCount
        });
      }, this.latency);
    };

    // Initial load
    api.dataManager.refreshRows();
  }

  onSearch(event: any) {
    const query = event.target ? event.target.value : '';
    this.grid.datagridApi.dataManager.searchQuery = query;
    this.grid.datagridApi.dataManager.refreshRows();
  }

  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.grid.datagridApi.dataManager.searchQuery = '';
    this.grid.datagridApi.dataManager.refreshRows();
  }

  refreshData() {
    this.grid.datagridApi.dataManager.refreshRows();
  }

  setLatency(ms: number) {
    this.latency = ms;
  }
}
