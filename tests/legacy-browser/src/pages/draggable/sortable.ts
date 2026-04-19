import { AcDraggable, AcSortable, AcEnumDraggableEvent, acSwapElementsWithAnimation } from "@autocode-ts/ac-browser";
import { AcDraggableApi } from "@autocode-ts/ac-browser";

export class DraggableSortablePage extends HTMLElement {
  public static observedAttributes = [];

  async connectedCallback() {
    this.innerHTML = `
      <style>
        .tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 16px;
          border: 1px solid #ccc;
        }
        .tag-item {
          padding: 6px 12px;
          background-color: #007bff;
          color: white;
          border-radius: 16px;
          cursor: move;
          user-select: none;
        }
      </style>

      <div>
        <h3>Sortable Tags</h3>
        <ac-sortable>
        <div class="tag-container">
          <div class="tag-item" ac-draggable-element ac-draggable-target data-id="1">Tag One</div>
          <div class="tag-item" ac-draggable-element ac-draggable-target data-id="2">Tag Two</div>
          <div class="tag-item" ac-draggable-element ac-draggable-target data-id="3">Tag Three</div>
          <div class="tag-item" ac-draggable-element ac-draggable-target data-id="4">Tag Four</div>
        </div>
          </ac-sortable>
      </div>
    `;

    const acDraggable = new AcSortable();
    // const draggableApi: AcDraggableApi = acDraggable.draggableApi;

    // // Optional: Listen to all drag/drop events
    // draggableApi.events.subscribeAllEvents({
    //   callback: (eventName: string, eventArgs: any) => {
    //     console.log(`Sortable Event: ${eventName}`, eventArgs);
    //   },
    // });

    // // Optional: Override drop handler for reordering logic
    // draggableApi.on({eventName:AcEnumDraggableEvent.DragDrop,
    //   callback: (args:IAcDraggableDragDropEvent) => {
    //     // if (!args.elementInstance || !args.targetInstance) return;
    //     // console.log(args,args.targetInstance.element,args.elementInstance.element);
    //     // setTimeout(() => {
    //     //   acSwapElementsWithAnimation({
    //     //     element1:args.elementInstance.element,
    //     //     element2:args.targetInstance.element,
    //     //     element1Duration:0
    //     //   });
    //     // }, 100);
    //   },
    // });

    console.log(acDraggable);
  }
}
