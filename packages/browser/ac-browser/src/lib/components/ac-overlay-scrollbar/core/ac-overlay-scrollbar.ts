/* eslint-disable @typescript-eslint/no-inferrable-types */
import { IAcOverlayScrollbarOptions } from "../interfaces/ac-overlay-scrollbar-options.interface";
import "../css/ac-overlay-scrollbar.css";

export class AcOverlayScrollbar {
  private target: HTMLElement;
  private host: HTMLElement;
  private verticalEnabled: boolean;
  private horizontalEnabled: boolean;
  private autoHideDelay: number;
  private minThumbSize: number;
  private onScrollCallback?: (event: Event) => void;

  private vTrack?: HTMLElement;
  private vThumb?: HTMLElement;
  private hTrack?: HTMLElement;
  private hThumb?: HTMLElement;

  private isDraggingV: boolean = false;
  private isDraggingH: boolean = false;
  private dragStartY: number = 0;
  private dragStartX: number = 0;
  private dragStartScrollTop: number = 0;
  private dragStartScrollLeft: number = 0;

  private hideTimeoutId: any = null;
  private resizeObserver?: ResizeObserver;
  private isDestroyed: boolean = false;

  // Bound event listeners for cleanup
  private boundOnScroll: (e: Event) => void;
  private boundOnPointerEnter: () => void;
  private boundOnPointerLeave: () => void;
  private boundOnVThumbPointerDown: (e: PointerEvent) => void;
  private boundOnVThumbPointerMove: (e: PointerEvent) => void;
  private boundOnVThumbPointerUp: (e: PointerEvent) => void;
  private boundOnVTrackPointerDown: (e: PointerEvent) => void;
  private boundOnHThumbPointerDown: (e: PointerEvent) => void;
  private boundOnHThumbPointerMove: (e: PointerEvent) => void;
  private boundOnHThumbPointerUp: (e: PointerEvent) => void;
  private boundOnHTrackPointerDown: (e: PointerEvent) => void;

  constructor(options: IAcOverlayScrollbarOptions) {
    this.target = options.target;
    this.host = options.host || (options.target.parentElement as HTMLElement) || options.target;
    this.verticalEnabled = options.vertical ?? true;
    this.horizontalEnabled = options.horizontal ?? true;
    this.autoHideDelay = options.autoHideDelay ?? 1000;
    this.minThumbSize = options.minThumbSize ?? 24;
    this.onScrollCallback = options.onScroll;

    this.boundOnScroll = (e) => this.handleScroll(e);
    this.boundOnPointerEnter = () => this.handlePointerEnter();
    this.boundOnPointerLeave = () => this.handlePointerLeave();
    this.boundOnVThumbPointerDown = (e) => this.handleVThumbPointerDown(e);
    this.boundOnVThumbPointerMove = (e) => this.handleVThumbPointerMove(e);
    this.boundOnVThumbPointerUp = (e) => this.handleVThumbPointerUp(e);
    this.boundOnVTrackPointerDown = (e) => this.handleVTrackPointerDown(e);
    this.boundOnHThumbPointerDown = (e) => this.handleHThumbPointerDown(e);
    this.boundOnHThumbPointerMove = (e) => this.handleHThumbPointerMove(e);
    this.boundOnHThumbPointerUp = (e) => this.handleHThumbPointerUp(e);
    this.boundOnHTrackPointerDown = (e) => this.handleHTrackPointerDown(e);

    this.init();
  }

  private init() {
    this.target.classList.add('ac-overlay-scroll-container');

    // Ensure host is relatively positioned if it's static
    const hostPos = window.getComputedStyle(this.host).position;
    if (hostPos === 'static') {
      this.host.style.position = 'relative';
    }

    if (this.verticalEnabled) {
      this.createVerticalTrack();
    }

    if (this.horizontalEnabled) {
      this.createHorizontalTrack();
    }

    this.registerListeners();
    this.setupResizeObserver();
    this.update();
  }

  private createVerticalTrack() {
    this.vTrack = document.createElement('div');
    this.vTrack.className = 'ac-os-track-v';

    this.vThumb = document.createElement('div');
    this.vThumb.className = 'ac-os-thumb-v';

    this.vTrack.appendChild(this.vThumb);
    this.host.appendChild(this.vTrack);

    this.vThumb.addEventListener('pointerdown', this.boundOnVThumbPointerDown);
    this.vTrack.addEventListener('pointerdown', this.boundOnVTrackPointerDown);
  }

