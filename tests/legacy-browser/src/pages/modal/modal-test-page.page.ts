import { acInit, AcModal, AcSvgIconElement } from "@autocode-ts/ac-browser";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";

export class ModalTestPage extends HTMLElement {
  private modalElement!: AcModal;

  connectedCallback() {
    acInit();
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcModal Test Page </h2>
        <p>This page demonstrates basic usage of <code>AcModal</code>. <i><ac-svg-icon>${ACI_SVG_SOLID.window}</ac-svg-icon></i></p>

        <div class="mb-3">
          ${this.renderBtn("Open Simple Modal", "simple")}
          ${this.renderBtn("Open Confirm Modal", "confirm")}
        </div>
      </div>

      <!-- Modal HTML -->
      <ac-modal close-on-outside-click="false" close-on-escape="false">
      <div style="background:white;border-radius:10px;">
        <div class="ac-modal-header" style="padding: 1rem; border-bottom: 1px solid #ddd;">
          <h4 id="modal-title" style="margin: 0;">Modal</h4>
        </div>
        <div class="ac-modal-body" style="padding: 1rem;">
          <p id="modal-message">This is a modal.</p>
        </div>
        <div class="ac-modal-footer" style="padding: 0.75rem; border-top: 1px solid #ddd; text-align: right;">
          <button id="modal-cancel" style="margin-right: 0.5rem;">Cancel</button>
          <button id="modal-ok">OK</button>
        </div>
        </div>
      </ac-modal>
    `;
    const svgIcon = this.querySelector('ac-svg-icon') as AcSvgIconElement;
    console.log(svgIcon);
    setTimeout(() => {
      svgIcon.setAttribute('svg-code',ACI_SVG_SOLID.clone);
    }, 1500);
    // Grab modal element and init AcModal
    this.modalElement = this.querySelector("ac-modal") as AcModal;

    // Hide footer initially
    this.getFooter().style.display = "none";

    this.addEventListeners();
  }

  private renderBtn(label: string, action: string): string {
    return `<button class="btn btn-primary me-2 mb-2" data-action="${action}">${label}</button>`;
  }

  private addEventListeners() {
    this.querySelectorAll<HTMLButtonElement>("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset["action"];

        if (action === "simple") {
          this.showSimpleModal();
        } else if (action === "confirm") {
          this.showConfirmModal();
        }
      });
    });

    // Modal footer buttons
    this.querySelector<HTMLButtonElement>("#modal-ok")?.addEventListener("click", () => {
      alert("OK clicked!");
      this.modalElement.close();
    });
    this.querySelector<HTMLButtonElement>("#modal-cancel")?.addEventListener("click", () => {
      alert("Cancel clicked!");
      this.modalElement.close();
    });
  }

  private showSimpleModal() {
    this.getTitle().innerText = "Simple Modal";
    this.getMessage().innerText = "This is just a basic modal without action buttons.";
    this.getFooter().style.display = "none";
    console.dir(this.modalElement);
    this.modalElement.open();
  }

  private showConfirmModal() {
    this.getTitle().innerText = "Confirm Action";
    this.getMessage().innerText = "Do you want to proceed?";
    this.getFooter().style.display = "block";
    console.dir(this.modalElement);
    this.modalElement.open();
  }

  // Helpers to get modal parts
  private getTitle() {
    return this.querySelector("#modal-title") as HTMLElement;
  }

  private getMessage() {
    return this.querySelector("#modal-message") as HTMLElement;
  }

  private getFooter() {
    return this.querySelector(".ac-modal-footer") as HTMLElement;
  }
}
