/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcElementBase } from "../../../core/ac-element-base";
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_HOOK } from "../_ac-datagrid.export";
import { AcDatagridCssClassName } from "../consts/ac-datagrid-css-class-name.const";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { AcDatagridBody } from "./ac-datagrid-body.element";
import { AcDatagridFooter } from "./ac-datagrid-footer.element";
import { AcDatagridHeader } from "./ac-datagrid-header.element";
import "../css/ac-datagrid.css";

export class AcDatagrid extends AcElementBase {
  containerElement: HTMLElement = this.ownerDocument.createElement('div');
  datagridApi: AcDatagridApi = new AcDatagridApi({ datagrid: this });
  datagridBody?: AcDatagridBody;
  datagridFooter?: AcDatagridFooter;
  afterRowsContainer: HTMLElement = this.ownerDocument.createElement('div');
  datagridHeader?: AcDatagridHeader;

  constructor() {
    super();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.ElementConnected });
  }


  override destroy(): void {
    this.datagridApi.destroy();
    console.log("Destroyn datagrid");
    super.destroy();
  }

  disconnectedCallback(): void {
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.ElementDisconnected });
    super.disconnectedCallback();
  }

  override init(): void {
    super.init();
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    acAddClassToElement({ class_: AcDatagridCssClassName.acDatagrid, element: this });

    // Create container for header + body (enables horizontal scroll sync)
    // acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridContainer, element: this.containerElement });
    // this.containerElement.style.display = 'flex';
    // this.containerElement.style.flexDirection = 'column';
    // this.containerElement.style.flex = '1';
    // this.containerElement.style.overflow = 'hidden';
    // this.containerElement.style.position = 'relative';

    // Create header
    // this.datagridHeader = new AcDatagridHeader();
    // this.datagridHeader.datagridApi = this.datagridApi;
    // acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridHeader, element: this.datagridHeader });

    // // Create body
    // this.datagridBody = new AcDatagridBody();
    // this.datagridBody.datagridApi = this.datagridApi;
    // acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridBody, element: this.datagridBody });
    // this.datagridBody.style.flex = '1';
    // this.datagridBody.style.overflow = 'auto';

    // // Create footer
    // this.datagridFooter = new AcDatagridFooter();
    // this.datagridFooter.datagridApi = this.datagridApi;
    // acAddClassToElement({ class_: AcDatagridCssClassName.acDatagridFooter, element: this.datagridFooter });

    // // Assemble DOM
    // this.containerElement.append(this.datagridHeader);
    // this.containerElement.append(this.datagridBody);
    // this.containerElement.append(this.afterRowsContainer);
    // this.append(this.containerElement);
    // this.append(this.datagridFooter);

    // // Initialize virtual scrolling if enabled
    // if (this.datagridApi.useVirtualScrolling) {
    //   this.datagridBody.setVirtualScrolling();
    // }

    // Fire init hook
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.DatagridInit });
  }

}

acRegisterCustomElement({ tag: 'ac-datagrid', type: AcDatagrid });
