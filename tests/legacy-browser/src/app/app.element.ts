import './app.element.scss';

export class AppElement extends HTMLElement {
  public static observedAttributes = [];

  connectedCallback() {
    const title = 'test-browser';
    this.innerHTML = `
    <div>
  <a href="template-engine">Template Engine</a>
  <ac-router-outlet></ac-router-outlet>
  With Router
</div>

      `;
  }
}
customElements.define('autocode-ts-root', AppElement);
