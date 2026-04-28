import { acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AC_DDE_TAG } from "../../consts/ac-dde-tag.const";

export class AcDDETablePropertiesDatagridElement extends AcDDEDatagridElement{
}

acRegisterCustomElement({ tag: AC_DDE_TAG.tablePropertiesDatagrid, type: AcDDETablePropertiesDatagridElement });
