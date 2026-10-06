import { AcNodeflowApi } from '../core/ac-nodeflow-api';

export class AcNodeflowDesignerElement extends HTMLElement {
  static readonly TagName = 'ac-nodeflow-designer';

  api: AcNodeflowApi;
  containerElement: HTMLElement;
  private _isInitialized = false;

  constructor() {
    super();
    this.api = new AcNodeflowApi({ designerInstance: this });
    this.containerElement = document.createElement('div');
    this.containerElement.classList.add('ac-nodeflow-container');
    this.containerElement.style.width = '100%';
    this.containerElement.style.height = '100%';
    this.containerElement.style.position = 'relative';
    this.containerElement.style.overflow = 'hidden';
  }

  connectedCallback(): void {
    if (!this._isInitialized) {
      this._isInitialized = true;
      this.appendChild(this.containerElement);
      this.api.initRete({ container: this.containerElement });

      const event = new CustomEvent('nodeflowInit', { detail: { api: this.api } });
      this.dispatchEvent(event);
    }
  }

  disconnectedCallback(): void {
    if (this._isInitialized) {
      this.api.destroy();
      this._isInitialized = false;
    }
  }
}

// Register custom element if not already registered
if (typeof customElements !== 'undefined' && !customElements.get(AcNodeflowDesignerElement.TagName)) {
  customElements.define(AcNodeflowDesignerElement.TagName, AcNodeflowDesignerElement);
}
