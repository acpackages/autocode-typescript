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
import { AcDatagridSidePanelElement } from "./ac-datagrid-side-panel.element";

export class AcDatagridElement extends AcElementBase {
  containerElement!: HTMLElement;
  mainRowElement!: HTMLElement;
  datagridApi: AcDatagridApi = new AcDatagridApi({ datagrid: this });
  datagridBody?: AcDatagridBody;
  datagridFooter?: AcDatagridFooterElement;
  afterRowsContainer: HTMLElement = this.ownerDocument.createElement('div');
  datagridHeader?: AcDatagridHeaderElement;
  sidePanel?: AcDatagridSidePanelElement;

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

    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagrid, element: this });

    this.mainRowElement = this.ownerDocument.createElement('div');
    this.mainRowElement.style.display = 'flex';
    this.mainRowElement.style.flexDirection = 'row';
    this.mainRowElement.style.flex = '1';
    this.mainRowElement.style.overflow = 'hidden';
    this.mainRowElement.style.position = 'relative';

    this.containerElement = this.ownerDocument.createElement('div');
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridContainer, element: this.containerElement });

    this.datagridHeader = this.ownerDocument.createElement('ac-datagrid-header') as AcDatagridHeaderElement;
    this.datagridHeader.datagridApi = this.datagridApi;
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridHeader, element: this.datagridHeader });

    this.datagridBody = this.ownerDocument.createElement('ac-datagrid-body') as AcDatagridBody;
    this.datagridBody.datagridApi = this.datagridApi;
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridBody, element: this.datagridBody });

    this.sidePanel = this.ownerDocument.createElement('ac-datagrid-side-panel') as AcDatagridSidePanelElement;
    this.sidePanel.bindDatagridApi({ datagridApi: this.datagridApi });

    this.datagridFooter = this.ownerDocument.createElement('ac-datagrid-footer') as AcDatagridFooterElement;
    this.datagridFooter.datagridApi = this.datagridApi;
    acAddClassToElement({ class_: AC_DATAGRID_CLASS_NAME.acDatagridFooter, element: this.datagridFooter });

    this.containerElement.append(this.datagridHeader);
    this.containerElement.append(this.datagridBody);
    this.containerElement.append(this.afterRowsContainer);

    this.datagridBody.addEventListener('scroll', () => {
      if (this.datagridHeader && this.datagridHeader.scrollLeft !== this.datagridBody!.scrollLeft) {
        this.datagridHeader.scrollLeft = this.datagridBody!.scrollLeft;
      }
    }, { passive: true });

    this.mainRowElement.append(this.containerElement);
    this.mainRowElement.append(this.sidePanel);

    this.append(this.mainRowElement);
    this.append(this.datagridFooter);

    // Fire init hook
    this.datagridApi.hooks.execute({ hook: AC_DATAGRID_HOOK.DatagridInit });
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid', type: AcDatagridElement });