  private createHorizontalTrack() {
    this.hTrack = document.createElement('div');
    this.hTrack.className = 'ac-os-track-h';

    this.hThumb = document.createElement('div');
    this.hThumb.className = 'ac-os-thumb-h';

    this.hTrack.appendChild(this.hThumb);
    this.host.appendChild(this.hTrack);

    this.hThumb.addEventListener('pointerdown', this.boundOnHThumbPointerDown);
    this.hTrack.addEventListener('pointerdown', this.boundOnHTrackPointerDown);
  }

  private registerListeners() {
    this.target.addEventListener('scroll', this.boundOnScroll, { passive: true });
    this.target.addEventListener('pointerenter', this.boundOnPointerEnter);
    this.target.addEventListener('pointerleave', this.boundOnPointerLeave);

    if (this.vTrack) {
      this.vTrack.addEventListener('pointerenter', this.boundOnPointerEnter);
      this.vTrack.addEventListener('pointerleave', this.boundOnPointerLeave);
    }
    if (this.hTrack) {
      this.hTrack.addEventListener('pointerenter', this.boundOnPointerEnter);
      this.hTrack.addEventListener('pointerleave', this.boundOnPointerLeave);
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.isDestroyed) {
        this.update();
      }
    });
    this.resizeObserver.observe(this.target);
    if (this.host !== this.target) {
      this.resizeObserver.observe(this.host);
    }
  }

  private handleScroll(event: Event) {
    if (this.isDestroyed) return;
    this.showScrollbars();
    this.updateThumbPositions();
    this.scheduleAutoHide();
    this.onScrollCallback?.(event);
  }

  private handlePointerEnter() {
    if (this.isDestroyed) return;
    this.showScrollbars();
  }

  private handlePointerLeave() {
    if (this.isDestroyed) return;
    if (!this.isDraggingV && !this.isDraggingH) {
      this.scheduleAutoHide();
    }
  }

  public showScrollbars() {
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
    this.vTrack?.classList.add('ac-os-visible');
    this.hTrack?.classList.add('ac-os-visible');
  }

  public scheduleAutoHide() {
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId);
    }
    this.hideTimeoutId = setTimeout(() => {
      if (!this.isDraggingV && !this.isDraggingH && !this.isDestroyed) {
        this.vTrack?.classList.remove('ac-os-visible');
        this.hTrack?.classList.remove('ac-os-visible');
      }
      this.hideTimeoutId = null;
    }, this.autoHideDelay);
  }

  // Vertical Pointer Drag
  private handleVThumbPointerDown(e: PointerEvent) {
    if (e.button !== 0 || !this.vThumb) return;
    e.stopPropagation();
    e.preventDefault();

    this.isDraggingV = true;
    this.dragStartY = e.clientY;
    this.dragStartScrollTop = this.target.scrollTop;
    this.vThumb.setPointerCapture(e.pointerId);
    this.vThumb.classList.add('dragging');
    this.showScrollbars();

    this.vThumb.addEventListener('pointermove', this.boundOnVThumbPointerMove);
    this.vThumb.addEventListener('pointerup', this.boundOnVThumbPointerUp);
    this.vThumb.addEventListener('pointercancel', this.boundOnVThumbPointerUp);
  }

  private handleVThumbPointerMove(e: PointerEvent) {
    if (!this.isDraggingV || !this.vTrack || !this.vThumb) return;
    const deltaY = e.clientY - this.dragStartY;
    const trackHeight = this.vTrack.clientHeight;
    const thumbHeight = this.vThumb.offsetHeight;
    const availableTrack = trackHeight - thumbHeight;
    const maxScrollTop = this.target.scrollHeight - this.target.clientHeight;

    if (availableTrack > 0 && maxScrollTop > 0) {
      const scrollRatio = deltaY / availableTrack;
      this.target.scrollTop = this.dragStartScrollTop + scrollRatio * maxScrollTop;
    }
  }

  private handleVThumbPointerUp(e: PointerEvent) {
    if (!this.isDraggingV || !this.vThumb) return;
    this.isDraggingV = false;
    try {
      this.vThumb.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    this.vThumb.classList.remove('dragging');
    this.vThumb.removeEventListener('pointermove', this.boundOnVThumbPointerMove);
    this.vThumb.removeEventListener('pointerup', this.boundOnVThumbPointerUp);
    this.vThumb.removeEventListener('pointercancel', this.boundOnVThumbPointerUp);
    this.scheduleAutoHide();
  }

  private handleVTrackPointerDown(e: PointerEvent) {
    if (e.button !== 0 || e.target === this.vThumb || !this.vTrack || !this.vThumb) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = this.vTrack.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = rect.height;
    const thumbHeight = this.vThumb.offsetHeight;
    const availableTrack = trackHeight - thumbHeight;
    const maxScrollTop = this.target.scrollHeight - this.target.clientHeight;

    if (availableTrack > 0 && maxScrollTop > 0) {
      const targetTop = clickY - thumbHeight / 2;
      const ratio = Math.max(0, Math.min(1, targetTop / availableTrack));
      this.target.scrollTop = ratio * maxScrollTop;
    }
    this.showScrollbars();
    this.scheduleAutoHide();
  }

  // Horizontal Pointer Drag
  private handleHThumbPointerDown(e: PointerEvent) {
    if (e.button !== 0 || !this.hThumb) return;
    e.stopPropagation();
    e.preventDefault();

    this.isDraggingH = true;
    this.dragStartX = e.clientX;
    this.dragStartScrollLeft = this.target.scrollLeft;
    this.hThumb.setPointerCapture(e.pointerId);
    this.hThumb.classList.add('dragging');
    this.showScrollbars();

    this.hThumb.addEventListener('pointermove', this.boundOnHThumbPointerMove);
    this.hThumb.addEventListener('pointerup', this.boundOnHThumbPointerUp);
    this.hThumb.addEventListener('pointercancel', this.boundOnHThumbPointerUp);
  }

  private handleHThumbPointerMove(e: PointerEvent) {
    if (!this.isDraggingH || !this.hTrack || !this.hThumb) return;
    const deltaX = e.clientX - this.dragStartX;
    const trackWidth = this.hTrack.clientWidth;
    const thumbWidth = this.hThumb.offsetWidth;
    const availableTrack = trackWidth - thumbWidth;
    const maxScrollLeft = this.target.scrollWidth - this.target.clientWidth;

    if (availableTrack > 0 && maxScrollLeft > 0) {
      const scrollRatio = deltaX / availableTrack;
      this.target.scrollLeft = this.dragStartScrollLeft + scrollRatio * maxScrollLeft;
    }
  }

  private handleHThumbPointerUp(e: PointerEvent) {
    if (!this.isDraggingH || !this.hThumb) return;
    this.isDraggingH = false;
    try {
      this.hThumb.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    this.hThumb.classList.remove('dragging');
    this.hThumb.removeEventListener('pointermove', this.boundOnHThumbPointerMove);
    this.hThumb.removeEventListener('pointerup', this.boundOnHThumbPointerUp);
    this.hThumb.removeEventListener('pointercancel', this.boundOnHThumbPointerUp);
    this.scheduleAutoHide();
  }

  private handleHTrackPointerDown(e: PointerEvent) {
    if (e.button !== 0 || e.target === this.hThumb || !this.hTrack || !this.hThumb) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = this.hTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;
    const thumbWidth = this.hThumb.offsetWidth;
    const availableTrack = trackWidth - thumbWidth;
    const maxScrollLeft = this.target.scrollWidth - this.target.clientWidth;

    if (availableTrack > 0 && maxScrollLeft > 0) {
      const targetLeft = clickX - thumbWidth / 2;
      const ratio = Math.max(0, Math.min(1, targetLeft / availableTrack));
      this.target.scrollLeft = ratio * maxScrollLeft;
    }
    this.showScrollbars();
    this.scheduleAutoHide();
  }

  /**
   * Recalculates track dimensions, visibility, and thumb positions.
   * Call whenever content or container size changes.
   */
  public update() {
    if (this.isDestroyed) return;

    const clientH = this.target.clientHeight;
    const scrollH = this.target.scrollHeight;
    const clientW = this.target.clientWidth;
    const scrollW = this.target.scrollWidth;

    const canScrollV = this.verticalEnabled && (scrollH - clientH > 1);
    const canScrollH = this.horizontalEnabled && (scrollW - clientW > 1);

    // Sync track positions relative to host if host is parent
    if (this.host !== this.target) {
      const targetTop = this.target.offsetTop;
      const targetLeft = this.target.offsetLeft;
      const targetWidth = this.target.offsetWidth;
      const targetHeight = this.target.offsetHeight;
      const hostWidth = this.host.clientWidth;
      const hostHeight = this.host.clientHeight;

      if (this.vTrack) {
        this.vTrack.style.top = `${targetTop}px`;
        this.vTrack.style.height = `${targetHeight}px`;
        this.vTrack.style.right = `${Math.max(0, hostWidth - targetLeft - targetWidth)}px`;
      }
      if (this.hTrack) {
        this.hTrack.style.left = `${targetLeft}px`;
        this.hTrack.style.width = `${targetWidth}px`;
        this.hTrack.style.bottom = `${Math.max(0, hostHeight - targetTop - targetHeight)}px`;
      }
    }

    // Toggle tracks visibility & corner offsets
    if (this.vTrack) {
      this.vTrack.style.display = canScrollV ? 'block' : 'none';
      this.vTrack.classList.toggle('has-both', canScrollV && canScrollH);
    }
    if (this.hTrack) {
      this.hTrack.style.display = canScrollH ? 'block' : 'none';
      this.hTrack.classList.toggle('has-both', canScrollV && canScrollH);
    }

    this.updateThumbPositions();
  }

  private updateThumbPositions() {
    if (this.isDestroyed) return;

    // Vertical thumb
    if (this.vTrack && this.vThumb && this.vTrack.style.display !== 'none') {
      const clientH = this.target.clientHeight;
      const scrollH = this.target.scrollHeight;
      const trackH = this.vTrack.clientHeight;
      const maxScrollTop = scrollH - clientH;

      if (scrollH > 0 && trackH > 0) {
        const thumbH = Math.max(this.minThumbSize, (clientH / scrollH) * trackH);
        const availableTrack = trackH - thumbH;
        const thumbTop = maxScrollTop > 0 ? (this.target.scrollTop / maxScrollTop) * availableTrack : 0;

        this.vThumb.style.height = `${thumbH}px`;
        this.vThumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
      }
    }

    // Horizontal thumb
    if (this.hTrack && this.hThumb && this.hTrack.style.display !== 'none') {
      const clientW = this.target.clientWidth;
      const scrollW = this.target.scrollWidth;
      const trackW = this.hTrack.clientWidth;
      const maxScrollLeft = scrollW - clientW;

      if (scrollW > 0 && trackW > 0) {
        const thumbW = Math.max(this.minThumbSize, (clientW / scrollW) * trackW);
        const availableTrack = trackW - thumbW;
        const thumbLeft = maxScrollLeft > 0 ? (this.target.scrollLeft / maxScrollLeft) * availableTrack : 0;

        this.hThumb.style.width = `${thumbW}px`;
        this.hThumb.style.transform = `translate3d(${thumbLeft}px, 0, 0)`;
      }
    }
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    this.target.removeEventListener('scroll', this.boundOnScroll);
    this.target.removeEventListener('pointerenter', this.boundOnPointerEnter);
    this.target.removeEventListener('pointerleave', this.boundOnPointerLeave);

    if (this.vTrack) {
      this.vThumb?.removeEventListener('pointerdown', this.boundOnVThumbPointerDown);
      this.vTrack.removeEventListener('pointerdown', this.boundOnVTrackPointerDown);
      this.vTrack.remove();
      this.vTrack = undefined;
      this.vThumb = undefined;
    }

    if (this.hTrack) {
      this.hThumb?.removeEventListener('pointerdown', this.boundOnHThumbPointerDown);
      this.hTrack.removeEventListener('pointerdown', this.boundOnHTrackPointerDown);
      this.hTrack.remove();
      this.hTrack = undefined;
      this.hThumb = undefined;
    }

    this.target.classList.remove('ac-overlay-scroll-container');
  }
}
