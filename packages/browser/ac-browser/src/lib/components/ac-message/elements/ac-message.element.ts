/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */

import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { AcDelayedCallback } from "@autocode-ts/autocode";
import { acMessageElementHtml } from "../_ac-message.export";

// ac-message.ts
type ToastPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

type MessageType = 'success' | 'error' | 'info' | 'warning' | 'none';

interface BaseOptions {
  title?: string;
  message?: string;
  html?: string;
  iconHtml?: string;
  timer?: number; // ms, 0 = no auto close
  toast?: boolean; // true => toast style; false => modal
  position?: ToastPosition;
  showCloseButton?: boolean;
  pauseOnHover?: boolean;
  progressBar?: boolean;
  type?:MessageType;
  // styling/custom class
  className?: string;
  // for confirm:
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  confirmText?: string;
  denyText?: string;
  showInput?: boolean; // simple text input in confirm
  inputPlaceholder?: string;
  inputValue?: string;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  // callback hooks
  onConfirm?: (result: ConfirmResult) => void;
  onCancel?: (result: ConfirmResult) => void;
  onOpen?: (el: HTMLElement) => void;
  onClose?: (el: HTMLElement) => void;
  // arbitrary extra data
  data?: Record<string, any>;
}

interface ConfirmResult {
  confirmed: boolean;
  value?: string | null;
  dismissed?: boolean;
}

export class AcMessage {
  // --- Global config ---
  static defaultConfig: Partial<BaseOptions> = {
    timer: 3000,
    toast: true,
    position: 'top-right',
    showCloseButton: true,
    pauseOnHover: true,
    progressBar: true,
    showConfirmButton: true,
    showCancelButton: true,
    confirmText: 'OK',
    denyText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true,
  };

  // Toast containers by position
  private static containers: Map<ToastPosition, HTMLElement> = new Map();

  // Modal overlay + queueing
  private static modalQueue: Array<() => void> = [];
  private static modalOpen = false;
  private static zBase = 10000;

  // track active toasts by id for closeAll
  private static activeToasts = new Map<number, HTMLElement>();
  private static toastIdCounter = 1;
  private static delayedCallback:AcDelayedCallback = new AcDelayedCallback();

  // CSS injected once
  private static cssInjected = false;

  // Public API: configure global defaults
  public static configure(cfg: Partial<BaseOptions>) {
    this.defaultConfig = { ...this.defaultConfig, ...cfg };
  }

  // Convenience methods
  public static success(options?: Partial<BaseOptions>) {
    return this.fire({ type: 'success', ...options });
  }
  public static error(options?: Partial<BaseOptions>) {
    return this.fire({ type: 'error', ...options });
  }
  public static info( options?: Partial<BaseOptions>) {
    return this.fire({ type: 'info', ...options });
  }
  public static warning(options?: Partial<BaseOptions>) {
    return this.fire({ type: 'warning', ...options });
  }

  // Generic fire method - either toast or modal depending on options
  public static fire(options: Partial<BaseOptions> = {}): Promise<any> {
    const opts: BaseOptions = { ...this.defaultConfig, ...options } as BaseOptions;
    if (opts.toast) {
      this.toast(opts);
      return Promise.resolve(null);
    } else {
      // show modal confirm-like dialog (if showConfirmButton true) or alert
      return this.confirm(opts);
    }
  }

