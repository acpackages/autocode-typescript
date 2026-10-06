import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_SLIDES_TAG } from "../_ac-slides.export";

// ac-slides.ts
interface AcSlidesOptions {
  interval?: number; // Auto slide interval in ms
  loop?: boolean;    // Whether to loop back after the last slide
}

export class AcSlides {
  private container: HTMLElement;
  private slides: HTMLElement[];
  private currentIndex = 0;
  private intervalId?: number;
  private interval: number;
  private loop: boolean;

  constructor(container: HTMLElement, options: AcSlidesOptions = {}) {
    this.container = container;
    this.slides = Array.from(container.querySelectorAll<HTMLElement>('.ac-slide'));
    this.interval = options.interval ?? 3000;
    this.loop = options.loop ?? true;

    this.showSlide(this.currentIndex);
  }

  private showSlide(index: number) {
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    this.currentIndex = index;
  }

  public next() {
    let nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.slides.length) {
      if (this.loop) nextIndex = 0;
      else return;
    }
    this.showSlide(nextIndex);
  }

  public prev() {
    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      if (this.loop) prevIndex = this.slides.length - 1;
      else return;
    }
    this.showSlide(prevIndex);
  }

  public start() {
    if (this.intervalId) return; // Already running
    this.intervalId = window.setInterval(() => this.next(), this.interval);
  }

  public stop() {
    if (!this.intervalId) return;
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
}

acRegisterCustomElement({tag:AC_SLIDES_TAG.slides,type:AcSlides});
