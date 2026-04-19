import { AcResizable } from '@autocode-ts/ac-browser'; // Adjust path as needed

export class ResizableTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcResizable Test Page</h2>
        <p>This page demonstrates <code>AcResizable</code> functionality for resizing from all 8 edges and corners.</p>

        ${this.renderResizableBlock('Right Resize', 'right', 'Resize the panel by dragging the right edge.')}
        ${this.renderResizableBlock('Left Resize', 'left', 'Resize the panel by dragging the left edge.')}
        ${this.renderResizableBlock('Top Resize', 'top', 'Resize the panel by dragging the top edge.')}
        ${this.renderResizableBlock('Bottom Resize', 'bottom', 'Resize the panel by dragging the bottom edge.')}

        ${this.renderResizableBlock('Top Left Resize', 'top-left', 'Resize the panel diagonally from the top-left corner.')}
        ${this.renderResizableBlock('Top Right Resize', 'top-right', 'Resize the panel diagonally from the top-right corner.')}
        ${this.renderResizableBlock('Bottom Left Resize', 'bottom-left', 'Resize the panel diagonally from the bottom-left corner.')}
        ${this.renderResizableBlock('Bottom Right Resize', 'bottom-right', 'Resize the panel diagonally from the bottom-right corner.')}

        <hr class="my-5">
        <p class="text-muted"><small>All panels above are made resizable using the <code>AcResizable</code> class. Drag handles are placed on appropriate sides/corners.</small></p>
      </div>
    `;

    this.querySelectorAll('.ac-resizable-box').forEach((el) => {
      // new AcResizable({element:el as HTMLElement});
    });
  }

  renderResizableBlock(title: string, direction: string, description: string): string {
    const id = `resize-${direction}`;
    return `
      <div class="mb-5">
        <h5>${title}</h5>
        <p><small class="text-muted">${description}</small></p>
        <ac-resizable>
        <div id="${id}" class="ac-resizable-box border bg-light p-3" style="
          position: relative;
          width: 300px;
          height: 200px;
          resize: none;
        ">
          <p>This box can be resized from the <strong>${direction.replace('-', ' ')}</strong>.</p>
          <p>Try dragging the handle on the corresponding edge or corner.</p>
        </div>
        </ac-resizable>
      </div>
    `;
  }
}
