import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcModal } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'modal-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcModal Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates basic usage of <code>AcModal</code> in AcRuntime.</p>

        <div class="mb-3">
          <button class="btn btn-primary me-2" (click)="openSimple()">Open Simple Modal</button>
          <button class="btn btn-success me-2" (click)="openConfirm()">Open Confirm Modal</button>
        </div>

        <!-- Modal -->
        <ac-modal #modal [closeOnOutsideClick]="false" [closeOnEscape]="true">
          <div class="card shadow-lg border-0" style="min-width: 400px; border-radius: 12px; overflow: hidden;">
            <div class="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <h5 class="mb-0">{{modalTitle}}</h5>
              <button type="button" class="btn-close" (click)="modal.close()"></button>
            </div>
            <div class="card-body p-4">
              <p>{{modalMessage}}</p>
            </div>
            <div class="card-footer bg-light border-top py-3 px-4 text-end" *if="showFooter">
              <button class="btn btn-link text-muted text-decoration-none me-3" (click)="modal.close()">Cancel</button>
              <button class="btn btn-primary px-4" (click)="onConfirm()">Confirm</button>
            </div>
          </div>
        </ac-modal>
      </div>
    </div>
  `
})
export class ModalPage {
  @AcViewChild('#modal') modal!: AcModal;

  modalTitle = 'Modal Title';
  modalMessage = 'Modal message goes here.';
  showFooter = false;

  dropdownItems: IAppMenuItem[] = [{ label: 'Modal Actions', isHeader: true }];

  openSimple() {
    this.modalTitle = 'Simple Modal';
    this.modalMessage = 'This is a simple modal without a footer.';
    this.showFooter = false;
    this.modal.open();
  }

  openConfirm() {
    this.modalTitle = 'Confirm Action';
    this.modalMessage = 'Are you sure you want to proceed with this operation?';
    this.showFooter = true;
    this.modal.open();
  }

  onConfirm() {
    alert('Action Confirmed!');
    this.modal.close();
  }
}
