import { AcDraggable, AcDraggableApi } from "@autocode-ts/ac-browser";

export class DraggableBasicPage extends HTMLElement {
  public static observedAttributes = [];

  async connectedCallback() {
    this.innerHTML = `
      <div>
        <h3>Basic Drag & Drop</h3>
        <div style="display: flex; gap: 16px;">
        <ac-draggable>
          <div ac-draggable-element style="padding: 10px; background: #dde; border: 1px solid #999; cursor: grab;">
            Drag Me
          </div>
          <div ac-draggable-target style="width: 100px; height: 100px; border: 2px dashed #999; display: flex; align-items: center; justify-content: center;">
            Drop Here
          </div>
          </ac-draggable>
        </div>
      </div>
    `;

    const acDraggable = this.querySelector('ac-draggable') as AcDraggable;
    const draggableApi:AcDraggableApi = acDraggable.draggableApi;
    draggableApi.events.subscribeAllEvents({callback:(eventName:string,eventArgs:any)=>{
      console.log(`Executed draggable event : ${eventName}`,eventArgs);
    }});
    console.log(acDraggable);
  }
}
