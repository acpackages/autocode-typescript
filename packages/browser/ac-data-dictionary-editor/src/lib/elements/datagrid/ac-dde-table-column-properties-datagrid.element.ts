import { acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";

export class AcDDETableColumnPropertiesDatagridElement extends AcDDEDatagridElement {

}

acRegisterCustomElement({ tag: AC_DDE_TAG.tableColumnPropertiesDatagrid, type: AcDDETableColumnPropertiesDatagridElement });
