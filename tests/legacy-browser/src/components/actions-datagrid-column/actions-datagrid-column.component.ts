import { acAddClassToElement, AcDatagridApi, IAcDatagridCell, IAcDatagridCellRendererElement, IAcDatagridCellElementArgs } from "@autocode-ts/ac-browser";

export class ActionsDatagridColumn implements IAcDatagridCellRendererElement{
  datagridApi!:AcDatagridApi;
  datagridCell!:IAcDatagridCell;
  element:HTMLDivElement = document.createElement('div');
  deleteButton:HTMLButtonElement = document.createElement('button');
  editButton:HTMLButtonElement = document.createElement('button');

  destroy?(): void {
    this.element.remove();
  }

  getElement(): HTMLElement {
    return this.element;
  }

  init(args: IAcDatagridCellElementArgs): void {
    this.datagridApi = args.datagridApi;
    this.datagridCell = args.datagridCell;
    this.initElement();
  }

  initElement(){
    this.editButton.setAttribute('type','button');
    acAddClassToElement({'class_':'btn btn-primary btn-sm',element:this.editButton});
    this.element.append(this.editButton);
    this.editButton.innerHTML = `<i class="fa fa-pencil"></i>`;
    this.editButton.addEventListener('click',()=>{
      // alert('Row Edit Clicked');
    })

    this.deleteButton.setAttribute('type','button');
    acAddClassToElement({'class_':'btn btn-danger btn-sm',element:this.deleteButton});
    this.element.append(this.deleteButton);
    this.deleteButton.innerHTML = `<i class="fa fa-trash"></i>`;
    this.deleteButton.addEventListener('click',()=>{
      // alert('Row Delete Clicked');
      this.datagridApi.deleteRow({rowId:this.datagridCell.datagridRow.rowId});
    })

  }

  refresh(args: IAcDatagridCellElementArgs): void {
    console.log("Refreshing data",args);
  }

}
