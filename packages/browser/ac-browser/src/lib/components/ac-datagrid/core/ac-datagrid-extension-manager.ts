/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AC_DATAGRID_AFTER_ROWS_FOOTER_EXTENSION } from "../extensions/after-rows-footer/core/ac-datagrid-after-rows-footer-extension";
import { AC_DATAGRID_AUTO_ADD_NEW_ROW_EXTENSION } from "../extensions/auto-add-new-row/core/ac-datagrid-auto-add-new-row-extension";
import { AC_DATAGRID_AUTO_SAVE_ROW_EXTENSION } from "../extensions/auto-save-row/core/ac-datagrid-auto-save-row-extension";
import { AC_DATAGRID_COLUMN_DRAGGING_EXTENSION } from "../extensions/column-dragging/core/ac-datagrid-column-dragging-extension";
import { AC_DATAGRID_COLUMNS_CUSTOMIZER_EXTENSION } from "../extensions/columns-customizer/core/ac-datagrid-columns-customizer-extension";
import { AC_DATAGRID_DATA_EXPORT_XLSX_EXTENSION, AC_DATAGRID_DATA_EXPORT_EXTENSION, AC_DATAGRID_DATA_EXPORT_CSV_EXTENSION } from "../extensions/data-export-xlsx/core/ac-datagrid-data-export-xlsx-extension";
import { AC_DATAGRID_KEYBOARD_ACTIONS_EXTENSION } from "../extensions/keyboard-actions/core/ac-datagrid-keyboard-actions-extension";
import { AC_DATAGRID_ROW_DRAGGING_EXTENSION } from "../extensions/row-dragging/core/ac-datagrid-row-dragging-extension";
import { AC_DATAGRID_ROW_NUMBERS_EXTENSION } from "../extensions/row-numbers/core/ac-datagrid-row-numbers-extension";
import { AC_DATAGRID_ROW_SELECTION_EXTENSION } from "../extensions/row-selection/core/ac-datagrid-row-selection-extension";
import { AC_DATAGRID_TREE_TABLE_EXTENSION } from "../extensions/tree-table/core/ac-datagrid-tree-table-extension";
import { IAcDatagridExtension } from "../interfaces/ac-datagrid-extension.interface";
import { AcDatagridExtension } from "./ac-datagrid-extension";

export class AcDatagridExtensionManager {
  private static builtInExtensionsRegistered:boolean = false;
  private static extensions: Record<string, IAcDatagridExtension<any>> = {};

  static hasExtension({extensionName}:{extensionName:string}):boolean {
    return this.extensions[extensionName] != undefined;
  }

  static register<T extends AcDatagridExtension>(ext: IAcDatagridExtension<T>): void {
    if (this.extensions[ext.extensionName]) {
      console.warn(`Extension ${ext.extensionName} is already registered. Overwriting.`);
    }
    this.extensions[ext.extensionName] = ext;
  }

  static createInstance<T extends AcDatagridExtension = AcDatagridExtension>({extensionName}:{extensionName:string}): T | null {
    const entry = this.extensions[extensionName];
    if (!entry) return null;
    return new entry.extensionClass();
  }

  static registerBuiltInExtensions(){
    if(!this.builtInExtensionsRegistered){
      AcDatagridExtensionManager.register(AC_DATAGRID_AFTER_ROWS_FOOTER_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_AUTO_ADD_NEW_ROW_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_AUTO_SAVE_ROW_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_COLUMNS_CUSTOMIZER_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_COLUMN_DRAGGING_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_DATA_EXPORT_XLSX_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_DATA_EXPORT_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_DATA_EXPORT_CSV_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_KEYBOARD_ACTIONS_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_ROW_DRAGGING_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_ROW_NUMBERS_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_ROW_SELECTION_EXTENSION);
      AcDatagridExtensionManager.register(AC_DATAGRID_TREE_TABLE_EXTENSION);
      this.builtInExtensionsRegistered = true;
    }
  }
}
