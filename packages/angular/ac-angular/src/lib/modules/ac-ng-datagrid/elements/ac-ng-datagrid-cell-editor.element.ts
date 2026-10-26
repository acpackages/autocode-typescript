/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationRef, ComponentRef, EmbeddedViewRef, TemplateRef, Type } from '@angular/core';
import { IAcDatagridCell, IAcDatagridColumn, IAcDatagridCellEditor, IAcDatagridCellElementArgs, IAcDatagridRow, AC_DATAGRID_EVENT, AC_DATAGRID_HOOK } from '@autocode-ts/ac-browser';
import { AcRuntimeService } from '@autocode-ts/ac-ng-runtime';
import { IAcNgDatagridColumnDefinition } from '../interfaces/ac-datagrid-column-definition.interface';
import { acNullifyInstanceProperties } from '@autocode-ts/autocode';

/**
 * Angular-compatible Datagrid Cell Editor.
 * Supports both TemplateRef and Component-based editors.
 */
export class AcNgDatagridCellEditor implements IAcDatagridCellEditor {
  private datagridCell?: IAcDatagridCell;
  private datagridColumn?: IAcDatagridColumn;
  private datagridRow?: IAcDatagridRow;
  private columnDefinition?: IAcNgDatagridColumnDefinition;
  public element: HTMLElement = document.createElement('div');

  private appRef?: ApplicationRef;
  private viewRef?: EmbeddedViewRef<any>;
  private componentRef?: ComponentRef<IAcDatagridCellEditor>;
  private runtimeService?: AcRuntimeService;
  private templateElements?:HTMLElement[]|any[];

  blur() {
    let continueOperation: boolean = true;
    if (this.componentRef) {
      if (this.componentRef.instance.blur) {
        continueOperation = false;
        this.componentRef.instance.blur();
      }
    }
    if (continueOperation) {
      const firstChild = this.element.children[0] as HTMLElement;
      firstChild.blur();
    }
  }

  private clear() {
    if (this.viewRef && this.appRef) {
      this.appRef?.detachView(this.viewRef);
       for (const node of Array.from(this.viewRef.rootNodes) as HTMLElement[]) {
        node.remove();
      }
      this.viewRef.destroy();
      this.viewRef = null;
    }
    if (this.componentRef) {
      this.componentRef.destroy();
      if(this.componentRef.location && this.componentRef.location.nativeElement){
        this.componentRef.location.nativeElement.remove();
      }
      this.componentRef = null;
    }
    this.element.innerHTML = '';
  }

  destroy(): void {
    this.clear();
    if(this.datagridCell){
      (this.datagridCell.element as any) = null;
    }
    if(this.templateElements){
      for(const el of this.templateElements){
        if(el.destroy != undefined){
          el.destroy();
        }
      }
    }
    this.element.remove();
    acNullifyInstanceProperties({instance:this});
  }

  focus() {
    let continueOperation: boolean = true;
    if (this.componentRef) {
      if (this.componentRef.instance.focus) {
        continueOperation = false;
        this.componentRef.instance.focus();
      }
    }
    if (continueOperation) {
      const firstChild = this.element.children[0] as HTMLElement;
      if (firstChild) {
        firstChild.focus();
      }
    }
  }

  getContext(): any {
    return {
      $implicit: this.datagridRow.data,
      datagridCell: this.datagridCell,
      datagridRow: this.datagridCell.datagridRow,
      datagridColumn: this.datagridCell.datagridColumn,
      value: this.datagridRow.data[this.datagridCell.datagridColumn.columnDefinition.field],
    };
  }

  getElement(): HTMLElement {
    return this.element;
  }

  getValue(): any {
    if (this.componentRef) {
      return this.componentRef.instance.getValue();
    }
    return this.datagridRow.data[this.datagridColumn.columnKey];
  }

