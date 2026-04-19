/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcMessage } from "@autocode-ts/ac-browser";

export class MessageTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="padding:20px;font-family:sans-serif;">
        <h2>AcMessage Test Page</h2>
        <p>This test demonstrates <code>AcMessage</code> in all modes (toast, modal, confirm) and all icons.</p>

        <hr>
        <h3>1️⃣ Basic Toasts (using fire + toast:true)</h3>
        <div class="group">
          ${this.btn("Success Toast", "toast-success")}
          ${this.btn("Error Toast", "toast-error")}
          ${this.btn("Info Toast", "toast-info")}
          ${this.btn("Warning Toast", "toast-warning")}
          ${this.btn("No Icon Toast", "toast-none")}
        </div>

        <hr>
        <h3>2️⃣ Toast Positions</h3>
        <div class="group">
          ${this.btn("Top Left", "pos-top-left")}
          ${this.btn("Top Center", "pos-top-center")}
          ${this.btn("Top Right", "pos-top-right")}
          ${this.btn("Bottom Left", "pos-bottom-left")}
          ${this.btn("Bottom Center", "pos-bottom-center")}
          ${this.btn("Bottom Right", "pos-bottom-right")}
        </div>

        <hr>
        <h3>3️⃣ Confirm Modals</h3>
        <div class="group">
          ${this.btn("Basic Confirm", "confirm-basic")}
          ${this.btn("Confirm with Input", "confirm-input")}
          ${this.btn("Confirm Queue (3 dialogs)", "confirm-queue")}
        </div>

        <hr>
        <h3>4️⃣ Alert Modals (fire with toast:false)</h3>
        <div class="group">
          ${this.btn("Info Modal", "modal-info")}
          ${this.btn("Error Modal", "modal-error")}
          ${this.btn("Success Modal", "modal-success")}
          ${this.btn("Warning Modal", "modal-warning")}
        </div>

        <hr>
        <h3>5️⃣ Programmatic Control</h3>
        <div class="group">
          ${this.btn("Close All Toasts", "close-all")}
          ${this.btn("Multiple Toast Stack", "stack")}
        </div>
      </div>
    `;

    this.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", (e) => this.handleAction((e.target as HTMLElement).dataset["action"]!));
    });
  }

  private btn(label: string, action: string): string {
    return `<button data-action="${action}" style="margin:4px;padding:6px 12px;cursor:pointer;">${label}</button>`;
  }

  private async handleAction(action: string) {
    switch (action) {
      // ---- Basic toasts ----
      case "toast-success":
        AcMessage.success({
          title:"Success!",
          message: "Your operation completed successfully.",
          toast: true,
          timer: 3000,
        });
        break;
      case "toast-error":
        AcMessage.error({
          title:"Error occurred",
          message: "Something went wrong.",
          toast: true,
        });
        break;
      case "toast-info":
        AcMessage.info( {
          title:"Information",
          message: "This is an informational message.",
          toast: true,
        });
        break;
      case "toast-warning":
        AcMessage.warning( {
          title:"Warning",
          message: "Be cautious with this action.",
          toast: true,
        });
        break;
      case "toast-none":
        AcMessage.fire({
          title: "Plain Toast",
          message: "No icon, custom style, 5s timer.",
          icon: "none",
          toast: true,
          timer: 5000,
          className: "custom-toast",
          position: "bottom-center",
        });
        break;

      // ---- Toast positions ----
      case "pos-top-left":
      case "pos-top-center":
      case "pos-top-right":
      case "pos-bottom-left":
      case "pos-bottom-center":
      case "pos-bottom-right":
        const pos = action.replace("pos-", "") as any;
        AcMessage.info( {
          title:`Toast ${pos}`,
          message: `This toast is positioned at ${pos}`,
          toast: true,
          position: pos,
          timer: 2500,
        });
        break;

      // ---- Confirm dialogs ----
      case "confirm-basic": {
        const result:any = await AcMessage.confirm({
          title: "Are you sure?",
          message: "Do you want to proceed?",
          icon: "warning",
          confirmText: "Yes",
          denyText: "No",
          onConfirm:(result:any)=>{
            console.log("Confirm result:", result);
            AcMessage.success({message:"Confirmed ✅"});
          },
          onCancel:(result:any)=>{
            console.log("Confirm result:", result);
            AcMessage.error({title:"Cancelled ❌", toast: true });
          }
        });

        break;
      }

      case "confirm-input": {
        const result:any = await AcMessage.confirm({
          title: "Enter your name",
          message: "We will greet you!",
          icon: "info",
          showInput: true,
          inputPlaceholder: "Your name",
          confirmText: "Submit",
        });
        if (result.confirmed) {
          AcMessage.success({message:`Hello, ${result.value ?? "Anonymous"}!`, toast: true });
        } else {
          AcMessage.warning( {message:"You cancelled.", toast: true });
        }
        break;
      }

      case "confirm-queue": {
        const runModal = async (i: number) => {
          await AcMessage.confirm({
            title: `Dialog ${i}`,
            message: "Click OK to continue.",
            icon: "info",
            confirmText: "Next",
          });
        };
        await runModal(1);
        await runModal(2);
        await runModal(3);
        AcMessage.success({message:"Queue complete!", toast: true });
        break;
      }

      // ---- Alert modals ----
      case "modal-info":
        AcMessage.info({
          title:"Info Modal",
          message: "This is an informational modal dialog.",
          toast: false,
        });
        break;
      case "modal-error":
        AcMessage.error( {
          title:"Error Modal",
          message: "An unexpected error occurred.",
          toast: false,
        });
        break;
      case "modal-success":
        AcMessage.success( {
          title:"Success Modal",
          message: "Your data has been saved successfully.",
          toast: false,
        });
        break;
      case "modal-warning":
        AcMessage.warning( {
          title:"Warning Modal",
          message: "This action is irreversible!",
          toast: false,
        });
        break;

      // ---- Programmatic controls ----
      case "close-all":
        AcMessage.closeAllToasts();
        AcMessage.flushModalQueue();
        AcMessage.info({title:"All messages closed!",  toast: true });
        break;

      case "stack":
        for (let i = 1; i <= 5; i++) {
          setTimeout(() => {
            AcMessage.info({
              title:`Stacked Toast #${i}`,
              message: "Appears with delay.",
              toast: true,
              timer: 1500,
              position: "top-right",
            });
          }, i * 400);
        }
        break;
    }
  }
}

// customElements.define("ac-message-test-page", MessageTestPage);
