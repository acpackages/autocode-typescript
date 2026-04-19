import { AcEvents, acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AcDraggable } from "../elements/ac-draggable.element";
import { AcDraggableSortElement, AcEnumDraggableEvent } from "../_ac-draggable.export";
import { AcDraggableTarget } from "../elements/ac-draggable-target.element";
import { AcDraggableElement } from "../elements/ac-draggable-element.element";
import { IAcDraggableDragDropEvent } from "../interfaces/ac-draggable-drag-drop-event.interface";
import { IAcDraggableDragEvent } from "../interfaces/ac-draggable-drag-event.interface";
import { IAcDraggableDraggingPreviewCreatorArgs } from "../interfaces/ac-dragging-placeholder-creator-args.interface";
import { acCopyElementStyles } from "../../../utils/ac-element-functions";
import { AcSortable } from "../elements/ac-sortable.element";

export class AcDraggableApi {
  instance: AcDraggable|AcSortable;
  elementInstances: Record<string, AcDraggableElement> = {};
  events: AcEvents = new AcEvents();
  targetInstances: Record<string, AcDraggableTarget> = {};
  draggingElement?: AcDraggableElement;
  draggingPlaceholderCreator: Function = (args: IAcDraggableDraggingPreviewCreatorArgs): HTMLElement => {
    const preview = args.elementInstance.element.cloneNode(true) as HTMLElement;
    acCopyElementStyles({ fromElement: args.elementInstance.element, toElement: preview });
    const originalRect = args.elementInstance.element.getBoundingClientRect();
    Object.assign(preview.style, {
      width: `${originalRect.width}px`,
      height: `${originalRect.height}px`
    });
    return preview;
  };

  constructor({ instance }: { instance: AcDraggable|AcSortable }) {
    this.instance = instance;
  }

  destroy(){
    this.events.destroy();
    acNullifyInstanceProperties({instance:this});
  }

  handleDragEnter({ targetInstance, event }: { targetInstance: AcDraggableTarget, event: MouseEvent | TouchEvent }): void {
    const eventArgs: any = {
      draggableApi: this,
      elementInstance: this.draggingElement,
      targetInstance: targetInstance,
      event: event
    };
    this.events.execute({ event: AcEnumDraggableEvent.DragEnter, args: eventArgs });
  }

  handleDragOver({ targetInstance, event }: { targetInstance: AcDraggableTarget, event: MouseEvent | TouchEvent }): void {
    const eventArgs: any = {
      draggableApi: this,
      elementInstance: this.draggingElement,
      targetInstance: targetInstance,
      event: event
    };
    // this.events.execute({event:AcEnumDraggableEvent.DragOver,args:eventArgs});
  }

  handleDragLeave({ targetInstance, event }: { targetInstance: AcDraggableTarget, event: MouseEvent | TouchEvent }): void {
    const eventArgs: any = {
      draggableApi: this,
      elementInstance: this.draggingElement,
      targetInstance: targetInstance,
      event: event
    };
    this.events.execute({ event: AcEnumDraggableEvent.DragLeave, args: eventArgs });
  }

  handleDragStart({ elementInstance, event }: { elementInstance: AcDraggableElement, event: MouseEvent | TouchEvent }): void {
    this.draggingElement = elementInstance;
    const eventArgs: IAcDraggableDragEvent = {
      draggableApi: this,
      elementInstance: elementInstance,
      event: event
    };
    this.events.execute({ event: AcEnumDraggableEvent.DragStart, args: eventArgs });
  }

  handleDrop({ elementInstance, targetInstance, event }: { elementInstance: AcDraggableElement, targetInstance: AcDraggableTarget, event: MouseEvent | TouchEvent }): void {
    this.draggingElement = undefined;
    const eventArgs: IAcDraggableDragDropEvent = {
      draggableApi: this,
      elementInstance: elementInstance,
      targetInstance: targetInstance,
      event: event
    };
    this.events.execute({ event: AcEnumDraggableEvent.DragDrop, args: eventArgs });
  }

  handleDropInvalid({ elementInstance, event }: { elementInstance: AcDraggableElement, event: MouseEvent | TouchEvent }): void {
    const eventArgs: IAcDraggableDragEvent = {
      draggableApi: this,
      elementInstance: elementInstance,
      event: event
    };
    this.events.execute({ event: AcEnumDraggableEvent.DragDropInvalid, args: eventArgs });
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event: event, callback: callback });
  }

  registerDraggableElement({element}:{element: HTMLElement}): AcDraggableElement {
    return new AcDraggableElement({ draggableApi: this, element: element });
  }

  registerDraggableSortElement({element}:{element: HTMLElement}): AcDraggableSortElement {
    return  new AcDraggableSortElement({ draggableApi: this, element: element });
  }

  registerTargetElement({element}:{element: HTMLElement}): AcDraggableTarget {
    return new AcDraggableTarget({ draggableApi: this, element: element });
  }


}