  // Show toast (stackable)
  public static toast(options: Partial<BaseOptions> = {}) {
    const opts: BaseOptions = { ...this.defaultConfig, ...options, toast: true } as BaseOptions;
    this.injectCSS();

    const pos = opts.position as ToastPosition;
    const container = this.getOrCreateContainer(pos);

    const id = this.toastIdCounter++;
    const toast = document.createElement('div');
    toast.className = `acmsg-toast ${opts.className ?? ''}`.trim();
    toast.setAttribute('role', 'status');
    toast.setAttribute('data-acmsg-id', String(id));

    toast.innerHTML = this.buildToastInnerHTML(opts);

    container.appendChild(toast);
    this.activeToasts.set(id, toast);

    // open callback
    opts.onOpen?.(toast);

    // timer and progress
    let timerId: string | null = null;
    let start = Date.now();
    let remaining = opts.timer ?? 0;
    let paused = false;

    const progressBar = toast.querySelector('.acmsg-progress') as HTMLElement | null;
    const startTimer = () => {
      if (!remaining || remaining <= 0) return;
      start = Date.now();
      timerId = this.delayedCallback.add({callback:() => close('timer'), duration:remaining});
      if (progressBar && opts.progressBar) this.animateProgress(progressBar, remaining);
    };

    const pauseTimer = () => {
      if (!timerId) return;
      paused = true;
      this.delayedCallback.remove({key:timerId});
      timerId = null;
      remaining = remaining - (Date.now() - start);
      if (progressBar) progressBar.style.transition = '';
    };

    const resumeTimer = () => {
      if (!remaining || remaining <= 0) return;
      if (!paused) return;
      paused = false;
      startTimer();
    };

    // start timer
    if (opts.timer && opts.timer > 0) startTimer();

    // hover pause/resume
    if (opts.pauseOnHover) {
      toast.addEventListener('mouseenter', () => pauseTimer());
      toast.addEventListener('mouseleave', () => resumeTimer());
    }

    // close handlers
    const close = (reason: 'user' | 'timer' | 'programmatic' = 'programmatic') => {
      if (!toast.parentElement) return;
      opts.onClose?.(toast);
      toast.classList.add('acmsg-hide');
      // wait animation then remove
      this.delayedCallback.add({callback:() => {
        container.removeChild(toast);
        this.activeToasts.delete(id);
        if (!container.children.length) {
          container.remove();
          this.containers.delete(pos);
        }
      }, duration:260});
      if (timerId) { this.delayedCallback.remove({key:timerId}); timerId = null; }
    };

    // close button
    const closeBtn = toast.querySelector('.acmsg-close') as HTMLElement | null;
    if (closeBtn && opts.showCloseButton) {
      closeBtn.addEventListener('click', () => close('user'));
    } else {
      // if close button hidden, clicking toast still closes by default - keep accessibility:
      toast.addEventListener('click', (e) => {
        // don't close when clicking inside actionable elements (like links)
        if ((e.target as HTMLElement).closest('button, a, input')) return;
        if (!opts.showCloseButton) close('user');
      });
    }

    return {
      id,
      close: () => close('programmatic'),
      element: toast,
    };
  }

  // Confirmation modal (queueing to keep single modal on screen)
  public static confirm(options: Partial<BaseOptions> = {}): Promise<ConfirmResult | boolean | string | null> {
    const opts: BaseOptions = { ...this.defaultConfig, ...options, toast: true } as BaseOptions;
    this.injectCSS();

    return new Promise((resolve) => {
      // enqueue modal if one is open
      const openFn = () => {
        this.modalOpen = true;
        const modalRoot = this.createModal(opts, resolve);
        document.body.appendChild(modalRoot.overlay);
        // focus first actionable element
        const focusable = modalRoot.dialog.querySelector<HTMLElement>('button, input, [tabindex]');
        focusable?.focus();
      };

      if (this.modalOpen) {
        this.modalQueue.push(openFn);
      } else {
        openFn();
      }
    });
  }

  // Programmatic helpers
  public static closeAllToasts() {
    for (const [id, el] of this.activeToasts) {
      el.remove();
    }
    this.activeToasts.clear();
    // remove containers
    for (const c of this.containers.values()) {
      c.remove();
    }
    this.containers.clear();
  }

  public static flushModalQueue() {
    this.modalQueue = [];
  }

  // ----- Internal helpers -----
  private static getOrCreateContainer(position: ToastPosition) {
    if (this.containers.has(position)) return this.containers.get(position)!;

    const container = document.createElement('div');
    container.className = `acmsg-container ${this.posToClass(position)}`;
    container.setAttribute('role', 'region');
    document.body.appendChild(container);
    this.containers.set(position, container);
    return container;
  }

  private static posToClass(p: ToastPosition) {
    return `acmsg-pos-${p.replace('-', '_')}`;
  }

  private static getIconHtml(opts:BaseOptions){
    let result:string = "";
    if(opts.type && opts.type != "none"){
      let msgIcon:string = opts.iconHtml ?? "";
      if(msgIcon == ""){
        if(opts.type == "success"){
          msgIcon = acMessageElementHtml.successIcon;
        }
        else if(opts.type == "error"){
          msgIcon = acMessageElementHtml.errorIcon;
        }
        else if(opts.type == "warning"){
          msgIcon = acMessageElementHtml.warningIcon;
        }
        else if(opts.type == "info"){
          msgIcon = acMessageElementHtml.infoIcon;
        }
      }
      result = `<span class="acmsg-modal-icon acmsg-icon-${opts.type}">${msgIcon}</span>`
    }
    return result;
  }

