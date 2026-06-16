/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { stringEqualsIgnoreCase } from "@autocode-ts/ac-extensions";
import { IAcDatagridCell, IAcDatagridRow, AC_DATAGRID_HOOK } from "../../../_ac-datagrid.export";
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";
import { AC_DATAGRID_AUTO_SAVE_EVENT_NAME, AC_DATAGRID_AUTO_SAVE_HOOK_NAME } from "../_auto-save-row.export";
import { AC_DATA_MANAGER_HOOK, AcDelayedCallback, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { IAcDatagridAutoSaveRowData } from "../interfaces/ac-datagrid-auto-save-row-data.interface";
import { IAcDatagridAutoSaveRequestArgs } from "../interfaces/ac-datagrid-auto-save-request-args.interface";
import { IAcDatagridAutoSaveResponseArgs } from "../interfaces/ac-datagrid-auto-save-response-args.interface";

export class AcDatagridAutoSaveRowExtension extends AcDatagridExtension {
  private _autoSaveDuration: number = 1000;
  get autoSaveDuration(): number {
    return this._autoSaveDuration;
  }
  set autoSaveDuration(value: number) {
    this._autoSaveDuration = value;
    if (this.datagridApi) {
      this.datagridApi.hooks.execute({
        hook: AC_DATAGRID_AUTO_SAVE_HOOK_NAME.AutoSaveRowDurationChange, args: {
          value, datagridApi: this.datagridApi
        }
      });
    }
  }

  private _autoSaveFunction?: (args: IAcDatagridAutoSaveRequestArgs) => void;
  get autoSaveFunction(): ((args: IAcDatagridAutoSaveRequestArgs) => void) | undefined {
    return this._autoSaveFunction;
  }
  set autoSaveFunction(value: (args: IAcDatagridAutoSaveRequestArgs) => void) {
    this._autoSaveFunction = value;
    if (this.datagridApi) {
      this.datagridApi.hooks.execute({
        hook: AC_DATAGRID_AUTO_SAVE_HOOK_NAME.AutoSaveRowFunctionChange, args: {
          value, datagridApi: this.datagridApi
        }
      });
    }
  }

  private _autoSaveRow: boolean = false;
  get autoSaveRow(): boolean {
    return this._autoSaveRow;
  }
  set autoSaveRow(value: boolean) {
    this._autoSaveRow = value;
    if (this.datagridApi) {
      this.datagridApi.hooks.execute({
        hook: AC_DATAGRID_AUTO_SAVE_HOOK_NAME.AutoSaveRowValueChange, args: {
          value, datagridApi: this.datagridApi
        }
      });
    }
  }

  private delayedCallback: AcDelayedCallback = new AcDelayedCallback();

  override destroy(): void {
    this.delayedCallback.destroy();
    acNullifyInstanceProperties({ instance: this });
  }

  override handleHook({ hook, args }: { hook: string; args: any; }): void {
    if (this.datagridApi) {
      if (stringEqualsIgnoreCase(hook, AC_DATA_MANAGER_HOOK.RowCreate)) {
        const datagridRow: IAcDatagridRow = args.datagridRow;
        const extensionData: IAcDatagridAutoSaveRowData = {
          status: "NOT_CHANGED",
        };
        datagridRow.extensionData['autoSaveRow'] = extensionData;
        this.datagridApi.events.execute({
          event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
            datagridApi: this.datagridApi,
            datagridRow
          }
        });
      }
      else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.CellValueChange)) {
        if (this.autoSaveRow) {
          const datagridCell: IAcDatagridCell = args.datagridCell;
          const datagridRow: IAcDatagridRow = datagridCell.datagridRow;
          const rowId = datagridRow.rowId;
          const extensionData: IAcDatagridAutoSaveRowData = datagridRow.extensionData['autoSaveRow'];
          extensionData.lastChangeTime = new Date();
          extensionData.status = "CHANGED";
          this.datagridApi.events.execute({
            event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
              datagridApi: this.datagridApi,
              datagridRow
            }
          });
          this.delayedCallback.add({
            callback: () => {
              this.saveRow({ datagridRow })
            }, duration: this.autoSaveDuration, key: rowId
          });
        }
      }
      else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.ActiveCellChange)) {
        if (this.autoSaveRow) {
          const datagridCell: IAcDatagridCell = this.datagridApi.activeDatagridCell!;
          const datagridRow: IAcDatagridRow = datagridCell.datagridRow;
          this.resetTimeoutForRow({ datagridRow });
        }
      }
      else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowKeyUp)) {
        if (this.autoSaveRow) {
          const datagridRow: IAcDatagridRow = args.datagridRow;
          this.resetTimeoutForRow({ datagridRow });
        }
      }
    }
  }

  private resetTimeoutForRow({ datagridRow }: { datagridRow: IAcDatagridRow }) {
    const rowId = datagridRow.rowId;
    this.delayedCallback.reset({
      callback: () => {
        this.saveRow({ datagridRow })
      }, duration: this.autoSaveDuration, key: rowId
    });
  }

  private async saveRow({ datagridRow }: { datagridRow: IAcDatagridRow }) {
    if (this.datagridApi) {
      const extensionData: IAcDatagridAutoSaveRowData = datagridRow.extensionData['autoSaveRow'];
      extensionData.status = 'SAVING';
      this.datagridApi.events.execute({
        event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
          datagridApi: this.datagridApi,
          datagridRow
        }
      });
      const rowId = datagridRow.rowId;
      if (this.autoSaveFunction) {
        await new Promise<any>(
          (resolve) => {
            const requestArgs: IAcDatagridAutoSaveRequestArgs = {
              datagridRow,
              datagridApi: this.datagridApi!,
              successCallback: (responseArgs: IAcDatagridAutoSaveResponseArgs) => {
                extensionData.status = 'SAVED';
                this.datagridApi.events.execute({
                  event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
                    datagridApi: this.datagridApi,
                    datagridRow
                  }
                });
                this.datagridApi!.updateRow({ data: responseArgs.savedData, rowId });
                resolve(null);
              },
              errorCallback: () => {
                extensionData.status = 'ERROR';
                this.datagridApi.events.execute({
                  event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
                    datagridApi: this.datagridApi,
                    datagridRow
                  }
                });
                resolve(null);
              }
            };
            this.autoSaveFunction!(requestArgs);
          }
        );
      }
    }
  }
}

export const AC_DATAGRID_AUTO_SAVE_ROW_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.AutoSaveRow,
  extensionClass: AcDatagridAutoSaveRowExtension
}
