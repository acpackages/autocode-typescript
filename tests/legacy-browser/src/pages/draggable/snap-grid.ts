import { AcDraggable, AcDraggableApi } from "@autocode-ts/ac-browser";

export class DraggableSnapGridPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .grid-container {
          position: relative;
          width: 500px;
          height: 300px;
          border: 1px solid #aaa;
          background-size: 50px 50px;
          background-image:
            linear-gradient(to right, #eee 1px, transparent 1px),
            linear-gradient(to bottom, #eee 1px, transparent 1px);
          margin: 20px auto;
        }

        .drag-grid-item {
          position: absolute;
          width: 60px;
          height: 60px;
          background: #ffefc2;
          text-align: center;
          line-height: 60px;
          font-weight: bold;
          border-radius: 6px;
          cursor: grab;
          user-select: none;
        }

        .test-description {
          padding: 12px;
          background: #f3f3f3;
          border: 1px solid #ccc;
          font-family: sans-serif;
          font-size: 14px;
          margin-bottom: 12px;
        }
      </style>

      <div class="test-description">
        <h3>🧪 Test: Snap-to-Grid Dragging</h3>
        <p>This test verifies whether dragged elements snap to a grid of a given size.</p>
        <ul>
          <li>Each box is snapped to the nearest grid point (50x50 by default).</li>
          <li>The grid is visually indicated using a background pattern.</li>
          <li>Set snapping via the <code>data-ac-snap-grid</code> attribute.</li>
        </ul>
      </div>
      <ac-draggable>
      <div id="gridContainer" class="grid-container">
        <div class="drag-grid-item" style="top:10px; left:10px" ac-draggable-element ac-draggable-snap-grid-size="50">
          G1
        </div>
      </div>
      </ac-draggable>
    `;

    const acDraggable = this.querySelector('ac-draggable') as AcDraggable;
    const draggableApi: AcDraggableApi = acDraggable.draggableApi;
    draggableApi.events.subscribeAllEvents({
      callback: (eventName: string, eventArgs: any) => {
        console.log(`Executed draggable event : ${eventName}`, eventArgs);
      }
    });
    console.log(acDraggable);
  }
}
