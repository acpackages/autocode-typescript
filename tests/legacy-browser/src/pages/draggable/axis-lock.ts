import { AcDraggable, } from "@autocode-ts/ac-browser";

export class DraggableAxisLockPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .lock-box {
          width: 100%;
          height: 200px;
          margin: 20px;
          border: 2px dashed #ccc;
          position: relative;
          padding: 20px;
        }

        .drag-item {
          background: #add8e6;
          width: 60px;
          height: 60px;
          line-height: 60px;
          text-align: center;
          position: absolute;
          cursor: grab;
          user-select: none;
          border-radius: 6px;
          font-weight: bold;
        }

        .drag-x    { top: 10px; left: 10px; background: #d1ffd1; }
        .drag-y    { top: 10px; left: 100px; background: #ffd1d1; }
        .drag-both { top: 10px; left: 200px; background: #d1d1ff; }

        .test-description {
          padding: 10px;
          background: #f9f9f9;
          border: 1px solid #ccc;
          font-family: sans-serif;
          font-size: 14px;
          margin-bottom: 16px;
          line-height: 1.6;
        }
      </style>

      <div class="test-description">
        <h3>🧪 Test: Axis Locking (X-only, Y-only, Both)</h3>
        <p>This test verifies support for restricting dragging behavior to a specific axis.</p>
        <ul>
          <li><strong>Green Box (X):</strong> Can only move along the horizontal (X) axis.</li>
          <li><strong>Red Box (Y):</strong> Can only move along the vertical (Y) axis.</li>
          <li><strong>Blue Box (XY):</strong> Can move freely in both directions.</li>
        </ul>
        <p>Each draggable element uses the <code>data-ac-axis</code> attribute to control its drag axis:
          <code>x</code> for horizontal, <code>y</code> for vertical, or none for both.</p>
        <p>While dragging, the element visually follows the pointer along the allowed direction only.</p>
      </div>

      <div id="container" class="lock-box">
        <ac-draggable>
        <div class="drag-item drag-x" ac-draggable-element ac-draggable-lock-x-axis>X</div>
        <div class="drag-item drag-y" ac-draggable-element ac-draggable-lock-y-axis>Y</div>
        <div class="drag-item drag-both" ac-draggable-element>XY</div>
        </ac-draggable>
      </div>
    `;

    const root = this.querySelector('#container')!;
    // const acDraggable = new AcDraggable({ element: root as HTMLElement });
    // const draggableApi: AcDraggableApi = acDraggable.draggableApi;
    // draggableApi.events.subscribeAllEvents({
    //   callback: (eventName: string, eventArgs: any) => {
    //     console.log(`Executed draggable event : ${eventName}`, eventArgs);
    //   }
    // });
    // console.log(acDraggable);
  }
}
