import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AC_DATAGRID_EVENT } from "../consts/ac-datagrid-event.const";
import { AcDatagridApi } from "./ac-datagrid-api";
import { IAcDatagridRow } from "../interfaces/ac-datagrid-row.interface";
import { IAcDatagridRowEvent } from "../interfaces/event-args/ac-datagrid-row-event.interface";

export class AcDatagridRowDraggingEventHandler {
  datagridApi?: AcDatagridApi;

  destroy() {
    acNullifyInstanceProperties({ instance: this });
  }

  handleRowDrag({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi?.events.execute({ event: AC_DATAGRID_EVENT.RowDrag, args: eventArgs });
  }

  handleRowDragEnd({ datagridRow, event }: { datagridRow: IAcDatagridRow, event?: any }) {
    const eventArgs: IAcDatagridRowEvent = {
      datagridApi: this.datagridApi,
      datagridRow: datagridRow,
      event: event
    };
    this.datagridApi?.events.execute({ event: AC_DATAGRID_EVENT.RowDragEnd, args: eventArgs });
  }

  init({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
  }
}
