import { AcElement } from "@autocode-ts/ac-runtime";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'draggable-basic-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcDraggable Basic Test'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p class="mb-4">Standard drag and drop interaction using the <code>&lt;ac-draggable&gt;</code> element.</p>

        <ac-draggable #draggable>
          <div class="row g-4 align-items-center">
            <div class="col-md-4">
              <div class="card shadow-sm text-center">
                 <div class="card-body p-4">
                    <div ac-draggable-element class="drag-box bg-primary text-white p-3 rounded shadow-sm">
                      <i class="fa-solid fa-hand-holding me-2"></i> Drag Me
                    </div>
                    <div class="mt-3 text-muted small">This is the draggable source</div>
                 </div>
              </div>
            </div>

            <div class="col-md-2 text-center fs-2 text-muted">
              <i class="fa-solid fa-arrow-right"></i>
            </div>

            <div class="col-md-4">
               <div ac-draggable-target class="drop-target border-dashed border-2 rounded p-5 text-center d-flex flex-column align-items-center justify-content-center">
                  <i class="fa-solid fa-box-open fs-1 mb-3 opacity-25"></i>
                  <span class="text-muted fw-bold">Drop Here</span>
                  <div class="drop-indicator mt-2 small text-primary fw-bold" style="display:none;">TARGET ACTIVE</div>
               </div>
            </div>
          </div>
        </ac-draggable>

        <div class="mt-5 alert alert-light border">
          <h6>Events Logged</h6>
          <p class="mb-0 small text-muted">Check browser console for <code>DragStart</code>, <code>DragLeave</code>, <code>DragEnter</code>, <code>DragOver</code>, and <code>DragDrop</code> events.</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .drag-box {
      cursor: grab;
      user-select: none;
      transition: background-color 0.2s, transform 0.2s;
    }
    .drag-box:active {
      cursor: grabbing;
      transform: scale(1.05);
    }
    .drop-target {
      min-height: 200px;
      border: 2px dashed #dee2e6;
      background-color: #f8f9fa;
      transition: background-color 0.3s, border-color 0.3s;
    }
    .drop-target.ac-draggable-target-active {
      background-color: #e7f1ff;
      border-color: #0d6efd;
      border-style: solid;
    }
    .border-dashed {
      border-style: dashed !important;
    }
    .ac-draggable-target-active .drop-indicator {
      display: block !important;
    }
  `
})
export class DraggableBasicPage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Draggable Actions', isHeader: true }];
}
