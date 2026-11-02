/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcResizableAttributeName } from "../consts/ac-resizable-attribute-name.const";
import { AcResizableCssClassName } from "../consts/ac-resizable-css-class-name.const";
import { AcElementBase } from "../../../core/ac-element-base";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_RESIZABLE_TAG } from "../consts/ac-resizable-tag.const";
import { AcResizablePanels } from "./ac-resizable-panels.element";

export class AcResizablePanel extends AcElementBase {
  get index(): number {
    return this.hasAttribute("index") ? parseInt(this.getAttribute("index")!) : -1;
  }
  set index(value: number) {
    this.setAttribute("index", `${value}`);
  }

  private _isLast: boolean = false;
  get isLast(): boolean {
    return this._isLast;
  }
  set isLast(value: boolean) {
    this._isLast = true;
    if(!value){
      this.setupHandles();
    }
    else{
      if(this.resizeHandle){
        this.resizeHandle.remove();
      }
      this.resizeHandle = undefined;
    }
  }

  get isHorizontal(): boolean {
    return this.resizablePanels!.isHorizontal;
  }

  get nextSiblingPanel(): AcResizablePanel | undefined {
    return this.resizablePanels!.panels[this.index + 1];
  }

  get previousSiblingPanel(): AcResizablePanel | undefined {
    return this.resizablePanels!.panels[this.index - 1];
  }

  private _size: number = 0;
  get size(): number {
    return this._size;
  }
  set size(value: number) {
    if (this._size != value) {
      this._size = value;
      this.updateSize();
    }
  }

  private resizeObserver!: ResizeObserver;
  resizablePanels?: AcResizablePanels;
  private resizeHandle?: HTMLElement;
  private activeResizeCleanup?: () => void;

