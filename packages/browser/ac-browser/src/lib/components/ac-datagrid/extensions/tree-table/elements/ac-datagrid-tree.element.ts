/* eslint-disable @typescript-eslint/no-inferrable-types */

import { AcEnumCollapseEvent } from "../../../../ac-collapse/_ac-collapse.export";
import { AcCollapse } from "../../../../ac-collapse/elements/ac-collapse.element";
import { acAddClassToElement } from "../../../../../utils/ac-element-functions";
import { AcDatagridApi } from "../../../core/ac-datagrid-api";
import { AcDatagridRowElement } from "../../../elements/ac-datagrid-row.element";
import { IAcDatagridRow } from "../../../interfaces/ac-datagrid-row.interface";
import { AcDatagridTreeTableCssClassName } from "../consts/ac-datagrid-tree-table-css-class-name.const";
import { AcDatagridTreeTableDefaultConfig } from "../consts/ac-datagrid-tree-table-default-config.const";

export class AcDatagridTree {
  collapse?:AcCollapse;
  datagridApi: AcDatagridApi;
  datagridRow!: IAcDatagridRow;
  element: HTMLElement = document.createElement('div');
  hasChildren:boolean = false;
  isOpen:boolean = false;
  treeDatagridContainer: HTMLElement = document.createElement('div');

  constructor({ datagridApi, datagridRow }: { datagridApi: AcDatagridApi, datagridRow: IAcDatagridRow }) {
    this.datagridRow = datagridRow;
    this.datagridApi = datagridApi;
    this.initElement();
  }

  close(){
    this.isOpen = false;
  }

  initElement() {
    acAddClassToElement({ class_: AcDatagridTreeTableCssClassName.acDatagridTree, element: this.element });
    acAddClassToElement({ class_: AcDatagridTreeTableCssClassName.acDatagridTreeChildrenContainer, element: this.treeDatagridContainer });
    this.treeDatagridContainer.style.paddingLeft = `${AcDatagridTreeTableDefaultConfig.treeChildPadding}px`;
    this.element.append(this.treeDatagridContainer);
    this.setTreeChildrenRows();
    this.collapse = new AcCollapse();
    this.collapse.on({event:AcEnumCollapseEvent.Toggle,callback:()=>{
      if(this.collapse){
        this.isOpen = this.collapse.isOpen;
      }
      if(this.datagridRow.element){
        // if(this.datagridRow.instance.datagridTreeChildrenToggle){
        //   this.datagridRow.instance.datagridTreeChildrenToggle.render();
        // }
      }
    }});
  }

  open(){
    this.isOpen = true;
  }

  setToggleElement({element}:{element:HTMLElement}){
    if(this.collapse){
      this.collapse.setToggleElement({element:element});
    }
  }

  setTreeChildrenRows(){
    this.hasChildren = false;
  }

  toggle(){
    if(this.isOpen){
      this.close();
    }
    else{
      this.open();
    }
  }

}
