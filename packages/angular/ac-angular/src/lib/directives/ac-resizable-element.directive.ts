/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @angular-eslint/prefer-standalone */
/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable @angular-eslint/directive-selector */
import { Directive, ElementRef, Renderer2, NgZone, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AcBase } from '../_base/ac-base.component';
import { AutocodeService } from '../services/autocode.service';

@Directive({
  selector: '[acResizableElement]',
  standalone: false
})
export class AcResizableElementDirective extends AcBase implements OnDestroy {
  @Output() onResize = new EventEmitter<{ width: number; height: number }>();

  private resizing = false;
  private element: HTMLElement;
  private resizeHandle!: HTMLDivElement;
  private dragOverlay?: HTMLDivElement;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  constructor(elementRef: ElementRef, autocodeService: AutocodeService, private renderer: Renderer2, private ngZone: NgZone) {
    super(elementRef, autocodeService);
    this.element = this.elementRef.nativeElement;
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.createResizeHandle();
  }

  override ngOnDestroy(): void {
    if (this.resizing) {
      this.handleMouseUp();
    }
    super.ngOnDestroy();
  }

  private createResizeHandle(): void {
    this.resizeHandle = this.renderer.createElement('div');
    this.renderer.setStyle(this.resizeHandle, 'width', '3px');
    this.renderer.setStyle(this.resizeHandle, 'height', '25px');
    this.renderer.setStyle(this.resizeHandle, 'float', 'right');
    this.renderer.setStyle(this.resizeHandle, 'cursor', 'col-resize');
    this.renderer.setStyle(this.resizeHandle, 'margin-right', '-2px');
    this.renderer.setStyle(this.resizeHandle, 'background', 'rgba(0, 0, 0, 0)');
    this.renderer.appendChild(this.element, this.resizeHandle);
    this.renderer.listen(this.resizeHandle, 'mousedown', (event: MouseEvent) => this.startResize(event));
  }

  private startResize(event: MouseEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    this.resizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.element.offsetWidth;
    this.startHeight = this.element.offsetHeight;

    const doc = this.element.ownerDocument;
    if (doc && doc.body) {
      doc.body.classList.add('ac-resizing');
      this.dragOverlay = doc.createElement('div');
      this.dragOverlay.className = 'ac-resizable-drag-overlay';
      this.dragOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;cursor:col-resize;user-select:none;background:transparent;';
      doc.body.appendChild(this.dragOverlay);
    }

    this.ngZone.runOutsideAngular(() => {
      doc.addEventListener('mousemove', this.handleMouseMove);
      doc.addEventListener('mouseup', this.handleMouseUp);
      (doc.defaultView ?? window).addEventListener('blur', this.handleMouseUp);
    });
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.resizing) return;

    const newWidth = this.startWidth + (event.clientX - this.startX);
    const newHeight = this.startHeight + (event.clientY - this.startY);

    this.renderer.setStyle(this.element, 'width', `${newWidth}px`);
    // this.renderer.setStyle(this.element, 'height', `${newHeight}px`);

    this.ngZone.run(() => this.onResize.emit({ width: newWidth, height: newHeight }));
  };

  private handleMouseUp = () => {
    if (!this.resizing) return;
    this.resizing = false;

    if (this.dragOverlay && this.dragOverlay.parentNode) {
      this.dragOverlay.remove();
      this.dragOverlay = undefined;
    }

    const doc = this.element.ownerDocument;
    if (doc && doc.body) {
      doc.body.classList.remove('ac-resizing');
    }

    doc.removeEventListener('mousemove', this.handleMouseMove);
    doc.removeEventListener('mouseup', this.handleMouseUp);
    (doc.defaultView ?? window).removeEventListener('blur', this.handleMouseUp);
  };
}
