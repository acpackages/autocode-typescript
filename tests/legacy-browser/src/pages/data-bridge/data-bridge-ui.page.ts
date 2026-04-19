/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @nx/enforce-module-boundaries */
import { AcCodeGeneratorDDEExtension, AcDDECodeGeneratorDefaultConfig } from '@autocode-ts/ac-dde-code-generator'
import { AcDataBridheUIElement } from '@autocode-ts/ac-data-bridge-ui';
import { PageHeader } from '../../components/page-header/page-header.component';
import { acBootstrapElements } from '@autocode-ts/ac-runtime';

export class DataBridgeUIPage  extends HTMLElement {
  pageHeader: PageHeader = new PageHeader();
  async connectedCallback() {

    acBootstrapElements();

    const html = `
      <ac-data-bridge-ui></ac-data-bridge-ui>
    `;
    this.innerHTML = html;
    this.style.height = '100vh;'
    this.pageHeader.pageTitle = 'Data Bridge UI';
  }
}