  private static buildToastInnerHTML(opts: BaseOptions) {
    const titleHtml = opts.title ? `<div class="acmsg-title">${opts.title}</div>` : '';
    const textHtml = opts.message ? `<div class="acmsg-text">${opts.message}</div>` : '';
    const htmlContent = opts.html ?? '';

    const closeBtn = opts.showCloseButton ? `<button class="acmsg-close" aria-label="close">&times;</button>` : '';
    const progress = opts.progressBar ? `<div class="acmsg-progress-wrap"><div class="acmsg-progress"></div></div>` : '';

    return `
      <div class="acmsg-body">
        ${this.getIconHtml(opts)}
        <div class="acmsg-content">
          ${titleHtml}
          ${textHtml}
          ${htmlContent}
        </div>
        ${closeBtn}
      </div>
      ${progress}
    `;
  }

  private static animateProgress(el: HTMLElement, ms: number) {
    // reset then animate using transition
    el.style.transition = 'none';
    el.style.width = '100%';
    // force layout
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetWidth;
    el.style.transition = `width ${ms}ms linear`;
    el.style.width = '0%';
  }

  private static createModal(opts: BaseOptions, resolve: (v: any) => void) {
    // overlay
    const overlay = document.createElement('div');
    overlay.className = 'acmsg-overlay';
    overlay.style.zIndex = String(this.zBase + 1);

    // dialog
    const dialog = document.createElement('div');
    dialog.className = `acmsg-modal ${opts.className ?? ''}`.trim();
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    // build content

    const title = opts.title ? `<h3 class="acmsg-modal-title">${opts.title}</h3>` : '';
    const text = opts.message ? `<div class="acmsg-modal-text">${opts.message}</div>` : '';
    const html = opts.html ?? '';

    // input (simple)
    const inputHtml = opts.showInput ? `<input class="acmsg-input" placeholder="${opts.inputPlaceholder ?? ''}" value="${opts.inputValue ?? ''}" />` : '';

    // buttons
    const confirmBtn = opts.showConfirmButton ? `<button class="acmsg-btn acmsg-confirm">${opts.confirmText ?? 'OK'}</button>` : '';
    const denyBtn = opts.showCancelButton ? `<button class="acmsg-btn acmsg-deny">${opts.denyText ?? 'Cancel'}</button>` : '';
    const closeX = opts.showCloseButton ? `<button class="acmsg-top-close" aria-label="close">&times;</button>` : '';

    dialog.innerHTML = `
      ${closeX}
      <div class="acmsg-modal-inner">
        ${this.getIconHtml(opts)}
        ${title}
        ${text}
        ${html}
        ${inputHtml}
        <div class="acmsg-modal-actions">
          ${denyBtn}
          ${confirmBtn}
        </div>
      </div>
    `;

    // attach
    overlay.appendChild(dialog);

    // focus trap minimal: keep focus inside modal
    const focusHandler = (e: KeyboardEvent) => {
      if (opts.allowEscapeKey !== false && e.key === 'Escape') {
        close(false, 'escape');
      } else if (e.key === 'Enter') {
        // Enter triggers confirm if confirm exists
        const hasConfirm = opts.showConfirmButton !== false;
        if (hasConfirm) {
          confirm();
        }
      }
    };

    document.addEventListener('keydown', focusHandler);

    // allow outside click?
    overlay.addEventListener('click', (ev) => {
      if (!opts.allowOutsideClick) return;
      if (ev.target === overlay) {
        close(false, 'overlay');
      }
    });

    // close X
    const closeXEl = dialog.querySelector('.acmsg-top-close') as HTMLElement | null;
    closeXEl?.addEventListener('click', () => close(false, 'closeX'));

    const inputEl = dialog.querySelector<HTMLInputElement>('.acmsg-input') ?? null;

    const confirm = () => {
      const value = inputEl ? inputEl.value : undefined;
      opts.onClose?.(dialog);
      cleanup();
      const result:any = { confirmed: true, value };
      if(opts.onConfirm){
        opts.onConfirm(result);
      }
      resolve(result);
    };
    const deny = () => {
      opts.onClose?.(dialog);
      cleanup();
      const result:any = { confirmed: false, dismissed: true };
      if(opts.onCancel){
        opts.onCancel(result);
      }
      resolve(result);
    };

    const confirmBtnEl = dialog.querySelector('.acmsg-confirm') as HTMLElement | null;
    confirmBtnEl?.addEventListener('click', confirm);
    const denyBtnEl = dialog.querySelector('.acmsg-deny') as HTMLElement | null;
    denyBtnEl?.addEventListener('click', deny);

    // when modal closed, release and run next in queue
    const cleanup = () => {
      document.removeEventListener('keydown', focusHandler);
      overlay.remove();
      this.modalOpen = false;
      // next modal in queue
      const next = this.modalQueue.shift();
      if (next) next();
    };

    // programmatic close called by confirm/deny/escape/outside
    const close = (isConfirmed: boolean, reason?: string) => {
      opts.onClose?.(dialog);
      cleanup();
      if (isConfirmed) {
        resolve({ confirmed: true });
      } else {
        resolve({ confirmed: false, dismissed: true });
      }
    };

    // call onOpen
    opts.onOpen?.(dialog);

    return { overlay, dialog };
  }

