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
          const datagridCell: IAcDatagridCell = args?.datagridCell;
          const datagridRow: IAcDatagridRow = datagridCell?.datagridRow ?? args?.datagridRow;
          if (!datagridRow) return;
          const rowId = datagridRow.rowId;
          if (!datagridRow.extensionData) {
            datagridRow.extensionData = {};
          }
          let extensionData: IAcDatagridAutoSaveRowData = datagridRow.extensionData['autoSaveRow'];
          if (!extensionData) {
            extensionData = {
              status: "NOT_CHANGED",
            };
            datagridRow.extensionData['autoSaveRow'] = extensionData;
          }
          if (!extensionData.pendingDirtyKeys) {
            extensionData.pendingDirtyKeys = new Set<string>();
          }
          const columnKey = datagridCell?.datagridColumn?.columnKey;
          if (columnKey) {
            extensionData.pendingDirtyKeys.add(columnKey);
          }
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
          const datagridRow: IAcDatagridRow = datagridCell?.datagridRow;
          if (datagridRow) {
            this.resetTimeoutForRow({ datagridRow });
          }
        }
      }
      else if (stringEqualsIgnoreCase(hook, AC_DATAGRID_HOOK.RowKeyUp)) {
        if (this.autoSaveRow) {
          const datagridRow: IAcDatagridRow = args?.datagridRow;
          if (datagridRow) {
            this.resetTimeoutForRow({ datagridRow });
          }
        }
      }
    }
  }

  private resetTimeoutForRow({ datagridRow }: { datagridRow: IAcDatagridRow }) {
    if (!datagridRow) return;
    const rowId = datagridRow.rowId;
    if (datagridRow.extensionData && datagridRow.extensionData['autoSaveRow']) {
      this.delayedCallback.reset({
        callback: () => {
          this.saveRow({ datagridRow })
        }, duration: this.autoSaveDuration, key: rowId
      });
    }
  }

  private async saveRow({ datagridRow }: { datagridRow: IAcDatagridRow }) {
    if (this.datagridApi && datagridRow) {
      if (!datagridRow.extensionData) {
        datagridRow.extensionData = {};
      }
      let extensionData: IAcDatagridAutoSaveRowData = datagridRow.extensionData['autoSaveRow'];
      if (!extensionData) {
        extensionData = { status: 'NOT_CHANGED' };
        datagridRow.extensionData['autoSaveRow'] = extensionData;
      }
      // If already saving this row, do not run concurrent save requests.
      // New modifications are tracked in pendingDirtyKeys and will be saved when the in-flight save completes.
      if (extensionData.isSaving) {
        return;
      }

      extensionData.isSaving = true;
      extensionData.status = 'SAVING';
      extensionData.inFlightKeys = new Set(extensionData.pendingDirtyKeys ?? []);
      extensionData.pendingDirtyKeys?.clear();

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
            let settled = false;

            const timeoutId = setTimeout(() => {
              if (!settled) {
                console.warn(`[AcDatagridAutoSaveRowExtension] Auto-save timed out for row ${rowId}`);
                handleError(new Error('Auto-save timeout'));
              }
            }, 30000);

            const handleSuccess = (responseArgs: IAcDatagridAutoSaveResponseArgs) => {
              if (settled) return;
              settled = true;
              clearTimeout(timeoutId);

              extensionData.isSaving = false;
              extensionData.inFlightKeys?.clear();

              const pendingKeys = extensionData.pendingDirtyKeys ?? new Set<string>();

              // Smart Merge: Apply returned savedData to datagridRow.data for fields NOT modified since save began
              if (responseArgs?.savedData && typeof responseArgs.savedData === 'object') {
                for (const [key, value] of Object.entries(responseArgs.savedData)) {
                  if (!pendingKeys.has(key)) {
                    datagridRow.data[key] = value;
                  }
                }
              }

              // Sync dataManager's row reference with the merged data
              this.datagridApi!.dataManager?.updateRow({ data: datagridRow.data, rowId });

              // Refresh cells that are not dirty and not currently being edited by user
              const activeCellId = this.datagridApi?.activeDatagridCell?.cellId;
              const rowEl: any = (datagridRow.element as any) ?? this.datagridApi?.datagrid?.datagridBody?.currentRows?.find((r: any) => r.datagridRow?.rowId === datagridRow.rowId);
              const cellsToRefresh = rowEl?.datagridCells ?? datagridRow.datagridCells ?? [];

              for (const cell of cellsToRefresh) {
                const cellKey = cell.datagridColumn?.columnKey;
                if (cellKey && pendingKeys.has(cellKey)) {
                  continue; // Skip fields modified after save started
                }
                const cellEl = cell.element ?? cell;
                if (cell.cellId === activeCellId || (cellEl && typeof cellEl.contains === 'function' && cellEl.contains(document.activeElement))) {
                  continue; // Skip active focused input
                }
                if (typeof cell.refresh === 'function') {
                  cell.refresh();
                } else if (cell.element && typeof cell.element.refresh === 'function') {
                  cell.element.refresh();
                }
              }

              if (pendingKeys.size > 0) {
                // User made modifications while saving was in-flight!
                extensionData.status = 'CHANGED';
                this.datagridApi!.events.execute({
                  event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
                    datagridApi: this.datagridApi,
                    datagridRow
                  }
                });
                // Trigger follow-up save for pending modifications
                this.delayedCallback.add({
                  callback: () => {
                    this.saveRow({ datagridRow });
                  },
                  duration: this.autoSaveDuration,
                  key: rowId
                });
              } else {
                extensionData.status = 'SAVED';
                this.datagridApi!.events.execute({
                  event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
                    datagridApi: this.datagridApi,
                    datagridRow
                  }
                });
              }

              resolve(null);
            };

            const handleError = (err?: any) => {
              if (settled) return;
              settled = true;
              clearTimeout(timeoutId);

              // Restore inFlightKeys back into pendingDirtyKeys on error
              if (extensionData.inFlightKeys) {
                if (!extensionData.pendingDirtyKeys) {
                  extensionData.pendingDirtyKeys = new Set<string>();
                }
                for (const key of extensionData.inFlightKeys) {
                  extensionData.pendingDirtyKeys.add(key);
                }
                extensionData.inFlightKeys.clear();
              }
              extensionData.isSaving = false;
              extensionData.status = 'ERROR';
              this.datagridApi!.events.execute({
                event: AC_DATAGRID_AUTO_SAVE_EVENT_NAME.AutoSaveRowStatusChange, args: {
                  datagridApi: this.datagridApi,
                  datagridRow
                }
              });
              resolve(null);
            };

            const requestArgs: IAcDatagridAutoSaveRequestArgs = {
              datagridRow,
              datagridApi: this.datagridApi!,
              successCallback: handleSuccess,
              errorCallback: handleError
            };

            try {
              const result: any = this.autoSaveFunction!(requestArgs);
              if (result && typeof result.then === 'function') {
                result.then((res: any) => {
                  if (!settled) {
                    if (res && typeof res === 'object' && ('savedData' in res || 'data' in res)) {
                      handleSuccess(res?.savedData ? res : { savedData: res?.data ?? res });
                    } else if (res === false) {
                      handleError(new Error('Save failed'));
                    } else {
                      // If the async function completed and did not invoke successCallback or errorCallback
                      handleError(new Error('autoSaveFunction completed without reporting status'));
                    }
                  }
                }).catch((err: any) => {
                  if (!settled) {
                    handleError(err);
                  }
                });
              }
            } catch (err) {
              if (!settled) {
                handleError(err);
              }
            }
          }
        );
      } else {
        extensionData.isSaving = false;
      }
    }
  }
}

export const AC_DATAGRID_AUTO_SAVE_ROW_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.AutoSaveRow,
  extensionClass: AcDatagridAutoSaveRowExtension
}
