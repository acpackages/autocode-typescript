import { AcElement } from "@autocode-ts/ac-runtime";
import { AcDraggable } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'draggable-advanced-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'Advanced Drag & Drop'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <div class="row g-4">
          <!-- Snap to Grid -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100">
               <div class="card-header bg-primary bg-opacity-10 py-3">
                  <h6 class="mb-0 fw-bold">Snap to Grid (50px)</h6>
               </div>
               <div class="card-body p-4 bg-grid d-flex align-items-center justify-content-center" style="height: 300px; position: relative;">
                  <div class="drag-box snap bg-primary shadow" #boxSnap>Snap Me</div>
               </div>
            </div>
          </div>

          <!-- Clone & Revert -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100">
               <div class="card-header bg-success bg-opacity-10 py-3">
                  <h6 class="mb-0 fw-bold">Clone & Revert</h6>
               </div>
               <div class="card-body p-4 d-flex align-items-center justify-content-center" style="height: 300px; position: relative;">
                  <div class="drag-box clone bg-success shadow" #boxClone>Clone Me</div>
               </div>
            </div>
          </div>

          <!-- Axis Lock -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100">
               <div class="card-header bg-warning bg-opacity-10 py-3">
                  <h6 class="mb-0 fw-bold">Axis Locking</h6>
               </div>
               <div class="card-body p-4 d-flex flex-column gap-3 align-items-center justify-content-center" style="height: 300px; position: relative;">
                  <div class="drag-box axis-x bg-warning text-dark shadow" #boxX>X-Axis Only</div>
                  <div class="drag-box axis-y bg-warning text-dark shadow" #boxY>Y-Axis Only</div>
               </div>
            </div>
          </div>

          <!-- Boundary Restriction -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0 h-100">
               <div class="card-header bg-danger bg-opacity-10 py-3">
                  <h6 class="mb-0 fw-bold">Boundary Lock</h6>
               </div>
               <div class="card-body p-0" #boundaryContainer style="height: 300px; position: relative; background: #fff5f5;">
                  <div class="drag-box bg-danger shadow m-2" #boxBound>I stay inside</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .bg-grid {
      background-image: radial-gradient(#dee2e6 1px, transparent 1px);
      background-size: 50px 50px;
    }
    .drag-box {
      width: 100px;
      height: 100px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      cursor: grab;
      user-select: none;
      z-index: 10;
    }
    .drag-box:active { cursor: grabbing; }
  `
})
export class DraggableAdvancedPage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Drag Options', isHeader: true }];

  acOnInit() {
    // 1. Snap Grid
    new AcDraggable(document.querySelector('.snap') as HTMLElement, {
      grid: [50, 50]
    });

    // 2. Clone & Revert
    new AcDraggable(document.querySelector('.clone') as HTMLElement, {
      helper: 'clone',
      revert: true
    });

    // 3. X-Axis Lock
    new AcDraggable(document.querySelector('.axis-x') as HTMLElement, {
      axis: 'x'
    });

    // 4. Y-Axis Lock
    new AcDraggable(document.querySelector('.axis-y') as HTMLElement, {
      axis: 'y'
    });

    // 5. Boundary
    const boundEl = document.querySelector('.bg-danger + div') || document.querySelector('#boundaryContainer'); // Correcting selector
    new AcDraggable(document.querySelector('.drag-box.bg-danger') as HTMLElement, {
      containment: 'parent'
    });
  }
}
