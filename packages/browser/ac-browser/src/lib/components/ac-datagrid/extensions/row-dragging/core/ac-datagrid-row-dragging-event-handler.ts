import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AcDatagridApi, IAcDatagridRow, AC_DATAGRID_EVENT, IAcDatagridRowEvent } from "../../../_ac-datagrid.export";
import { AcDatagridRowDraggingExtension } from "./_core.export";

export class AcDatagridRowDraggingEventHandler {
  datagridApi?: AcDatagridApi;
  rowDraggingExtension?: AcDatagridRowDraggingExtension;

  destroy(){
    acNullifyInstanceProperties({instance:this});
  }

  handleRowDrag({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDrag, args: eventArgs });
  }

  //  handleRowDragCancel({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
  //   const eventArgs: IAcDatagridRowEvent = {
  //     datagridApi: this.datagridApi,
  //     datagridRow: datagridRow,
  //     event: event
  //   };
  //   this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragEnd, args: eventArgs });
  // }

  // handleRowDragDrop({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
  //   const eventArgs: IAcDatagridRowEvent = {
  //     datagridApi: this.datagridApi,
  //     datagridRow: datagridRow,
  //     event: event
  //   };
  //   this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragDrop, args: eventArgs });
  // }

  handleRowDragEnd({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    console.log(eventArgs);
    this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragEnd, args: eventArgs });
  }

  // handleRowDragEnter({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
  //   const eventArgs: IAcDatagridRowEvent = {
  //     datagridApi: this.datagridApi,
  //     datagridRow: datagridRow,
  //     event: event
  //   };
  //   this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragEnter, args: eventArgs });
  // }

  // handleRowDragLeave({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
  //   const eventArgs: IAcDatagridRowEvent = {
  //     datagridApi: this.datagridApi,
  //     datagridRow: datagridRow,
  //     event: event
  //   };
  //   this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragLeave, args: eventArgs });
  // }

  // handleRowDragOver({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
  //   const eventArgs: IAcDatagridRowEvent = {
  //     datagridApi: this.datagridApi,
  //     datagridRow: datagridRow,
  //     event: event
  //   };
  //   this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragOver, args: eventArgs });
  // }

  // handleRowDragStart({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
  //   const eventArgs: IAcDatagridRowEvent = {
  //     datagridApi: this.datagridApi,
  //     datagridRow: datagridRow,
  //     event: event
  //   };
  //   this.datagridApi.events.execute({ event: AC_DATAGRID_EVENT.RowDragStart, args: eventArgs });
  // }

  init({ rowDraggingExtension }: { rowDraggingExtension: AcDatagridRowDraggingExtension }){
    this.rowDraggingExtension = rowDraggingExtension;
    this.datagridApi = rowDraggingExtension.datagridApi;
  }
}