  init(args: IAcDatagridCellElementArgs): void {
    this.datagridCell = args.datagridCell;
    this.datagridColumn = args.datagridCell.datagridColumn;
    this.datagridRow = args.datagridCell.datagridRow;
    this.columnDefinition = this.datagridColumn.columnDefinition;
    this.appRef = this.columnDefinition.cellEditorElementParams['___appRef___'];
    this.runtimeService = this.columnDefinition.cellEditorElementParams['___runtimeService___'];
    const colDef = this.columnDefinition;
    this.element.style.height = '100%';
    this.element.style.width = '100%';
    if (this.datagridRow?.rowId) {
      this.element.setAttribute('ac-cell-editor-row-id', this.datagridRow.rowId);
    }
    const colKey = this.datagridColumn?.columnKey || this.datagridColumn?.columnDefinition?.field;
    if (colKey) {
      this.element.setAttribute('ac-cell-editor-column-key', colKey);
    }
    if (colDef.cellEditorTemplateRef) {
      this.renderTemplate(colDef.cellEditorTemplateRef);
    } else if (colDef.cellEditorComponent) {
      const initArgs = { ...args };
      delete initArgs['___appRef___'];
      delete initArgs['___runtimeService___'];
      this.renderComponent(colDef.cellEditorComponent, initArgs);
    } else {
      this.renderDefault();
    }
    args.datagridApi.hooks.execute({hook:AC_DATAGRID_HOOK.CellEditorElementInit,args:{editor:this}});
    args.datagridApi.events.execute({event:AC_DATAGRID_EVENT.CellEditorElementInit,args:{editor:this}});
  }

  refresh(args: IAcDatagridCellElementArgs): void {
    this.datagridCell = args.datagridCell;
    this.datagridColumn = args.datagridCell.datagridColumn;
    this.datagridRow = args.datagridCell.datagridRow;
    this.columnDefinition = this.datagridColumn.columnDefinition;
    if (this.datagridRow?.rowId) {
      this.element.setAttribute('ac-cell-editor-row-id', this.datagridRow.rowId);
    }
    const colKey = this.datagridColumn?.columnKey || this.datagridColumn?.columnDefinition?.field;
    if (colKey) {
      this.element.setAttribute('ac-cell-editor-column-key', colKey);
    }
    if (this.viewRef) {
      this.viewRef.context = this.getContext();
    }
    else if (this.componentRef) {
      this.componentRef.instance.refresh(args);
    }
  }

  private renderComponent(componentType: Type<IAcDatagridCellEditor>, args: IAcDatagridCellElementArgs) {
    this.clear();
    const properties = this.columnDefinition.cellEditorComponentProperties ? this.columnDefinition.cellEditorComponentProperties : {};
    this.componentRef = this.runtimeService.createComponent(componentType, properties);
    if (this.datagridCell.extensionData == undefined) {
      this.datagridCell.extensionData = {};
    }
    this.datagridCell.extensionData['cellEditingNgComponentRef'] = this.componentRef;
    const instance: any = this.componentRef.instance;
    if (instance.init) {
      instance.init(args);
    }
    if (instance.datagridContext) {
      instance.datagridContext = this.getContext();
    }
    this.element.appendChild(this.componentRef.location.nativeElement);
  }

  private renderDefault() {
    const input = document.createElement('input');
    input.style.width = '100%';
    if (this.datagridRow?.rowId) {
      input.setAttribute('ac-cell-editor-row-id', this.datagridRow.rowId);
    }
    const colKey = this.datagridColumn?.columnKey || this.datagridColumn?.columnDefinition?.field;
    if (colKey) {
      input.setAttribute('ac-cell-editor-column-key', colKey);
    }
    input.value =
      this.datagridRow.data[
      this.datagridCell.datagridColumn.columnDefinition.field
      ];
    input.addEventListener('input', () => {
      this.datagridRow.data[
        this.datagridCell.datagridColumn.columnDefinition.field
      ] = input.value;
    });
    this.element.appendChild(input);
  }

  private renderTemplate(template: TemplateRef<any>) {
    this.clear();

    this.viewRef = template.createEmbeddedView(this.getContext());
    this.appRef?.attachView(this.viewRef);

    this.templateElements = this.viewRef.rootNodes as HTMLElement[];

    for (const node of this.templateElements) {
      this.element.appendChild(node);
    }
  }
}
