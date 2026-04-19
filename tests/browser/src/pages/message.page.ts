import { AcElement } from "@autocode-ts/ac-runtime";
import { AcMessage } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'message-page',
  template: `
    <div class="app-page">
      <app-header [title]="'AcMessage Test Page'"></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This test demonstrates <code>AcMessage</code> in all modes (toast, modal, confirm).</p>

        <div class="card mb-4 shadow-sm border-0">
          <div class="card-header bg-white py-3"><h5 class="mb-0">Basic Toasts</h5></div>
          <div class="card-body">
            <button class="btn btn-success me-2 mb-2" (click)="toast('success')">Success Toast</button>
            <button class="btn btn-danger me-2 mb-2" (click)="toast('error')">Error Toast</button>
            <button class="btn btn-info me-2 mb-2 text-white" (click)="toast('info')">Info Toast</button>
            <button class="btn btn-warning me-2 mb-2" (click)="toast('warning')">Warning Toast</button>
          </div>
        </div>

        <div class="card mb-4 shadow-sm border-0">
          <div class="card-header bg-white py-3"><h5 class="mb-0">Confirm Modals</h5></div>
          <div class="card-body">
            <button class="btn btn-primary me-2 mb-2" (click)="confirmBasic()">Basic Confirm</button>
            <button class="btn btn-outline-primary me-2 mb-2" (click)="confirmInput()">Confirm with Input</button>
          </div>
        </div>

        <div class="card mb-4 shadow-sm border-0">
          <div class="card-header bg-white py-3"><h5 class="mb-0">Alert Modals</h5></div>
          <div class="card-body">
            <button class="btn btn-info me-2 mb-2 text-white" (click)="alert('info')">Info Modal</button>
            <button class="btn btn-danger me-2 mb-2" (click)="alert('error')">Error Modal</button>
            <button class="btn btn-success me-2 mb-2" (click)="alert('success')">Success Modal</button>
          </div>
        </div>

        <div class="card mb-4 shadow-sm border-0">
          <div class="card-header bg-white py-3"><h5 class="mb-0">Programmatic</h5></div>
          <div class="card-body">
            <button class="btn btn-outline-danger me-2 mb-2" (click)="closeAll()">Close All Toasts</button>
            <button class="btn btn-dark me-2 mb-2" (click)="stack()">Toast Stack</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MessagePage {
  toast(type: 'success' | 'error' | 'info' | 'warning') {
    AcMessage[type]({
      title: type.toUpperCase(),
      message: `This is a ${type} toast message.`,
      toast: true,
      timer: 3000
    });
  }

  async confirmBasic() {
    await AcMessage.confirm({
      title: 'Are you sure?',
      message: 'This will perform a permanent action.',
      icon: 'warning',
      onConfirm: () => AcMessage.success({ message: 'Confirmed!', toast: true })
    });
  }

  async confirmInput() {
    const result: any = await AcMessage.confirm({
      title: 'Enter Value',
      message: 'Please provide a name:',
      showInput: true,
      inputPlaceholder: 'John Doe'
    });
    if (result.confirmed) {
      AcMessage.success({ message: `Received: ${result.value}`, toast: true });
    }
  }

  alert(type: 'success' | 'error' | 'info' | 'warning') {
    AcMessage[type]({
      title: `${type.toUpperCase()} Modal`,
      message: `This is a ${type} modal dialog.`,
      toast: false
    });
  }

  closeAll() {
    AcMessage.closeAllToasts();
    AcMessage.flushModalQueue();
  }

  stack() {
    for (let i = 1; i <= 3; i++) {
      setTimeout(() => {
        AcMessage.info({
          title: `Stacked #${i}`,
          message: 'Notification arrived.',
          toast: true,
          position: 'top-right'
        });
      }, i * 500);
    }
  }
}
