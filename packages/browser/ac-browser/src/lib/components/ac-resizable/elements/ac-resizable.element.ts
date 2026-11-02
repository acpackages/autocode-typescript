import { AcEnumResizeDirection } from "../enums/ac-enum-resize-direction.enum";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_RESIZABLE_TAG } from "../_ac-resizable.export";
import { AcElementBase } from "../../../core/ac-element-base";
import { AcResizableCssClassName } from "../consts/ac-resizable-css-class-name.const";

export class AcResizable extends AcElementBase {
  private handles: Record<any, HTMLDivElement> = {} as any;
  private activeResizeCleanup?: () => void;

  constructor() {
    super();
    this.createHandles();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.activeResizeCleanup) {
      this.activeResizeCleanup();
    }
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
    if (event.button !== 0) return;
    event.preventDefault();

    const doc = this.ownerDocument;
    const win = doc.defaultView ?? window;

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = this.offsetWidth;
    const startHeight = this.offsetHeight;
    const startTop = this.offsetTop;
    const startLeft = this.offsetLeft;

    let dragOverlay: HTMLDivElement | null = null;
    let isResizing = true;

    if (doc && doc.body) {
      doc.body.classList.add(AcResizableCssClassName.acResizing);
      dragOverlay = doc.createElement('div');
      dragOverlay.classList.add(AcResizableCssClassName.acResizableDragOverlay);
      dragOverlay.style.position = 'fixed';
      dragOverlay.style.top = '0';
      dragOverlay.style.left = '0';
      dragOverlay.style.width = '100vw';
      dragOverlay.style.height = '100vh';
      dragOverlay.style.zIndex = '999999';
      dragOverlay.style.userSelect = 'none';
      dragOverlay.style.background = 'transparent';
      doc.body.appendChild(dragOverlay);
    }

    const cleanup = () => {
      if (!isResizing) return;
      isResizing = false;
      this.activeResizeCleanup = undefined;

      if (dragOverlay && dragOverlay.parentNode) {
        dragOverlay.remove();
      }
      dragOverlay = null;

      if (doc && doc.body) {
        doc.body.classList.remove(AcResizableCssClassName.acResizing);
      }

      doc.removeEventListener('mousemove', onMouseMove);
      doc.removeEventListener('mouseup', onMouseUp);
      win.removeEventListener('blur', onBlur);
    };

    this.activeResizeCleanup = cleanup;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
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
      cleanup();
    };

    const onBlur = () => {
      cleanup();
    };

    doc.addEventListener('mousemove', onMouseMove);
    doc.addEventListener('mouseup', onMouseUp);
    win.addEventListener('blur', onBlur);
  }
}

acRegisterCustomElement({ tag: AC_RESIZABLE_TAG.resizable, type: AcResizable });
