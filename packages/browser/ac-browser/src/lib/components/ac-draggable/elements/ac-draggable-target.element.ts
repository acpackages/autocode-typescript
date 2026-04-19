import { Autocode } from "@autocode-ts/autocode";
import { AcDraggableApi } from "../core/ac-draggable-api";
import { AcDraggableAttributeName } from "../_ac-draggable.export";

export class AcDraggableTarget {
  get acceptedTags(): string[] {
    const result: string[] = [];
    if (this.element.hasAttribute(AcDraggableAttributeName.acDraggableTargetAcceptedTags)) {
      const tags = this.element.getAttribute(AcDraggableAttributeName.acDraggableTargetAcceptedTags);
      if (tags) {
        for (const tag of tags.split(",")) {
          if (tag.trim()) {
            result.push(tag.trim());
          }
        }
      }
    }
    return result;
  }

  get hasAcceptedTags(): boolean {
    return this.element.hasAttribute(AcDraggableAttributeName.acDraggableTargetAcceptedTags);
  }

  draggableApi!: AcDraggableApi;
  element!: HTMLElement;
  originalUserSelect: any;
  id: string = Autocode.uuid();

  constructor({ draggableApi, element }: { draggableApi: AcDraggableApi, element: HTMLElement }) {
    this.draggableApi = draggableApi;
    this.element = element;
    this.initElement();
  }

  initElement(): void {
    if (this.element.hasAttribute(AcDraggableAttributeName.acDraggableTargetId)) return;
    this.element.setAttribute(AcDraggableAttributeName.acDraggableTargetId, this.id);

    this.draggableApi.targetInstances[this.id] = this;

    if (!this.element.hasAttribute(AcDraggableAttributeName.acDraggableTarget)){
      this.element.setAttribute(AcDraggableAttributeName.acDraggableTarget,"");
    }

    const onMouseEnter = (event: MouseEvent | TouchEvent): void => {
      if (this.draggableApi.draggingElement && this.draggableApi.draggingElement.element != this.element) {
        this.draggableApi.handleDragEnter({targetInstance:this,event:event});
      }

    };

    const onMouseLeave = (event: MouseEvent | TouchEvent): void => {
      if (this.draggableApi.draggingElement && this.draggableApi.draggingElement.element != this.element) {
        this.draggableApi.handleDragLeave({targetInstance:this,event:event});
      }
    };

    const onMouseMove = (event: MouseEvent | TouchEvent): void => {
      if (this.draggableApi.draggingElement && this.draggableApi.draggingElement.element != this.element) {
        this.draggableApi.handleDragOver({targetInstance:this,event:event});
      }
    };

    // Mouse events
    this.element.addEventListener("mouseenter", onMouseEnter);
    this.element.addEventListener("mouseleave", onMouseLeave);
    this.element.addEventListener("mousemove", onMouseMove);

    // Touch events
    this.element.addEventListener("touchstart", onMouseEnter, { passive: true });
    this.element.addEventListener("touchend", onMouseLeave, { passive: true });
    this.element.addEventListener("touchcancel", onMouseLeave, { passive: true });
    this.element.addEventListener("touchmove", onMouseMove, { passive: true });
  }
}
