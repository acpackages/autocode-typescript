import { AcResizablePanels, AcEnumResizableEvent } from '@autocode-ts/ac-browser'; // Adjust path as needed

export class ResizablePanelsTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcResizablePanels Test Page</h2>
        <p>This page demonstrates the <code>AcResizablePanels</code> component with horizontal and vertical layouts using percentage-based resizing.</p>

        <h4 class="mt-5">Horizontal Resizable Panels</h4>
        <p><small class="text-muted">Resize the panels by dragging the handle between them (left ↔ right).</small></p>

        <div id="horizontal-panels" style="width: 100%; height: 200px; display: flex; border: 1px solid #ccc;">
        <ac-resizable-panels id="horizontalPanels" direction="horizontal">
          <ac-resizable-panel style="background-color: #d1ecf1;">Panel 1</ac-resizable-panel>
          <ac-resizable-panel style="background-color: #f8d7da;">Panel 2</ac-resizable-panel>
          <ac-resizable-panel style="background-color: #977f30ff;">Panel 3</ac-resizable-panel>
          <ac-resizable-panel style="background-color: #a9eeffff;">Panel 4</ac-resizable-panel>
        </ac-resizable-panels>
        </div>

        <h4 class="mt-5">Vertical Resizable Panels</h4>
        <p><small class="text-muted">Resize the panels by dragging the handle between them (top ↕ bottom).</small></p>
        <div id="vertical-panels"  style="width: 100%; height: 300px; display: flex;flex-direction:column; border: 1px solid #ccc;">
        <ac-resizable-panels id="verticalPanels" direction="vertical">
          <ac-resizable-panel style="background-color: #d4edda;">Panel 1</ac-resizable-panel>
          <ac-resizable-panel style="background-color: #fff3cd;">Panel 2</ac-resizable-panel>
          <ac-resizable-panel style="background-color: #977f30ff;">Panel 3</ac-resizable-panel>
          <ac-resizable-panel style="background-color: #a9eeffff;">Panel 4</ac-resizable-panel>
        </ac-resizable-panels>
        </div>
        <hr class="my-5">
        <p class="text-muted"><small>Each panel is resizable using percentage-based sizing. Handles are dynamically inserted between adjacent panels.</small></p>
      </div>
    `;

    // // Initialize AcResizablePanels for both directions
    const horizontalPanels = this.querySelector('#horizontalPanels') as AcResizablePanels;
    const verticalPanels = this.querySelector('#verticalPanels') as AcResizablePanels;
    // horizontalPanels.on({event:AcEnumResizableEvent.resize,callback:(args:any)=>{
    //   console.log("Horizontal Panels Resized",args);
    // }})
    // verticalPanels.on({event:AcEnumResizableEvent.resize,callback:(args:any)=>{
    //   console.log("Vertical Panels Resized",args);
    // }})

    setTimeout(() => {
      horizontalPanels.setPanelSizes({panelSizes:[
        {index:0,size:10},
        {index:1,size:10},
        {index:2,size:20},
        // {index:3,size:40}
      ]});
      verticalPanels.setPanelSizes({panelSizes:[{index:2,size:10}]});
    }, 1500);

  }
}
