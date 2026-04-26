/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridElement, AcDatagridApi, AcDatagridSelectInputElement, AcInputBase, AcMessage } from "@autocode-ts/ac-browser";
import { AcDataManager, IAcFilterGroup } from "@autocode-ts/autocode";
import { AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME } from "@autocode-ts/ac-datagrid-on-ag-grid";

export class AppDatagridSelectInputBase extends AcInputBase {
  override inputElement: AcDatagridSelectInputElement = new AcDatagridSelectInputElement();
  datagrid?: AcDatagridElement;
  datagridApi?: AcDatagridApi;
  dataManager?: AcDataManager;
  filterGroup?: IAcFilterGroup;
  private saveStateTimeout: any;
  private ignoreStateChange: boolean = true;
  private settingId: any;
  stateSettingKey: string = '';
  onDemandFunction?:any;
  data?:any[];

  private get settingName(): string {
    return `UIUX[DATAGRID_SELECT][${this.stateSettingKey}]`;
  }

  apiUrl: string = '';
  override init(): void {
    super.init();
    this.inputElement.dispatchEvent = this.dispatchEvent;
    this.inputElement.addEventListener('stateChange', () => {
      this.saveInputState();
    });
    this.datagrid = this.inputElement.datagrid;
    this.datagridApi = this.datagrid!.datagridApi;
    this.datagridApi.rowHeight = 30;
    this.datagridApi.headerHeight = 30;
    this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME })
    this.dataManager = this.datagridApi.dataManager;
    this.datagridApi.usePagination = true;
    this.restorePreviousState();
  }

  override destroy(): void {
    if(this.inputElement){
      this.inputElement.destroy();
    }
    super.destroy();
  }

  private async restorePreviousState() {
    // const filters: IAcFilterGroup = {
    //   filters: [
    //     {
    //       key: TblActAccounteeSettings.AccounteeSettingName,
    //       operator: AcEnumConditionOperator.EqualTo,
    //       value: this.settingName
    //     },
    //     {
    //       key: TblActAccounteeSettings.AccounteeId,
    //       operator: AcEnumConditionOperator.EqualTo,
    //       value: App.activeAccounteeId
    //     }
    //   ],
    //   operator: AcEnumLogicalOperator.And
    // };
    // const response: IAcDataCacheGetResult = await App.dataCache.getRows({ collection: Tables.ActAccounteeSettings, filters });
    // if (response.rows && response.rows.length > 0) {
    //   this.settingId = response.rows[0][TblActAccounteeSettings.AccounteeSettingId];
    //   this.inputElement.setState({ state: JSON.parse(response.rows[0][TblActAccounteeSettings.AccounteeSettingTextValue]) });
    // }
    this.setDatagridData();
    setTimeout(() => {
      this.ignoreStateChange = false;
    }, 500);
  }

  private saveInputState() {
    if (!this.ignoreStateChange) {

      clearTimeout(this.saveStateTimeout);
      this.saveStateTimeout = setTimeout(async () => {
        this.ignoreStateChange = true;
        // const row: any = {
        //   [TblActAccounteeSettings.AccounteeSettingName]: this.settingName,
        //   [TblActAccounteeSettings.AccounteeId]: App.activeAccounteeId,
        //   [TblActAccounteeSettings.AccounteeSettingTextValue]: JSON.stringify(this.inputElement.getState())
        // };
        // if (this.settingId) {
        //   row[TblActAccounteeSettings.AccounteeSettingId] = this.settingId;
        // }
        // const httpResponse: IApiHttpResponse = await App.httpClient.postApi({ url: API_URLS.accounteeSettings.save, data: { row: row }, showLoader: false });
        // if (httpResponse.status == AcEnumHttpResponseCode.Ok) {
        //   const apiResponse: IApiResponse = httpResponse.data!;
        //   if (apiResponse.status == 'success') {
        //     if (apiResponse.data.rows && apiResponse.data.rows.length > 0) {
        //       App.dataCache.updateRow({ collection: Tables.ActAccounteeSettings, data: apiResponse.data.rows[0], addIfMissing: true });
        //       this.settingId = apiResponse.data.rows[0][TblActAccounteeSettings.AccounteeSettingId];
        //     }
        //   }
        //   else {
        //     AcMessage.error({ message: apiResponse.message ?? 'Error getting previous datagrid state' });
        //   }
        // }
        // else {
        //   AcMessage.error({ message: App.getHTTPResponseMessage({ response: httpResponse }) });
        // }
        setTimeout(() => {
          this.ignoreStateChange = false;
        }, 50);
      }, 200);
    }
  }

  protected setDatagridData() {
    if (this.datagridApi) {
      if(this.onDemandFunction){
        this.datagridApi.dataManager.onDemandFunction = this.onDemandFunction;
      }
      if(this.data){
        this.datagridApi.dataManager.data = this.data;
      }
      this.inputElement.value = this.value;
    }
  }

}
