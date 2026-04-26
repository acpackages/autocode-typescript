/* eslint-disable @angular-eslint/no-output-native */
/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @angular-eslint/no-output-on-prefix */
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  OnInit,
  Input,
  TemplateRef,
  ApplicationRef,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { AC_DATAGRID_EVENT, AC_DATAGRID_EXTENSION_NAME, acAddClassToElement, AcDatagridElement, AcDatagridApi, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AcDatagridSelectInputElement, IAcDatagridColumnDefinition } from '@autocode-ts/ac-browser';
import { IAcNgDatagridColumnDefinition } from '../../../ac-ng-datagrid/interfaces/ac-datagrid-column-definition.interface';
import { AcDataManager, AcDelayedCallback, acNullifyInstanceProperties, IAcOnDemandRequestArgs } from '@autocode-ts/autocode';
import { AcRuntimeService } from '@autocode-ts/ac-ng-runtime';
import { AcNgDatagridCellRenderer } from '../../../ac-ng-datagrid/elements/ac-ng-datagrid-cell-renderer.element';
import { AcNgDatagridCellEditor } from '../../../ac-ng-datagrid/elements/ac-ng-datagrid-cell-editor.element';

@Component({
  selector: 'ac-ng-datagrid-select',
  standalone: false,
  templateUrl: `./ac-ng-datagrid-select.component.html`,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AcNgDatagridSelectComponent implements OnChanges, OnInit, OnDestroy {
  @ViewChild('selectInput') selectInputsRef: ElementRef<AcDatagridSelectInputElement>;

  @Input() inputClass: string = '';
  @Input() labelKey: string = 'label';
  @Input() valueKey: string = 'value';
  @Input() templateHeader?: TemplateRef<any>;
  @Input() templateFooter?: TemplateRef<any>;

  @Input() datagridClass: string = '';
  @Input() columnDefinitions: IAcNgDatagridColumnDefinition[] = [];
  @Input() columnEditorTemplates: Record<string, TemplateRef<any>> = {};
  @Input() columnRendererTemplates: Record<string, TemplateRef<any>> = {};
  @Input() data?: any[];
  @Input() flexColumn: string = '';
  @Input() headerHeight: number = 30;
  @Input() rowHeight: number = 30;
  @Input() onDemandFunction?: ((args: IAcOnDemandRequestArgs) => void) | any;
  @Input() usePagination: boolean = true;

  @Input()
  get value(): any {
    return this.selectInput?.value;
  }
  set value(val: any) {
    if (this.selectInput && this.selectInput.value !== val) {
      this.selectInput.value = val;
    }
  }

  @Output() change = new EventEmitter<any>();
  @Output() click = new EventEmitter<any>();
  @Output() dropdownClose = new EventEmitter<void>();
  @Output() dropdownCreate = new EventEmitter<{ dropdownContainer: HTMLElement }>();
  @Output() dropdownOpen = new EventEmitter<void>();
  @Output() dropdownResize = new EventEmitter<any>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();
  @Output() input = new EventEmitter<any>();
  @Output() searchQueryChange = new EventEmitter<string>();

  // Bonus: Most important ones (highly recommended)
  @Output() valueChange = new EventEmitter<any>();                    // when selected value changes
  @Output() selectionChange = new EventEmitter<any[]>();              // selected rows (multi-select aware)
  @Output() rowClick = new EventEmitter<any>();
  @Output() rowDoubleClick = new EventEmitter<any>();

  @Output() onDatagridInit: EventEmitter<any> = new EventEmitter();
  @Output() stateChange: EventEmitter<any> = new EventEmitter();

  datagrid: AcDatagridElement;
  datagridApi!: AcDatagridApi;
  selectInput!: AcDatagridSelectInputElement;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  dataManager!: AcDataManager;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;

  constructor(private runtimeService: AcRuntimeService, private appRef: ApplicationRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.datagrid && this.datagridApi) {
      if (changes['rowHeight']) {
        this.datagridApi.rowHeight = this.rowHeight;
      }
      else if (changes['headerHeight']) {
        this.datagridApi.headerHeight = this.headerHeight;
      }
    }
  }

  ngOnDestroy(): void {
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({instance:this});
  }


  ngOnInit() {
    this.initSelectInput();
  }

  getState():any{
    return this.selectInput.getState();
  }

  private async initDatagrid() {
    if (this.datagrid) {
      this.datagridApi = this.datagrid.datagridApi;
      this.datagridApi.headerHeight = this.headerHeight;
      this.datagridApi.rowHeight = this.rowHeight;
      this.dataManager = this.datagridApi.dataManager;
      if (this.datagridClass) {
        acAddClassToElement({ class_: this.datagridClass, element: this.datagrid });
      }
      this.setColumnDefinitions();
      this.datagridApi.usePagination = this.usePagination;
      this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
      this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
      this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
      this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
      this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
      this.columnsCustomizerExtension.showColumnCustomizerPanel = true;
      this.datagridApi.on({
        event: AC_DATAGRID_EVENT.CellRendererElementInit, callback: (args: any) => {
          // this.onCellRendererElementInit.emit(args);
        }
      });
      if (this.data) {
        this.dataManager.data = this.data;
      }
      if (this.onDemandFunction) {
        this.dataManager.onDemandFunction = this.onDemandFunction;
      }
      this.onDatagridInit.emit();
    }
    else {
      this.delayedCallback.add({callback:() => {
        this.initDatagrid();
      }, duration:10});
    }
  }

  private initSelectInput() {
    let continueOperation: boolean = true;
    if (this.selectInputsRef) {
      if (this.selectInputsRef.nativeElement) {
        continueOperation = false;
        this.selectInput = this.selectInputsRef.nativeElement;
        this.selectInput.addEventListener('change', (e: any) => {
          this.valueChange.emit(e.detail.value);
          this.change.emit(e.detail); // backward compat with native <select>
        });

        this.selectInput.addEventListener('selectionChange', (e: any) => {
          this.selectionChange.emit(e.detail.selectedRows);
        });

        // Dropdown lifecycle
        this.selectInput.addEventListener('dropdownOpen', () => {
          this.dropdownOpen.emit();
        });

        this.selectInput.addEventListener('dropdownClose', () => {
          this.dropdownClose.emit();
        });

        this.selectInput.addEventListener('dropdownResize', (e: any) => {
          this.dropdownResize.emit(e.detail);
        });

        this.selectInput.addEventListener('input', (e: any) => {
          this.input.emit(e);
        });

        this.selectInput.addEventListener('searchQueryChange', (e: any) => {
          this.searchQueryChange.emit(e.detail.searchText);
        });

        // Keyboard & Focus
        this.selectInput.addEventListener('focus', (e: FocusEvent) => {
          this.focus.emit(e);
        });

        this.selectInput.addEventListener('keydown', (e: KeyboardEvent) => {
          this.keydown.emit(e);
        });

        // Click events
        this.selectInput.addEventListener('click', (e: any) => {
          this.click.emit(e);
        });

        // Row interactions
        this.selectInput.addEventListener('rowClick', (e: any) => {
          this.rowClick.emit(e.detail.rowData);
        });

        this.selectInput.addEventListener('rowDoubleClick', (e: any) => {
          this.rowDoubleClick.emit(e.detail.rowData);
        });

        this.selectInput.addEventListener('dropdownCreate', (event: any) => {
          this.dropdownCreate.emit();
          const dropdownContainer: HTMLElement = event.detail.dropdownContainer;
          if (this.templateHeader) {
            const headerContainer = dropdownContainer.querySelector('.dropdown-header') as HTMLElement;
            if (headerContainer) {
              const headerView = this.templateHeader.createEmbeddedView({});
              headerView.rootNodes.forEach(node => headerContainer.appendChild(node));
              headerView.detectChanges();
            }
          }
          if (this.templateFooter) {
            const footerContainer = dropdownContainer.querySelector('.dropdown-footer') as HTMLElement;
            if (footerContainer) {
              const footerView = this.templateFooter.createEmbeddedView({});
              footerView.rootNodes.forEach(node => footerContainer.appendChild(node));
              footerView.detectChanges();
            }
          }
        });

        this.selectInput.addEventListener('stateChange', (event:any) => {
          this.stateChange.emit(event.detail);
        });
        this.datagrid = this.selectInput.datagrid;
        this.initDatagrid();
      }
    }
    if (continueOperation) {
      this.delayedCallback.add({callback:() => {
        this.initSelectInput();
      }, duration:10});
    }
  }

  private setColumnDefinitions() {
    const columns: IAcDatagridColumnDefinition[] = [];
    for (const colDef of this.columnDefinitions) {
      colDef.cellRendererElement = AcNgDatagridCellRenderer;
      if (!colDef.cellRendererElementParams) {
        colDef.cellRendererElementParams = {};
      }
      colDef.cellRendererElementParams['___appRef___'] = this.appRef;
      colDef.cellRendererElementParams['___runtimeService___'] = this.runtimeService;

      colDef.cellEditorElement = AcNgDatagridCellEditor;
      if (!colDef.cellEditorElementParams) {
        colDef.cellEditorElementParams = {};
      }
      colDef.cellEditorElementParams['___appRef___'] = this.appRef;
      colDef.cellEditorElementParams['___runtimeService___'] = this.runtimeService;

      if (this.columnRendererTemplates[colDef.field]) {
        colDef.cellRendererTemplateRef = this.columnRendererTemplates[colDef.field];
      }
      if (this.columnEditorTemplates[colDef.field]) {
        colDef.cellEditorTemplateRef = this.columnEditorTemplates[colDef.field];
      }
      if (this.flexColumn == colDef.field) {
        colDef.flexSize = 1;
      }
      columns.push(colDef);
    }
    this.datagridApi.columnDefinitions = columns;
  }

  setState({state}:{state:any}){
    this.selectInput.setState({state});
  }
}