  // CSS injection
  private static injectCSS() {
    if (this.cssInjected) return;
    this.cssInjected = true;

    const css = `
/* ac-message core */
.acmsg-container {
  position: fixed;
  z-index: ${this.zBase};
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: auto;
  max-width: calc(100% - 24px);
}
.acmsg-container.acmsg-pos-top_left,
.acmsg-pos-top_left { top: 12px; left: 12px; align-items: flex-start; }
.acmsg-pos-top_center { top: 12px; left: 50%; transform: translateX(-50%); align-items: center; }
.acmsg-pos-top_right { top: 12px; right: 12px; align-items: flex-end; }
.acmsg-pos-bottom_left { bottom: 12px; left: 12px; align-items: flex-start; }
.acmsg-pos-bottom_center { bottom: 12px; left: 50%; transform: translateX(-50%); align-items: center; }
.acmsg-pos-bottom_right { bottom: 12px; right: 12px; align-items: flex-end; }

.acmsg-toast {
  pointer-events: auto;
  min-width: 240px;
  max-width: 420px;
  background: white;
  color: #333;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.14);
  display: flex;
  flex-direction: column;
  opacity: 1;
  transform-origin: top right;
  transition: transform .18s ease, opacity .18s ease;
  overflow: hidden;
}
.acmsg-toast.acmsg-hide { opacity: 0; transform: translateY(-8px) scale(.99); }

.acmsg-body { display:flex; gap:10px; align-items:center; }
.acmsg-icon { width:36px; height:36px; flex: 0 0 36px; border-radius: 6px; display:block; }
.acmsg-svg-icon{ height:100%;width:100%;padding:10px;color:white;}
.acmsg-icon-success { background: linear-gradient(90deg,#60BF88,#3CB371); }
.acmsg-icon-error { background: linear-gradient(90deg,#F08080,#FF6347); }
.acmsg-icon-info { background: linear-gradient(90deg,#6FA8F9,#5B9DFE); }
.acmsg-icon-warning { background: linear-gradient(90deg,#FFD05B,#FFA726); }

.acmsg-content { flex:1; min-width:0; }
.acmsg-title { font-weight:600; margin-bottom:2px; }
.acmsg-text { font-size: 13px; opacity: .9; }

.acmsg-close { background: none; border: none; font-size: 18px; cursor:pointer;     position: relative;
    right: -5px;
    top: -15px; color: #666; }
.acmsg-close:hover { color: #000; }

.acmsg-progress-wrap { height:4px; background: rgba(0,0,0,0.06); width:100%; margin-top:8px; }
.acmsg-progress { height:100%; width:100%; background:linear-gradient(90deg, rgba(0,0,0,0.12), rgba(0,0,0,0.06)); transition: width linear; }

.acmsg-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,10,10,0.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index: ${this.zBase + 1000};
}
.acmsg-modal {
  background: white;
  border-radius: 10px;
  padding: 20px;
  min-width: 320px;
  max-width: 92%;
  box-shadow: 0 12px 32px rgba(0,0,0,0.32);
  position: relative;
}
.acmsg-modal-inner { display:flex; flex-direction:column; gap:12px; align-items:center; text-align:center; }
.acmsg-modal-icon { width:56px; height:56px; border-radius:10px; display:block; }
.acmsg-modal-title { margin:0; font-size:18px; }
.acmsg-modal-text { font-size:14px; color:#444; }
.acmsg-modal-actions { display:flex; gap:10px; margin-top:8px; }
.acmsg-btn { padding:8px 14px; border-radius:8px; border:none; cursor:pointer; }
.acmsg-confirm { background:#2f80ed; color:#fff; }
.acmsg-deny { background:#f0f0f0; color:#333; }
.acmsg-top-close { position:absolute; right:10px; top:6px; background:none; border:none; font-size:20px; cursor:pointer; }
.acmsg-input { width:100%; padding:8px 10px; border-radius:6px; border:1px solid #ddd; }

@media (max-width:420px) {
  .acmsg-toast { width: calc(100% - 24px); margin: 0 12px; }
}
    `.trim();

    const style = document.createElement('style');
    style.id = 'acmsg-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
  }
}

