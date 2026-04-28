/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { acRegisterCustomElement, AcTextareaInputElement } from "@autocode-ts/ac-browser";
import { AC_DDE_TAG, AcDDEElementBase, IAcDDEView, IAcDDEViewColumn } from "../../_ac-data-dictionary-editor.export";

export class AcDDEViewMaster extends AcDDEElementBase {
  private _view: IAcDDEView | any;
  get view(): IAcDDEView {
    return this._view;
  }
  set view(value: IAcDDEView) {
    this._view = value;
    this.queryInput.value = value.viewQuery ? value.viewQuery : '';
  }

  element: HTMLElement = document.createElement('div');
  queryInput!: AcTextareaInputElement;
  btnSetColumns!: HTMLButtonElement;

  override init() {
    super.init();
    this.append(this.element);
    this.element.style.display = 'contents';
    this.element.innerHTML = `
    <div class="card card-body p-2">
      <div class="form-group mb-3">
        <label>View Query</label>
        <ac-textarea-input class="form-control query-input" rows="6"></ac-textarea-input>
      </div>
      <button type="button" class="btn btn-primary" btn-set-view-columns style="width:max-content;">Set View Columns</button>
    </div>
    `;


    this.btnSetColumns = this.element.querySelector('[btn-set-view-columns') as HTMLButtonElement;
    this.btnSetColumns.addEventListener('click', () => {
      if (this.view && this.view.viewQuery) {
        const result = this.editorApi.sqlParser.parse({ sql: this.view.viewQuery });
        if (result) {
          const columns = result.columns;
          const currentColumns = this.editorApi.dataStorage.getViewColumns({ viewId: this.view.viewId });
          for (const col of columns) {
            const columnDetails: IAcDDEViewColumn | any = {
              dataDictionaryId: this.editorApi.activeDataDictionary!.dataDictionaryId,
              columnName: col.queryFieldName
            };
            if (col.source == "table") {
              columnDetails.columnSource = 'table';
              const tableName: any = col.originalTable ?? col.tableAlias;
              const tables = this.editorApi.dataStorage.getTables({ tableName: tableName, dataDictionaryId: this.editorApi.activeDataDictionary!.dataDictionaryId });
              if (tables && tables.length > 0) {
                const table = tables[0];
                columnDetails.columnSourceName = table.tableName;
                columnDetails.viewId = this.view.viewId;
                const tableColumns = this.editorApi.dataStorage.getTableColumns({ tableId: table.tableId, columnName: col.tableFieldName! });
                if (tableColumns.length > 0) {
                  const tableColumnDetails = tableColumns[0];
                  columnDetails.columnSourceOriginalColumn = tableColumnDetails.columnName;
                  columnDetails.columnType = tableColumnDetails.columnType;
                }
              }
              else {
                const views = this.editorApi.dataStorage.getViews({ viewName: tableName, dataDictionaryId: this.editorApi.activeDataDictionary!.dataDictionaryId });
                if (views && views.length > 0) {
                  const view = views[0];
                  columnDetails.columnSourceName = view.viewName;
                  columnDetails.columnSource = 'view';
                  columnDetails.viewId = this.view.viewId;
                  const viewColumns = this.editorApi.dataStorage.getViewColumns({ viewName: view.viewName, columnName: col.tableFieldName!, dataDictionaryId: this.editorApi.activeDataDictionary!.dataDictionaryId });
                  if (viewColumns.length > 0) {
                    const tableColumnDetails = viewColumns[0];
                    columnDetails.columnSourceOriginalColumn = tableColumnDetails.columnName;
                    columnDetails.columnType = tableColumnDetails.columnType;
                  }
                }
              }
              this.editorApi.dataStorage.deleteViewColumn({ viewId: this.view.viewId, columnName: columnDetails.columnName });
            }
            this.editorApi.dataStorage.addViewColumn(columnDetails);
          }
          // for(const col of currentColumns){
          //   if(col.columnSource != 'table'){
          //     this.editorApi.dataStorage.addViewColumn({...col});
          //   }
          // }
          this.events.execute({ event: 'viewColumnsChange' });
        }
      }
    });

    this.queryInput = this.element.querySelector('.query-input') as AcTextareaInputElement;
    this.queryInput.on({
      event: 'change', callback: () => {
        this.notifyChange();
      }
    });
    this.queryInput.on({
      event: 'input', callback: () => {
        this.notifyChange();
      }
    });
  }

  notifyChange() {
    this.delayedCallback.add({callback:() => {
      this.view.viewQuery = this.queryInput.value;
      this.events.execute({ event: 'change', args: { view: this.view } });
    }, duration:300});
  }

}

acRegisterCustomElement({ tag: AC_DDE_TAG.viewMaster, type: AcDDEViewMaster });
