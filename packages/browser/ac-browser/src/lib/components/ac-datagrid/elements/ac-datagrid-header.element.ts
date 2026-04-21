/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { IAcDatagridColumn } from "../_ac-datagrid.export";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { AC_DATAGRID_HOOK } from "../consts/ac-datagrid-hook.const";
import { IAcDatagridHeaderHookArgs } from "../interfaces/hook-args/ac-datagrid-header-hook-args.interface";
import { AcDatagridHeaderCellElement } from "./ac-datagrid-header-cell.element";


export class AcDatagridHeader extends AcElementBase{
  private _datagridApi!: AcDatagridApi;
  get datagridApi():AcDatagridApi{
    return this._datagridApi;
  }
  set datagridApi(value:AcDatagridApi){
    this._datagridApi = value;
    value.on({event:AC_DATAGRID_EVENT.ColumnDefinitionsSet,callback:()=>{
      this.setColumns();
    }});
  }

  datagridHeaderCells:AcDatagridHeaderCellElement[] = [];

  constructor(){
    super();
    this.style.display = "flex";
    this.style.overflowX = 'hidden';
    this.style.width = '100%';
    this.style.minHeight = 'max-content';
  }

  override init(): void {
    super.init();
    if(this.datagridApi){
      this.datagridApi.hooks.execute({hook:AC_DATAGRID_HOOK.HeaderInit});
    }
  }

  setColumns(){
    acClearElement({element:this});
    const hookArgs:IAcDatagridHeaderHookArgs = {
      datagridHeader:this,
      datagridApi:this.datagridApi
    };
    this.datagridHeaderCells = [];
    this.datagridApi.hooks.execute({hook:AC_DATAGRID_HOOK.BeforeHeaderColumnCellsCreate,args:hookArgs});
    for(const column of this.datagridApi.datagridColumns){
      const headerCell = new AcDatagridHeaderCellElement();
      headerCell.datagridApi = this.datagridApi;
      headerCell.datagridColumn = column;
      if(column.visible){
        this.append(headerCell);
      }
      this.datagridHeaderCells.push(headerCell);
    }
    this.datagridApi.hooks.execute({hook:AC_DATAGRID_HOOK.HeaderColumnCellsCreate,args:hookArgs});
    this.setFlexColumnWidth();
  }

  setFlexColumnWidth(){
    const flexColumns:IAcDatagridColumn[] = [];
    let currentTotalWidth:number = 0;
    for(const column of this.datagridApi.datagridColumns){
      if(column.visible){
        if(column.columnDefinition.flexSize != undefined){
          flexColumns.push(column);
        }
        else{
          currentTotalWidth+=column.width;
        }
      }
    }
    const fillWidth = this.datagridApi.bodyWidth - currentTotalWidth - 20;
    if(fillWidth > 0){
      for(const column of flexColumns){
        column.width = fillWidth * column.columnDefinition.flexSize!;
      }
    }
  }
}

acRegisterCustomElement({tag:'ac-datagrid-header',type:AcDatagridHeader});
