/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridApi, IAcDatagridCell, IAcDatagridColumn, IAcDatagridCellRenderer, IAcDatagridRow, IAcDatagridCellElementArgs, AC_DATAGRID_EVENT, AC_DATAGRID_HOOK, AcEnumDatagridColumnDataType } from "@autocode-ts/ac-browser";
import { AgPromise, ICellEditorComp, ICellEditorParams, ICellRendererParams } from "ag-grid-community";
import { AcDatagridOnAgGridExtension } from "../core/ac-datagrid-on-ag-grid-extension";
import { AcDelayedCallback, acNullifyInstanceProperties } from "@autocode-ts/autocode";

export class AcDatagridOnAgGridCellEditor implements ICellEditorComp {
  datagridApi?: AcDatagridApi;
  datagridCell?: IAcDatagridCell;
  datagridColumn?: IAcDatagridColumn;
  datagridRow?: IAcDatagridRow;
  agGridExtension?: AcDatagridOnAgGridExtension;
  instance?: IAcDatagridCellRenderer;
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  params: any;
  element: HTMLInputElement|any = document.createElement('input');
  private isFocused: boolean = false;
  editor: any;
  previousValue:any;
  private isValueChanged = false;


  handleBlur: Function = () => {
    this.isFocused = false;
    const cellValue = this.getValue();
    this.delayedCallback.add({callback:() => {
      if (!this.isFocused) {
        if (this.datagridRow && this.datagridColumn && this.datagridApi) {
          if (this.datagridColumn.columnDefinition.useCellEditorForRenderer) {
            if (this.isValueChanged || this.datagridRow.data[this.datagridColumn.columnKey] != cellValue) {
              this.isValueChanged = false;
              this.datagridRow.data[this.datagridColumn.columnKey] = cellValue;
              this.datagridApi.eventHandler.handleCellValueChange({ datagridCell: this.datagridCell! });
              this.refresh(this.params);
            }
          }
        }
      }
    }, duration:10});
  };

  private handleCellKeyUp: any = (event: any) => {
    if (this.datagridCell) {
      if (this.datagridRow && this.datagridColumn) {
        const previousValue = this.datagridRow.data[this.datagridColumn.columnKey];
        const currentValue = this.getValue();
        if (previousValue != currentValue) {
          this.isValueChanged = true;
          this.datagridRow.data[this.datagridColumn.columnKey] = currentValue;
        }
        this.datagridApi!.eventHandler.handleCellKeyUp({ datagridCell: this.datagridCell, event: event as any });
        this.datagridApi!.eventHandler.handleRowKeyUp({ datagridRow: this.datagridRow, event: event as any });
      }
    }

  };

  handleFocus: Function = () => {
    this.isFocused = true;
    if (this.datagridRow && this.datagridColumn && this.datagridApi) {
      this.element.value = this.datagridRow.data[this.datagridColumn.columnKey]??null;
    }
    this.element.focus();
  };

  handleInputAndChange: any = (el: HTMLInputElement, ev: Event) => {
    // if(this.datagridRow && this.datagridColumn){
    //   const previousValue = this.datagridRow.data[this.datagridColumn.columnKey];
    //   const currentValue = this.element.value;
    //   if(previousValue != currentValue){
    //     this.datagridRow.data[this.datagridColumn.columnKey] = currentValue;

    //     console.log("Editor Element input/change");
    //   }
    // }
  };

  getValue() {
    if(this.editor){
      return this.editor.getValue()
    }
    let value:any = this.element.value;
    if(value!= '' && value != undefined && value!=null && this.datagridColumn && this.datagridColumn.columnDefinition.dataType == AcEnumDatagridColumnDataType.Number){
      value = Number(value);
    }
    return value;
  }

  focusIn?(): void {
    return this.element.focus();
  }

