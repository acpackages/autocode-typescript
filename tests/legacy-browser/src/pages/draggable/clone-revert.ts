import { AcDraggable, AcDraggableApi, AcEnumDraggableEvent } from "@autocode-ts/ac-browser";

export class DraggableCloneRevertPage extends HTMLElement {
  static observedAttributes = [];

  connectedCallback() {
    this.innerHTML = `
      <h2>🧪 Clone + Revert + Free Axis Drag Demo</h2>
      <p>
        This test demonstrates multiple advanced features of the <code>AcDraggable</code> system:
      </p>
      <ul>
        <li><strong>Clone on Drag:</strong> A copy of the element is dragged instead of the original. The original stays in place.</li>
        <li><strong>Free Axis Movement:</strong> Dragging is allowed on both <code>X</code> and <code>Y</code> axes because no <code>data-axis</code> is set.</li>
        <li><strong>Revert on Invalid Drop:</strong> If the clone is dropped outside a valid target, it animates back to the source element.</li>
        <li><strong>Drop Zones:</strong> Only elements with <code>ac-drag-target</code> are treated as valid drop locations.</li>
        <li><strong>Events:</strong> You can listen to drag lifecycle events like <code>ac:drag:start</code>, <code>ac:drag:move</code>, <code>ac:drop</code>, etc.</li>
      </ul>
      <ac-draggable>
      <div style="display: flex; gap: 40px; flex-wrap: wrap; margin-top: 20px;">
        <div ac-draggable-element
             data-clone="true"
             data-revert="true"
             style="padding:10px;margin:5px;background:#dff;border:1px solid #09f;cursor:grab;">
          Drag Me (Clone + Free Axis + Revert)
        </div>

        <div ac-draggable-target style="min-width:140px;min-height:100px;padding:10px;border:2px dashed #0f0;background:#f8fff8;">
          ✅ Valid Drop Zone
        </div>
        <div clone-target style="min-width:140px;min-height:100px;padding:10px;border:2px dashed #0f0;background:#585858;">

        </div>
      </div>
      </ac-draggable>
    `;

        const acDraggable = this.querySelector('ac-draggable') as AcDraggable;
        const draggableApi: AcDraggableApi = acDraggable.draggableApi;
        draggableApi.events.subscribeAllEvents({
          callback: (eventName: string, eventArgs: any) => {
            console.log(`Executed draggable event : ${eventName}`, eventArgs);
            if(eventName == AcEnumDraggableEvent.DragDrop){

              const clone = eventArgs.draggable.element.clone();

              console.log(this.querySelector('[clone-target]'),clone);
              this.querySelector('[clone-target]')?.append(clone);
            }
          }
        });
        console.log(acDraggable);

    // Initialize draggable system
    // const ac = new AcDraggable(this);

    // // Optional: Add event listeners for logging
    // this.addEventListener('ac:drag:start', e => console.log('🔵 drag started', e));
    // this.addEventListener('ac:drag:move', e => console.log('🟡 drag move', e));
    // this.addEventListener('ac:drop', (e: CustomEvent) => {
    //   const { element, target, clone } = e.detail;
    //   console.log('🟢 Dropped:', { element, clone });
    //   if (clone) {
    //     target.appendChild(clone);
    //   }
    // });
    // this.addEventListener('ac:drop:invalid', e => console.log('❌ Invalid drop', e));
    // this.addEventListener('ac:drag:revert', e => console.log('🔁 Reverted drag', e));
  }
}
