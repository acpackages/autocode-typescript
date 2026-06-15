/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDatagridApi, IAcDatagridColumn, IAcDatagridCellRenderer } from "@autocode-ts/ac-browser";
import { AgPromise, FloatingFilterDisplayComp, FloatingFilterDisplayParams } from "ag-grid-community";
import { AcDatagridOnAgGridExtension } from "../core/ac-datagrid-on-ag-grid-extension";
import { AcDelayedCallback, acNullifyInstanceProperties } from "@autocode-ts/autocode";

export class AcDatagridOnAgGridFixedEditorInput implements FloatingFilterDisplayComp {
  datagridApi?: AcDatagridApi;
  datagridColumn?: IAcDatagridColumn;
  agGridExtension?: AcDatagridOnAgGridExtension;
  instance?: IAcDatagridCellRenderer;
  params: any;
  element: HTMLElement = document.createElement('input');
  delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  private isFocused: boolean = false;


  destroy(): void {
    this.element.remove();
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  getGui(): HTMLElement {
    console.log('Returning from element');
    return this.element;
  }

  init?(params: FloatingFilterDisplayParams | any): AgPromise<void> | void {
    requestAnimationFrame(() => {
      this.params = params;
      this.agGridExtension = params.agGridExtension;
      this.datagridColumn = params.datagridColumn;
      const fixedEditorDetails = this.datagridColumn.columnDefinition.extensionData['fixedEditor'];
      this.datagridApi = params.datagridApi;
      this.element.style.display = 'contents';
      console.log(this);
      if (this.datagridColumn) {
        let newElement;
        if (fixedEditorDetails.inputElement) {
          console.log('Creating input from element');
          newElement = new fixedEditorDetails.inputElement();
        }
        else if (fixedEditorDetails.inputElementFunction) {
          console.log('Creating input from function');
          newElement = fixedEditorDetails.inputElementFunction();
        }
        if(newElement){
          if(this.element.isConnected){
            this.element.replaceWith(newElement);
          }
          this.element = newElement;
        }
        if (fixedEditorDetails.inputAttrs) {
          const attrs: any = fixedEditorDetails.inputAttrs;
          for (const key of Object.keys(attrs)) {
            this.element.setAttribute(key, attrs[key]);
          }
        }
        if (fixedEditorDetails.inputParams) {
          const attrs: any = fixedEditorDetails.inputParams;
          for (const key of Object.keys(attrs)) {
            (this.element as any)[key] = attrs[key];
          }
        }
      }
      else {
        console.warn(`Datagrid Row and Datagrid Column Not Found`, params);
      }
    });
  }

  refresh(params: FloatingFilterDisplayParams<any, any, any>): void {
    // this.init!(params);
    // return true;
  }
}
