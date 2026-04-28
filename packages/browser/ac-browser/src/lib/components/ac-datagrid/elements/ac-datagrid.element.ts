/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_HOOK } from "../_ac-datagrid.export";
import { AC_DATAGRID_CLASS_NAME } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AcDatagridBody } from "./ac-datagrid-body.element";
import { AcDatagridFooterElement } from "./ac-datagrid-footer.element";
import { AcDatagridHeaderElement } from "./ac-datagrid-header.element";

export class AcDatagridElement extends AcElementBase {
  containerElement!: HTMLElement;
  datagridApi: AcDatagridApi = new AcDatagridApi({ datagrid: this });
  datagridBody?: AcDatagridBody;
  datagridFooter?: AcDatagridFooterElement;
  afterRowsContainer!: HTMLElement;
  datagridHeader?: AcDatagridHeaderElement;

  connectedCallback(): void {
    super.connectedCallback();
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.ElementConnected });
  }


  override destroy(): void {
    this.datagridApi.destroy();
    super.destroy();
  }

  disconnectedCallback(): void {
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.ElementDisconnected });
    super.disconnectedCallback();
  }

  override init(): void {
    super.init();
    if (this.getAttribute('ac-initialized')) return;
    this.setAttribute('ac-initialized', 'true');
    acClearElement({ element: this });
    this.containerElement = this.ownerDocument.createElement('div');
    this.afterRowsContainer = this.ownerDocument.createElement('div');
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagrid, element: this });
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridContainer, element: this.containerElement });
    // this.datagridHeader = this.ownerDocument.createElement('ac-datagrid-header') as AcDatagridHeaderElement;
    // this.datagridHeader.datagridApi = this.datagridApi;
    // acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeader, element: this.datagridHeader });

    // this.datagridBody = document.createElement('ac-datagrid-body') as AcDatagridBody;
    // acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridBody, element: this.datagridBody });

    // this.datagridFooter = document.createElement('ac-datagrid-footer') as AcDatagridFooterElement;
    // this.datagridFooter.datagridApi = this.datagridApi;
    // acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridFooter, element: this.datagridFooter });

    this.containerElement.append(this.datagridHeader);
    this.containerElement.append(this.datagridBody);
    this.containerElement.append(this.afterRowsContainer);
    this.append(this.containerElement);
    // this.append(this.datagridFooter);

    // Fire init hook
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.DatagridInit });
  }

}

acRegisterCustomElement({ tag: 'ac-datagrid', type: AcDatagridElement });
