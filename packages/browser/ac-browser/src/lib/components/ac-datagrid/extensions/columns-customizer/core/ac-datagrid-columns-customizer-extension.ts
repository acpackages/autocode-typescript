/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { AcEnumDatagridColumnsCustomizerHook } from "../enums/ac-enum-datagrid-columns-customizer-hook.enum";
import { IAcDatagridColumnsCustomizerHookArgs } from "../interfaces/ac-datagrid-columns-customizer-hook-args.interface";

export class AcDatagridColumnsCustomizerExtension extends AcDatagridExtension {
  private _showColumnCustomizerPanel: boolean = false;
  get showColumnCustomizerPanel(): boolean {
    return this._showColumnCustomizerPanel;
  }
  set showColumnCustomizerPanel(value: boolean) {
    this._showColumnCustomizerPanel = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridColumnsCustomizerHookArgs = {
        datagridApi: this.datagridApi,
        datagridColumnsCustomizerExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridColumnsCustomizerHook.ShowColumnsCustomizerPanelChange, args: hookArgs });
    }
  }

  private _isCustomizerOpen: boolean = false;
  get isCustomizerOpen(): boolean {
    return this._isCustomizerOpen;
  }
  set isCustomizerOpen(value: boolean) {
    this._isCustomizerOpen = value;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridColumnsCustomizerHookArgs = {
        datagridApi: this.datagridApi,
        datagridColumnsCustomizerExtension: this,
        value: value
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridColumnsCustomizerHook.IsCustomizerOpenChange, args: hookArgs });
    }
  }

  toggleColumnsCustomizer() {
    this.isCustomizerOpen = !this.isCustomizerOpen;
    if (this.datagridApi) {
      const hookArgs: IAcDatagridColumnsCustomizerHookArgs = {
        datagridApi: this.datagridApi,
        datagridColumnsCustomizerExtension: this,
        value: this.isCustomizerOpen
      };
      this.datagridApi.hooks.execute({ hook: AcEnumDatagridColumnsCustomizerHook.ToggleColumnsCustomizerPanel, args: hookArgs });
    }
  }
}

export const AC_DATAGRID_COLUMNS_CUSTOMIZER_EXTENSION: IAcDatagridExtension = {
  extensionName: 'COLUMNS_CUSTOMIZER',
  extensionClass: AcDatagridColumnsCustomizerExtension
}
