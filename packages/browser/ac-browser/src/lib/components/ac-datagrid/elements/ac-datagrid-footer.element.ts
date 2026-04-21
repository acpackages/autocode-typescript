import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_HOOK } from "../_ac-datagrid.export";
import { AcDatagridCssClassName } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";


export class AcDatagridFooter extends AcElementBase {
  private _datagridApi?: AcDatagridApi;
  get datagridApi(): AcDatagridApi|undefined {
    return this._datagridApi;
  }
  set datagridApi(value: AcDatagridApi) {
    this._datagridApi = value;
  }

  searchInput:HTMLInputElement = this.ownerDocument.createElement('input');
  paginationContainer: HTMLElement = this.ownerDocument.createElement('div');
  searchContainer: HTMLElement = this.ownerDocument.createElement('div');

  override init(): void {
    super.init();
    this.append(this.paginationContainer);
    this.append(this.searchContainer);
    this.setPagination();
    this.setSearchInput();
    this.datagridApi?.hooks.execute({hook:AC_DATAGRID_HOOK.FooterInit});
  }

  setPagination() {
    acClearElement({element:this.paginationContainer});
    if (this.datagridApi && this.datagridApi.usePagination && this.datagridApi.pagination) {
      this.datagridApi.pagination.style.paddingRight = '10px';
      this.datagridApi.pagination.style.marginRight = '5px';
      this.datagridApi.pagination.style.borderRight = 'solid 1px #ccc';
      acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridFooterPaginationContainer, element: this.paginationContainer });
      this.paginationContainer.append(this.datagridApi.pagination);
    }
  }

  setSearchInput(){
    this.searchContainer.style.display = 'inline-block';
    acClearElement({element:this.searchContainer});
    this.searchContainer.append(this.searchInput);
    this.searchInput.classList.add('ac-datagrid-search-input');
    this.searchInput.placeholder = "Search rows...";
    this.searchInput.addEventListener('input',(event)=>{
      this.delayedCallback.add({callback:() => {
        if(this.datagridApi){
          this.datagridApi.dataManager.searchQuery = this.searchInput.value;
        }
      }, duration:300,key:'searchInput'});
    });
  }
}

acRegisterCustomElement({tag:'ac-datagrid-footer',type:AcDatagridFooter});