  destroy(): void {
    if(this.previousValue != this.getValue() && this.datagridCell){
      this.datagridApi!.eventHandler.handleCellValueChange({ datagridCell:this.datagridCell,event:{
        previousValue:this.previousValue,
        currentValue:this.getValue()
      } });
    }
    if (this.datagridCell) {
      (this.datagridCell.element as any) = null;
    }
    if (this.params) {
      this.params.eGridCell.removeEventListener('focusout', this.handleBlur);
      this.params.eGridCell.removeEventListener('focusin', this.handleFocus);
    }
    if (this.element) {
      this.element.removeEventListener('change', this.handleInputAndChange);
      this.element.removeEventListener('input', this.handleInputAndChange);
      this.element.removeEventListener('keyup', this.handleCellKeyUp);
    }
    if(this.element.destroy){
      this.element.destroy();
    }
    if (this.editor) {
      if (this.editor.destroy != undefined) {
        this.editor.destroy();
      }
    }
    if(this.datagridApi){
      this.datagridApi.hooks.execute({hook:AC_DATAGRID_EVENT.CellEditorElementDestroy,args:{datagridCell:this.datagridCell}});
      this.datagridApi.events.execute({event:AC_DATAGRID_EVENT.CellEditorElementDestroy,args:{datagridCell:this.datagridCell}});
    }
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  getGui(): HTMLElement {
    return this.element;
  }

  init?(params: ICellRendererParams | any): AgPromise<void> | void {
      this.params = params;
      this.agGridExtension = params.agGridExtension;
      this.datagridColumn = params.datagridColumn;
      this.datagridApi = params.datagridApi;
      this.datagridRow = this.datagridApi!.getRow({ rowId: params.data[this.agGridExtension!.rowKey] });
      if (this.datagridRow && this.datagridColumn) {
        this.previousValue = this.datagridRow.data[this.datagridColumn.columnKey];
        let cellValue:any = this.datagridRow.data[this.datagridColumn.columnKey];
        if(cellValue == undefined){
          cellValue = null;
        }
        this.datagridCell = this.datagridApi?.getCell({ row: this.datagridRow, column: this.datagridColumn });
        if (this.datagridCell) {
          if (this.datagridCell.extensionData == undefined) {
            this.datagridCell.extensionData = {}
          }
          const columnDefinition = this.datagridColumn.columnDefinition;
          if (columnDefinition.cellEditorElement) {
            const editor = new columnDefinition.cellEditorElement();
            const initArgs: IAcDatagridCellElementArgs = {
              datagridApi: this.datagridApi!,
              datagridCell: this.datagridCell!
            };
            editor.init(initArgs);
            this.editor = editor;
            const element = editor.getElement();
            if (this.element) {
              this.element.replaceWith(element);
            }
            this.element = element;
            if (!this.datagridColumn.columnDefinition.useCellEditorForRenderer) {
              this.element.focus();
            }
            this.element.addEventListener('change', this.handleInputAndChange);
            this.element.addEventListener('input', this.handleInputAndChange);
            this.element.addEventListener('keyup', this.handleCellKeyUp);
            this.datagridCell.extensionData['cellEditingEditor'] = editor;
          }
          else if (columnDefinition.cellEditorFunction) {
            const args: IAcDatagridCellElementArgs = {
              datagridApi: this.datagridApi!,
              datagridCell: this.datagridCell
            }
            const element = columnDefinition.cellEditorFunction(args);
            if (this.element) {
              this.element.replaceWith(element);
            }
            this.element = element;
            this.element.value = cellValue;
            if (columnDefinition.cellInputElementAttrs) {
              Object.assign(element, columnDefinition.cellInputElementAttrs);
            }
            if (!this.datagridColumn.columnDefinition.useCellEditorForRenderer) {
              this.element.focus();
            }
            this.element.addEventListener('change', this.handleInputAndChange);
            this.element.addEventListener('input', this.handleInputAndChange);
            this.element.addEventListener('keyup', this.handleCellKeyUp);
            this.datagridCell.extensionData['cellEditingElement'] = element;
          }
          else if (columnDefinition.cellInputElement) {
            const element = new columnDefinition.cellInputElement();
            if (this.element) {
              this.element.replaceWith(element);
            }
            this.element = element;
            this.element.value = cellValue;
            if (columnDefinition.cellInputElementAttrs) {
              Object.assign(element, columnDefinition.cellInputElementAttrs);
            }
            if (!this.datagridColumn.columnDefinition.useCellEditorForRenderer) {
              this.element.focus();
            }
            this.element.addEventListener('change', this.handleInputAndChange);
            this.element.addEventListener('input', this.handleInputAndChange);
            this.element.addEventListener('keyup', this.handleCellKeyUp);
            this.datagridCell.extensionData['cellEditingElement'] = element;
          }
          else {
            const element = this.datagridApi?.datagrid.ownerDocument.createElement('input') as HTMLInputElement;
            if (this.element) {
              this.element.replaceWith(element);
            }
            if (columnDefinition.dataType == AcEnumDatagridColumnDataType.Date) {
              element.setAttribute('type', 'date');
            }
            else if (columnDefinition.dataType == AcEnumDatagridColumnDataType.Datetime) {
              element.setAttribute('type', 'datetime-local');
            }
            else if (columnDefinition.dataType == AcEnumDatagridColumnDataType.Number) {
              element.setAttribute('type', 'number');
            }
            this.element = element;
            this.element.classList.add('ac-datagrid-cell-editor-element');
            this.element.value = cellValue;
            if (!this.datagridColumn.columnDefinition.useCellEditorForRenderer) {
              this.element.focus();
            }
            this.element.addEventListener('change', this.handleInputAndChange);
            this.element.addEventListener('input', this.handleInputAndChange);
            this.element.addEventListener('keyup', this.handleCellKeyUp);
            this.datagridCell.extensionData['cellEditingElement'] = element;
          }
          if (this.datagridColumn.columnDefinition.cellEditorElementAttrs) {
            const attrs: any = this.datagridColumn.columnDefinition.cellEditorElementAttrs;
            for (const key of Object.keys(attrs)) {
              this.element.setAttribute(key, attrs[key]);
            }
          }
          this.datagridApi?.hooks.execute({ hook: AC_DATAGRID_HOOK.CellEditorElementInit, args: { editor: this } });
          this.datagridApi?.events.execute({ event: AC_DATAGRID_EVENT.CellEditorElementInit, args: { editor: this } });
        }
        this.params.eGridCell.addEventListener('focusin', this.handleFocus);
        this.params.eGridCell.addEventListener('focusout', this.handleBlur);
      }
  }

  refresh(params: ICellEditorParams<any, any, any>): boolean {
    this.init!(params);
    return true;
  }
}
