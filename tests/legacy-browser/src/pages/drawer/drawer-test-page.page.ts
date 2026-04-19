/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDrawer } from '@autocode-ts/ac-browser';

export class DrawerTestPage extends HTMLElement {
  connectedCallback() {
    console.dir(this);
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcDrawer Test Page</h2>
        <p>This page demonstrates <code>AcDrawer</code> behavior for all 4 supported placements.</p>

        ${this.renderTestBlock('Left Drawer', 'left')}
        ${this.renderTestBlock('Right Drawer', 'right')}
        ${this.renderTestBlock('Top Drawer', 'top')}
        ${this.renderTestBlock('Bottom Drawer', 'bottom')}

        <hr class="my-5">
        <p class="text-muted"><small>All drawers above are animated using JavaScript and AcDrawer's internal animation logic.</small></p>
      </div>

      <!-- Drawer Elements -->
      <ac-drawer id="drawer-left" placement="left">
      <div class="bg-white border p-4 shadow" style="width:300px;height:100vw;">
        <h5>Left Drawer Content</h5>
        <p>This is the left drawer.</p>
        <button class="btn btn-secondary btn-sm close-btn" ac-drawer-close>Close</button>
      </div>
      </ac-drawer>
      <ac-drawer id="drawer-right" placement="right">
      <div class="bg-white border p-4 shadow" style="width:300px;height:100vw;">
        <h5>Right Drawer Content</h5>
        <p>This is the right drawer.</p>
        <button class="btn btn-secondary btn-sm close-btn" ac-drawer-close>Close</button>
      </div>
      </ac-drawer>
      <ac-drawer id="drawer-top" placement="top">
      <div class="bg-white border p-4 shadow" style="height:200px;width:100vw;">
        <h5>Top Drawer Content</h5>
        <p>This is the top drawer.</p>
        <button class="btn btn-secondary btn-sm close-btn" ac-drawer-close>Close</button>
      </div>
      </ac-drawer>
      <ac-drawer id="drawer-bottom" placement="bottom">
      <div class="bg-white border p-4 shadow" style="height:200px;width:100vw;">
        <h5>Bottom Drawer Content</h5>
        <p>This is the bottom drawer.</p>
        <button class="btn btn-secondary btn-sm close-btn" ac-drawer-close>Close</button>
      </div>
      </ac-drawer>
    `;

    // Initialize drawers
    const drawers: Record<string, AcDrawer> = {
      left: this.querySelector('#drawer-left') as AcDrawer,
      right: this.querySelector('#drawer-right') as AcDrawer,
      top: this.querySelector('#drawer-top') as AcDrawer,
      bottom: this.querySelector('#drawer-bottom') as AcDrawer,
    };

    console.log(drawers);
    // Bind open buttons
    this.querySelectorAll('[data-open-drawer]').forEach(btn => {
      btn.addEventListener('click', () => {
        const placement = (btn as HTMLElement).dataset['openDrawer']!;
        drawers[placement].open();
      });
    });
  }

  private renderTestBlock(title: string, placement: string): string {
    return `
      <div class="mb-4 border rounded p-3 bg-light">
        <h5>${title}</h5>
        <p><small class="text-muted">Opens from the ${placement} side.</small></p>
        <div class="mb-2">
          <button type="button" class="btn btn-primary btn-sm" data-open-drawer="${placement}">Open ${title}</button>
        </div>
      </div>
    `;
  }
}
