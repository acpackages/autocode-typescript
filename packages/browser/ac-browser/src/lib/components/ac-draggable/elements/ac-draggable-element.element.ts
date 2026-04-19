/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Autocode } from "@autocode-ts/autocode";
import { AcDraggableApi } from "../core/ac-draggable-api";
import { AcDraggableAttributeName } from "../_ac-draggable.export";
import { acCopyElementStyles } from "../../../utils/ac-element-functions";
import { IAcDraggableDraggingPreviewCreatorArgs } from "../interfaces/ac-dragging-placeholder-creator-args.interface";

export class AcDraggableElement {
  get elementTags(): string[] {
    const result: string[] = [];
    if (this.element.hasAttribute(AcDraggableAttributeName.acDraggableElementTags)) {
      const tags = this.element.getAttribute(AcDraggableAttributeName.acDraggableElementTags);
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

  get hasElementTags(): boolean {
    return this.element.hasAttribute(AcDraggableAttributeName.acDraggableElementTags);
  }

  get hasHandles(): boolean {
    return this.handleElements.length > 0;
  }

  draggableApi!: AcDraggableApi;
  element!: HTMLElement;
  id: string = Autocode.uuid();
  originalUserSelect: any;
  originalCursor:any;
  handleElements: HTMLElement[] = [];


  constructor({ draggableApi, element }: { draggableApi: AcDraggableApi, element: HTMLElement }) {
    this.draggableApi = draggableApi;
    this.element = element;
  }

  initElement(): void {
    if (this.element.hasAttribute(AcDraggableAttributeName.acDraggableElementId)) return;
    this.element.setAttribute(AcDraggableAttributeName.acDraggableElementId, this.id);

    this.draggableApi.elementInstances[this.id] = this;

    if (!this.element.hasAttribute(AcDraggableAttributeName.acDraggableElement)){
      this.element.setAttribute(AcDraggableAttributeName.acDraggableElement,"");
    }

    this.element.querySelectorAll(`[${AcDraggableAttributeName.acDraggableHandle}]`).forEach((el) => {
      this.registerHandle(el as HTMLElement);
    });
    let offsetX = 0;
    let offsetY = 0;
    let preview: HTMLElement | null = null;

    const onMouseDown = (e: MouseEvent | TouchEvent): void => {
      let validElement: boolean = true;
      const targetElement = e.target as HTMLElement;
      if (this.hasHandles) {
        if (!this.handleElements.includes(targetElement)) {
          validElement = false;
        }
      }
      if (validElement) {
        const point = e instanceof TouchEvent ? e.touches[0] : e;
        const originalRect = this.element.getBoundingClientRect();
        offsetX = point.clientX - this.element.getBoundingClientRect().left;
        offsetY = point.clientY - this.element.getBoundingClientRect().top;
        this.originalUserSelect = document.body.style.userSelect;
        this.originalCursor = document.body.style.cursor;
        document.body.style.userSelect = 'none';
        document.body.style.setProperty('cursor', 'grabbing', 'important');
        const creatorArgs:IAcDraggableDraggingPreviewCreatorArgs = {
          draggableApi:this.draggableApi,
          elementInstance:this,
          event:e
        };
        preview = this.draggableApi.draggingPlaceholderCreator(creatorArgs);

        if(preview){
          acCopyElementStyles({ fromElement: this.element, toElement: preview });

          Object.assign(preview.style, {
            position: 'absolute',
            pointerEvents: 'none',
            opacity: '1',
            zIndex: '1000',
            left: `${point.clientX - offsetX}px`,
            top: `${point.clientY - offsetY}px`,
            userSelect: `none`
          });
          document.body.appendChild(preview);
        }


        const onMouseMove = (moveEvent: MouseEvent | TouchEvent): void => {
          const x = (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientX : moveEvent.clientX);
          const y = (moveEvent instanceof TouchEvent ? moveEvent.touches[0].clientY : moveEvent.clientY);

          let newLeft = x - offsetX;
          let newTop = y - offsetY;

          // ✅ Check for snap grid
          const gridSizeAttr = this.element.getAttribute(AcDraggableAttributeName.acDraggableSnapGridSize);
          const gridSize = gridSizeAttr ? parseInt(gridSizeAttr, 10) : 0;

          if (gridSize > 0) {
            newLeft = Math.round(newLeft / gridSize) * gridSize;
            newTop = Math.round(newTop / gridSize) * gridSize;
          }

          if (this.element.hasAttribute(AcDraggableAttributeName.acDraggableLockXAxis)) {
            newTop = originalRect.top;
          }
          if (this.element.hasAttribute(AcDraggableAttributeName.acDraggableLockYAxis)) {
            newLeft = originalRect.left;
          }

          if (preview) {
            preview.style.left = `${newLeft}px`;
            preview.style.top = `${newTop}px`;
          }
        };

        const onMouseUp = (upEvent: MouseEvent | TouchEvent): void => {
          document.body.style.userSelect = this.originalUserSelect;
          document.body.style.cursor = this.originalCursor;
          let validDrop: boolean = false;
          const dropX = (upEvent instanceof TouchEvent ? upEvent.changedTouches[0].clientX : upEvent.clientX);
          const dropY = (upEvent instanceof TouchEvent ? upEvent.changedTouches[0].clientY : upEvent.clientY);
          const dropTarget = document.elementFromPoint(dropX, dropY)?.closest(`[${AcDraggableAttributeName.acDraggableTargetId}]`) as HTMLElement | null;
          if (dropTarget) {
            const targetId = dropTarget.getAttribute(AcDraggableAttributeName.acDraggableTargetId);
            if (targetId) {
              const targetInstance = this.draggableApi.targetInstances[targetId]
              if (targetInstance) {
                validDrop = true;
                if (this.hasElementTags || targetInstance.hasAcceptedTags) {
                  validDrop = false;
                  if (this.hasElementTags && targetInstance.hasAcceptedTags) {
                    let foundTag: boolean = false;
                    const elementTags = this.elementTags;
                    const acceptedTags = targetInstance.acceptedTags;
                    for (const elementTag of elementTags) {
                      if (acceptedTags.includes(elementTag)) {
                        foundTag = true;
                        break;
                      }
                    }
                    if (foundTag) {
                      validDrop = true;
                    }
                  }
                }
                if (validDrop) {
                  this.draggableApi.handleDrop({ elementInstance: this, targetInstance: targetInstance, event: upEvent });
                  preview?.remove();
                }
              }
            }
          }
          if (!validDrop) {
            this.draggableApi.handleDropInvalid({ elementInstance: this, event: upEvent });
            if (preview) {
              const currentRect = preview.getBoundingClientRect();
              const dx = originalRect.left - currentRect.left;
              const dy = originalRect.top - currentRect.top;

              preview.style.transition = 'transform 0.3s ease';
              preview.style.transform = `translate(${dx}px, ${dy}px)`;

              preview.addEventListener('transitionend', () => {
                preview?.remove();
              }, { once: true });
            }

          }
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.removeEventListener('touchmove', onMouseMove);
          document.removeEventListener('touchend', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove, { passive: true });
        document.addEventListener('touchend', onMouseUp, { passive: true });

        this.draggableApi.handleDragStart({ elementInstance: this, event: e });
      }
    };

    this.element.addEventListener('mousedown', onMouseDown);
    this.element.addEventListener('touchstart', onMouseDown, { passive: true });
  }

  registerHandle(element:HTMLElement){
    this.handleElements.push(element);
    element.style.cursor = 'grab';
  }

}
