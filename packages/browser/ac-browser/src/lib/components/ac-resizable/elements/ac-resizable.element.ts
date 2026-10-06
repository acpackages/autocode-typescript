import { AcEnumResizeDirection } from "../enums/ac-enum-resize-direction.enum";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_RESIZABLE_TAG } from "../_ac-resizable.export";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcResizable extends AcElementBase{
  private handles: Record<any, HTMLDivElement> = {} as any;

  constructor() {
    super();
    this.createHandles();
  }

  private createHandles() {
    const directions: any[] = Object.values(AcEnumResizeDirection);

    directions.forEach((dir) => {
      const handle = this.ownerDocument.createElement('div');
      handle.classList.add('ac-resize-handle', `ac-resize-${dir}`);
      handle.addEventListener('mousedown', (e) => this.startResize(e, dir));
      this.appendChild(handle);
      this.handles[dir] = handle;
    });
  }

  private startResize(event: MouseEvent, dir: AcEnumResizeDirection) {
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = this.offsetWidth;
    const startHeight = this.offsetHeight;
    const startTop = this.offsetTop;
    const startLeft = this.offsetLeft;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (dir.includes('right')) {
        this.style.width = `${startWidth + dx}px`;
      }
      if (dir.includes('left')) {
        this.style.width = `${startWidth - dx}px`;
        this.style.left = `${startLeft + dx}px`;
      }
      if (dir.includes('bottom')) {
        this.style.height = `${startHeight + dy}px`;
      }
      if (dir.includes('top')) {
        this.style.height = `${startHeight - dy}px`;
        this.style.top = `${startTop + dy}px`;
      }
    };

    const onMouseUp = () => {
      this.ownerDocument.removeEventListener('mousemove', onMouseMove);
      this.ownerDocument.removeEventListener('mouseup', onMouseUp);
    };

    this.ownerDocument.addEventListener('mousemove', onMouseMove);
    this.ownerDocument.addEventListener('mouseup', onMouseUp);
  }
}

acRegisterCustomElement({tag:AC_RESIZABLE_TAG.resizable,type:AcResizable});
