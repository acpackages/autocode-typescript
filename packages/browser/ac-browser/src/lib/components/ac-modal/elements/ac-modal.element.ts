/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcEnumModalEvent } from "../enums/ac-enum-modal-event.enum";
import { acMorphElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_MODAL_TAG } from "../consts/ac-modal-tag.const";
import { AcElementBase } from "../../../core/ac-element-base";
import { AC_MODAL_CONFIG } from "../consts/ac-modal-config.const";

export class AcModal extends AcElementBase {
  get closeOnOutsideClick() {
    return !(this.getAttribute("close-on-outside-click") == "false")
  }
  set closeOnOutsideClick(value: boolean) {
    this.setAttribute('close-on-outside-click', `${value}`);
  }

  get closeOnEscape() {
    return !(this.getAttribute("close-on-escape") == "false")
  }
  set closeOnEscape(value: boolean) {
    this.setAttribute('close-on-escape', `${value}`);
  }

  private backdrop: HTMLElement | null = null;
  private isOpen: boolean = false;
  animationDuration: number = AC_MODAL_CONFIG.animationDuration; // ms
  private lastTrigger?: HTMLElement;
  private morphTriggerColor?: string;
  private morphModalColor?: string;
  private cloneEl?: HTMLElement;
  private originalBodyStyleOverflow: any;

  override init() {
    super.init();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    if (!this.lastTrigger) {
      this.fadeOutModal();
      this.events.execute({ event: AcEnumModalEvent.Close });
      return;
    }
    this.cloneEl = this.cloneNode(true) as HTMLElement;

    acMorphElement({ source: this, destination: this.lastTrigger, destinationColor: this.morphTriggerColor, sourceColor: this.morphModalColor });

    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }

    this.classList.remove('open');
    this.events.execute({ event: AcEnumModalEvent.Close });
  }

  private fadeOutModal() {
    this.classList.remove('open');

    this.delayedCallback.add({callback:() => {
      if (this.backdrop && this.backdrop.parentElement) {
        this.backdrop.parentElement.removeChild(this.backdrop);
        this.backdrop = null;
      }
      this.ownerDocument.body.style.overflow = this.originalBodyStyleOverflow;
      this.ownerDocument.removeEventListener("keydown", this.handleEscape);
    }, duration:this.animationDuration});
  }

  private handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.closeOnEscape) {
      this.close();
    }
  };

  open({ triggerElement, morphTriggerColor, morphModalColor }: { triggerElement?: HTMLElement, morphTriggerColor?: string, morphModalColor?: string } = {}) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.lastTrigger = triggerElement;

    this.style.setProperty('--ac-modal-duration', `${this.animationDuration}ms`);

    // Create backdrop
    this.backdrop = this.ownerDocument.createElement("div");
    this.backdrop.classList.add('ac-modal-backdrop');
    this.appendChild(this.backdrop);
    this.originalBodyStyleOverflow = this.ownerDocument.body.style.overflow;
    this.ownerDocument.body.style.overflow = "hidden";

    if (!triggerElement) {
      requestAnimationFrame(() => {
        this.classList.add('open');
      });
      this.backdrop.addEventListener("click", () => {
        if (this.closeOnOutsideClick) {
          this.close();
        }
      }, { once: true });
      this.ownerDocument.addEventListener("keydown", this.handleEscape);
      this.events.execute({ event: AcEnumModalEvent.Open });
      return;
    }

    acMorphElement({ source: triggerElement, destination: this, duration: this.animationDuration, sourceColor: morphTriggerColor, destinationColor: morphModalColor });

    this.delayedCallback.add({callback:() => {
      this.classList.add('open');
      this.events.execute({ event: AcEnumModalEvent.Open });
    }, duration:this.animationDuration});

    this.backdrop.addEventListener("click", () => {
      if (this.closeOnOutsideClick) {
        this.close();
      }
    }, { once: true });
    this.ownerDocument.addEventListener("keydown", this.handleEscape);
  }

}

acRegisterCustomElement({ tag: AC_MODAL_TAG.modal, type: AcModal });
