/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDatagridExtension } from "../../../core/ac-datagrid-extension";
import { AC_DATAGRID_EXTENSION_NAME } from "../../../consts/ac-datagrid-extension-name.const";
import { IAcDatagridExtension } from "../../../interfaces/ac-datagrid-extension.interface";

export class AcDatagridFixedEditorExtension extends AcDatagridExtension {
}

export const AC_DATAGRID_FIXED_EDITOR_EXTENSION: IAcDatagridExtension = {
  extensionName: AC_DATAGRID_EXTENSION_NAME.FixedEditor,
  extensionClass: AcDatagridFixedEditorExtension
}
