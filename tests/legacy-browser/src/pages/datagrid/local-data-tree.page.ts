/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-browser/src/lib/components/ac-datagrid/css/ac-datagrid.css';
import './../../../../../packages/browser/ac-browser/src/lib/components/ac-pagination/css/ac-pagination.css';
import { AcDatagrid, AcDatagridApi, AC_DATAGRID_EVENT, AcEnumDataSourceType } from '@autocode-ts/ac-browser';

export class DatagridLocalDataTree extends HTMLElement {
  public static observedAttributes = [];
  datagrid!: AcDatagrid;
  datagridApi!:AcDatagridApi;

  async connectedCallback() {
    const html = `
      <h5>Datagrid : Tree Offline Data</h5>
      <div class="local-datagrid-container" style="height:80vh;"></div>
    `;
    this.innerHTML = html;
    this.datagrid = new AcDatagrid();
    this.datagridApi = this.datagrid.datagridApi;
    this.datagridApi.events.subscribeAllEvents({callback:(eventName:string,eventArgs:any)=>{
      const rowEvents:any[]  = [
        // AC_DATAGRID_EVENT.RowDrag,
        AC_DATAGRID_EVENT.RowDragDrop,
        // AC_DATAGRID_EVENT.RowDragEnd,
        // AC_DATAGRID_EVENT.RowDragEnter,
        // AC_DATAGRID_EVENT.RowDragLeave,
        AC_DATAGRID_EVENT.RowDragOver,
        // AC_DATAGRID_EVENT.RowDragStart,
        // AC_DATAGRID_EVENT.RowMouseEnter,
        // AC_DATAGRID_EVENT.RowMouseLeave,
      ];
      if(rowEvents.includes(eventName)){
          console.log(`Event triggered => ${eventName} on ${eventArgs.datagridRow.data.name}`);
          // console.log(eventArgs.datagridRow.data.name);;
        }
    }})
    // this.datagridApi.allowRowDrag = true;
    // this.datagridApi.treeDataParentKey = 'category_id';
    // this.datagridApi.treeDataChildKey = 'parent_category_id';
    this.datagridApi.usePagination = false;
    this.datagrid.datagridApi.dataSourceType = AcEnumDataSourceType.Offline;
    console.log(this.getElementsByClassName("local-datagrid-container"));
    this.getElementsByClassName("local-datagrid-container")[0].append(this.datagrid.element);
    this.datagridApi.columnDefinitions = [
      {field:'name',title:"Name",width:300},
      {field:'description',title:"Description",width:900},
      {field:'category_id',title:"Id"},
      {field:'parent_category_id',title:"Parent Id"},
      {field:'level',title:"Level"}
    ];
    const res = await fetch('http://autocode.localhost/tests/ac-web/mvc-test/api/product_categories/get?page_size=1500');
    if(res.ok){
      const response = await res.json();
      this.datagridApi.data = response.rows;
    }

    console.log(this.datagrid);
  }
}