  constructor() {
    super();
    this.style.flexGrow = '1';
    this.style.flexShrink = '1';
    this.style.overflow = 'auto';
    this.style.display = 'flex';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => {
      this.events.execute({ event: 'panelresize' });
    });
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver.disconnect();
    if (this.activeResizeCleanup) {
      this.activeResizeCleanup();
    }
  }

  override init(): void {
    super.init();
    this.notifyResizablePanels();
  }

  private notifyResizablePanels() {
    const resizablePanelsParent = this.closest(AC_RESIZABLE_TAG.resizablePanels);
    if (resizablePanelsParent) {
      this.resizablePanels = resizablePanelsParent! as AcResizablePanels;
      this.resizablePanels.registerResizablePanel(this);
    }
    else {
      this.delayedCallback.add({callback:() => {
        this.notifyResizablePanels();
      }, duration:50});
    }
  }

  private setupHandles() {
    if (this.resizablePanels) {
      this.resizeHandle = this.ownerDocument.createElement('div');
      this.resizeHandle.classList.add(AcResizableAttributeName.acResizeHandle);
      this.resizeHandle.style.cursor = this.isHorizontal ? 'col-resize' : 'row-resize';
      this.resizeHandle.style.background = '#ccc';
      this.resizeHandle.style.zIndex = '10';
      this.resizeHandle.style.position = 'relative';
      this.resizeHandle.style.userSelect = 'none';
      if (this.isHorizontal) {
        this.resizeHandle.style.width = '2px';
        this.resizeHandle.style.minWidth = '2px';
        this.resizeHandle.style.marginLeft = '-1px';
        this.resizeHandle.style.marginRight = '-1px';
        this.resizeHandle.style.height = '100%';
      }
      else {
        this.resizeHandle.style.height = '2px';
        this.resizeHandle.style.minHeight = '2px';
        this.resizeHandle.style.marginTop = '-1px';
        this.resizeHandle.style.marginBottom = '-1px';
        this.resizeHandle.style.width = '100%';
      }

      this.insertAdjacentElement('afterend', this.resizeHandle);

      let startPos = 0;
      let startSizes: number[] = [];
      let originalCursor = '';
      let originalUserSelect = '';
      let dragOverlay: HTMLDivElement | null = null;
      let isResizing = false;

      const cleanupResize = () => {
        if (!isResizing) return;
        isResizing = false;
        this.activeResizeCleanup = undefined;

        if (dragOverlay && dragOverlay.parentNode) {
          dragOverlay.remove();
        }
        dragOverlay = null;

        const doc = this.ownerDocument;
        const win = doc.defaultView ?? window;

        if (doc && doc.body) {
          doc.body.classList.remove(AcResizableCssClassName.acResizing);
        }

        doc.removeEventListener('mousemove', onMouseMove);
        doc.removeEventListener('mouseup', onMouseUp);
        win.removeEventListener('blur', onBlur);

        this.style.userSelect = originalUserSelect;
        this.style.cursor = originalCursor;

        this.events.execute({ event: 'endresize', args: { startPos, startSizes } });
      };

      const onMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!this.nextSiblingPanel) return;

        e.preventDefault();
        e.stopPropagation();

        isResizing = true;
        this.activeResizeCleanup = cleanupResize;

        const doc = this.ownerDocument;
        const win = doc.defaultView ?? window;

        startPos = this.isHorizontal ? e.clientX : e.clientY;
        startSizes = [
          this.getBoundingClientRect()[this.isHorizontal ? 'width' : 'height'],
          this.nextSiblingPanel.getBoundingClientRect()[this.isHorizontal ? 'width' : 'height']
        ];
        this.events.execute({ event: 'startresize', args: { startPos, startSizes } });

        // Add class to body to disable pointer events on all iframes and prevent text selection
        if (doc && doc.body) {
          doc.body.classList.add(AcResizableCssClassName.acResizing);
        }

        // Create transparent full-screen overlay to intercept all pointer events
        dragOverlay = doc.createElement('div');
        dragOverlay.classList.add(AcResizableCssClassName.acResizableDragOverlay);
        dragOverlay.style.position = 'fixed';
        dragOverlay.style.top = '0';
        dragOverlay.style.left = '0';
        dragOverlay.style.width = '100vw';
        dragOverlay.style.height = '100vh';
        dragOverlay.style.zIndex = '999999';
        dragOverlay.style.cursor = this.resizeHandle!.style.cursor;
        dragOverlay.style.userSelect = 'none';
        dragOverlay.style.background = 'transparent';

        if (doc && doc.body) {
          doc.body.appendChild(dragOverlay);
        }

        originalCursor = this.style.cursor;
        originalUserSelect = this.style.userSelect;
        this.style.cursor = this.resizeHandle!.style.cursor;
        this.style.userSelect = 'none';

        doc.addEventListener('mousemove', onMouseMove);
        doc.addEventListener('mouseup', onMouseUp);
        win.addEventListener('blur', onBlur);
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isResizing || !this.nextSiblingPanel) return;
        const delta = (this.isHorizontal ? e.clientX : e.clientY) - startPos;
        const total = startSizes[0] + startSizes[1];
        const firstCurrentPercent = this.size;
        const secondCurrentPercent = this.nextSiblingPanel.size;
        const currentPanelsTotal = firstCurrentPercent + secondCurrentPercent;
        let firstNewSize = ((startSizes[0] + delta) / total) * currentPanelsTotal;
        let secondNewSize = ((startSizes[1] - delta) / total) * currentPanelsTotal;
        firstNewSize = Math.max(5, Math.min(95, firstNewSize));
        secondNewSize = currentPanelsTotal - firstNewSize;
        this.size = firstNewSize;
        this.nextSiblingPanel.size = secondNewSize;
        this.events.execute({ event: 'resize', args: { startPos, startSizes, firstNewSize, secondNewSize } });
      };

      const onMouseUp = () => {
        cleanupResize();
      };

      const onBlur = () => {
        cleanupResize();
      };

      this.resizeHandle.addEventListener('mousedown', onMouseDown);
    }
  }

  updateSize() {
    if (this.resizablePanels) {
      this.style.flexGrow = "0";
      this.style.flexShrink = "0";
      // this.style.transition = "flex-basis 0.3s ease";
      this.style.flexBasis = `${this.size}%`;
      this.delayedCallback.add({callback:() => {
        if (this.isHorizontal) {
          this.style.minWidth = `${this.size}%`;
          this.style.maxWidth = `${this.size}%`;
          this.delayedCallback.add({callback:() => {
            this.resizablePanels!.updateAllowed = false;
            this.style.minWidth = ``;
            this.style.maxWidth = ``;
            this.delayedCallback.add({callback:() => {
              this.resizablePanels!.updateAllowed = true;
            },duration: 100});
          }, duration:500});
        }
        else {
          this.style.minHeight = `${this.size}%`;
          this.style.maxHeight = `${this.size}%`;
          this.delayedCallback.add({callback:() => {
            this.resizablePanels!.updateAllowed = false;
            this.style.minHeight = ``;
            this.style.maxHeight = ``;
            this.delayedCallback.add({callback:() => {
              this.resizablePanels!.updateAllowed = true;
            }, duration:100});
          }, duration:100});
        }
        this.style.transition = "";
      }, duration:300});
    }
  }

}

acRegisterCustomElement({ tag: AC_RESIZABLE_TAG.resizablePanel, type: AcResizablePanel });
