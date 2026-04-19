import { AcDraggable, AcDraggableApi, AcEnumDraggableEvent } from "@autocode-ts/ac-browser";

export class DraggableGroupedTestPage extends HTMLElement {
  static observedAttributes = [];

  connectedCallback() {
    this.innerHTML = `
      <h3>Grouped Drag & Drop</h3>
      <p>Only items from Group A can be dropped into Target A. Same for B.</p>

      <ac-draggable>
      <div style="display: flex; gap: 40px;">
        <div>
          <h4>Draggables</h4>
          <div ac-draggable-element ac-draggable-element-tags="groupA" style="padding:10px;margin:5px;background:#eaf;">
            <i class='fa fa-grip' ac-draggable-handle></i> Item A1
          </div>
          <div ac-draggable-element ac-draggable-element-tags="groupA" style="padding:10px;margin:5px;background:#eaf;">
            <i class='fa fa-grip' ac-draggable-handle></i>  Item A2
          </div>
          <div ac-draggable-element ac-draggable-element-tags="groupB" style="padding:10px;margin:5px;background:#fee;">
            <i class='fa fa-grip' ac-draggable-handle></i>  Item B1
          </div>
          <div ac-draggable-element ac-draggable-element-tags="groupB" style="padding:10px;margin:5px;background:#fee;">
            <i class='fa fa-grip' ac-draggable-handle></i>  Item B2
            </div>
          <div ac-draggable-element ac-draggable-element-tags="groupA,groupB" style="padding:10px;margin:5px;background:#cee;">
            <i class='fa fa-grip' ac-draggable-handle></i> Item AB1
          </div>
          <div ac-draggable-element ac-draggable-element-tags="groupA,groupB" style="padding:10px;margin:5px;background:#cee;">
            <i class='fa fa-grip' ac-draggable-handle></i> Item AB2
          </div>
        </div>
        <div style="display: flex; gap: 20px;">
          <div ac-draggable-target ac-draggable-target-accepted-tags="groupA"
               style="min-width:120px;min-height:100px;padding:10px;border:2px dashed #66f;background:#f8f8ff;">
            Target A (accepts A & AB only)
          </div>
          <div ac-draggable-target ac-draggable-target-accepted-tags="groupB"
               style="min-width:120px;min-height:100px;padding:10px;border:2px dashed #f66;background:#fff8f8;">
            Target B (accepts B & AB only)
          </div>
        </div>
      </div>

        </ac-draggable>
    `;


    const acDraggable = this.querySelector('ac-draggable') as AcDraggable;
    const draggableApi: AcDraggableApi = acDraggable.draggableApi;
    draggableApi.events.subscribeAllEvents({
      callback: (eventName: string, eventArgs: any) => {
        console.log(`Executed draggable event : ${eventName}`, eventArgs);
        if (eventName == AcEnumDraggableEvent.DragDrop) {
          console.log("Setting element", eventArgs);
          eventArgs.targetInstance.element.append(eventArgs.elementInstance.element);
        }
      }
    });
    console.log(acDraggable);
  }
}
