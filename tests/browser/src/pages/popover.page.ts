import { AcElement } from "@autocode-ts/ac-runtime";
import { AcPopover } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'popover-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcPopover Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto text-center">
        <p class="mb-5">Click or hover the buttons to see popovers in action.</p>

        <div class="mb-5">
          <h4 class="mb-4">Click Triggers</h4>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <button class="btn btn-primary px-4 py-2" #btnCB ac-popover [ac-popover-content]="'Popover at Bottom (click)'" ac-popover-position="bottom">Bottom</button>
            <button class="btn btn-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Top (click)'" ac-popover-position="top">Top</button>
            <button class="btn btn-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Left (click)'" ac-popover-position="left">Left</button>
            <button class="btn btn-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Right (click)'" ac-popover-position="right">Right</button>
          </div>
        </div>

        <div class="mb-5">
          <h4 class="mb-4">Hover Triggers</h4>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <button class="btn btn-outline-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Bottom (hover)'" ac-popover-position="bottom" ac-popover-trigger="hover">Bottom</button>
            <button class="btn btn-outline-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Top (hover)'" ac-popover-position="top" ac-popover-trigger="hover">Top</button>
            <button class="btn btn-outline-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Left (hover)'" ac-popover-position="left" ac-popover-trigger="hover">Left</button>
            <button class="btn btn-outline-primary px-4 py-2" ac-popover [ac-popover-content]="'Popover at Right (hover)'" ac-popover-position="right" ac-popover-trigger="hover">Right</button>
          </div>
        </div>

        <div class="mt-5 p-4 border rounded bg-light mx-auto" style="max-width: 600px;">
          <h5>Rich Content Popover</h5>
          <p class="text-muted small">Popovers can contain HTML content and custom styling.</p>
          <button class="btn btn-dark" ac-popover [ac-popover-content]="richContent" ac-popover-position="top">View Rich Content</button>
        </div>
      </div>
    </div>
  `
})
export class PopoverPage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Popover Actions', isHeader: true }];

  richContent = `
    <div class="p-2" style="max-width: 250px;">
      <h6 class="border-bottom pb-2">User Profile</h6>
      <div class="d-flex align-items-center mb-2 mt-2">
        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 12px;">JD</div>
        <div>
          <div class="fw-bold small">John Doe</div>
          <div class="text-muted" style="font-size: 10px;">Frontend Developer</div>
        </div>
      </div>
      <p class="mb-0 small text-muted">A quick summary of the user with some additional details.</p>
    </div>
  `;
}
