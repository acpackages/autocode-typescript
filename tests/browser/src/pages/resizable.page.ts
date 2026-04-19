import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcResizablePanels } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'resizable-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcResizablePanels Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates <code>AcResizablePanels</code> component with horizontal and vertical layouts.</p>

        <h5 class="mt-4 mb-3">Horizontal Layout</h5>
        <div style="width: 100%; height: 250px; display: flex; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
          <ac-resizable-panels id="hPanels" direction="horizontal" #hPanels>
            <ac-resizable-panel class="d-flex align-items-center justify-content-center bg-light border-end">Panel Left</ac-resizable-panel>
            <ac-resizable-panel class="d-flex align-items-center justify-content-center bg-white border-end">Panel Center</ac-resizable-panel>
            <ac-resizable-panel class="d-flex align-items-center justify-content-center" style="background-color: #f1f3f9;">Panel Right</ac-resizable-panel>
          </ac-resizable-panels>
        </div>

        <h5 class="mt-5 mb-3">Vertical Layout</h5>
        <div style="width: 100%; height: 400px; display: flex; flex-direction: column; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
          <ac-resizable-panels id="vPanels" direction="vertical" #vPanels>
            <ac-resizable-panel class="d-flex align-items-center justify-content-center bg-light border-bottom">Header Section</ac-resizable-panel>
            <ac-resizable-panel class="d-flex align-items-center justify-content-center bg-white border-bottom">Main Content Section</ac-resizable-panel>
            <ac-resizable-panel class="d-flex align-items-center justify-content-center" style="background-color: #f8f9fa;">Footer Section</ac-resizable-panel>
          </ac-resizable-panels>
        </div>

        <div class="mt-4 d-flex gap-2">
           <button class="btn btn-outline-primary btn-sm" (click)="resetSizes()">Reset Sizes</button>
           <button class="btn btn-outline-secondary btn-sm" (click)="setCustomSizes()">Set Custom Sizes</button>
        </div>
      </div>
    </div>
  `
})
export class ResizablePage {
  @AcViewChild('#hPanels') hPanels!: AcResizablePanels;
  @AcViewChild('#vPanels') vPanels!: AcResizablePanels;

  dropdownItems: IAppMenuItem[] = [{ label: 'Resizable Controls', isHeader: true }];

  resetSizes() {
    this.hPanels.setPanelSizes({ panelSizes: [{ index: 0, size: 33 }, { index: 1, size: 33 }, { index: 2, size: 34 }] });
    this.vPanels.setPanelSizes({ panelSizes: [{ index: 0, size: 33 }, { index: 1, size: 33 }, { index: 2, size: 34 }] });
  }

  setCustomSizes() {
    this.hPanels.setPanelSizes({ panelSizes: [{ index: 0, size: 20 }, { index: 1, size: 60 }, { index: 2, size: 20 }] });
    this.vPanels.setPanelSizes({ panelSizes: [{ index: 0, size: 10 }, { index: 1, size: 80 }, { index: 2, size: 10 }] });
  }
}
