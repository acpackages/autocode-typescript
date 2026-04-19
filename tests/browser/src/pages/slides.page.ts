import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcSlides } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'slides-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcSlides Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto text-center">
        <p class="mb-4 text-muted">A simple carousel component with programmatic controls and auto-sliding support.</p>

        <div class="slides-container mx-auto shadow-lg" #container>
          <div class="ac-slide bg-primary">
             <div class="slide-content">
                <i class="fa-solid fa-1 display-1 mb-3"></i>
                <h2>Fresh Design</h2>
                <p>Modern aesthetics at your fingertips.</p>
             </div>
          </div>
          <div class="ac-slide bg-success">
             <div class="slide-content">
                <i class="fa-solid fa-2 display-1 mb-3"></i>
                <h2>Fast Core</h2>
                <p>Native performance in the browser.</p>
             </div>
          </div>
          <div class="ac-slide bg-danger">
             <div class="slide-content">
                <i class="fa-solid fa-3 display-1 mb-3"></i>
                <h2>Flexible Logic</h2>
                <p>Decorators and templates working in harmony.</p>
             </div>
          </div>
          <div class="ac-slide bg-warning text-dark">
             <div class="slide-content">
                <i class="fa-solid fa-4 display-1 mb-3"></i>
                <h2>Ready to use</h2>
                <p>Pre-built components for every need.</p>
             </div>
          </div>
        </div>

        <div class="controls mt-5 d-flex justify-content-center gap-2">
           <button class="btn btn-outline-primary px-4" (click)="slides.prev()"><i class="fa-solid fa-chevron-left me-2"></i> Previous</button>
           <button class="btn btn-outline-primary px-4" (click)="slides.next()">Next <i class="fa-solid fa-chevron-right ms-2"></i></button>
           <div class="vr mx-2"></div>
           <button class="btn btn-success px-4" (click)="slides.start()">Start Auto-play</button>
           <button class="btn btn-danger px-4" (click)="slides.stop()">Stop</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .slides-container {
      position: relative;
      width: 100%;
      max-width: 800px;
      height: 400px;
      border-radius: 16px;
      overflow: hidden;
      background: #f8f9fa;
    }
    .ac-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      text-align: center;
    }
    .slide-content h2 { font-weight: 800; }
    .slide-content p { opacity: 0.8; }
  `
})
export class SlidesPage {
  @AcViewChild('#container') container!: HTMLElement;
  slides!: AcSlides;

  dropdownItems: IAppMenuItem[] = [{ label: 'Slides Actions', isHeader: true }];

  acOnInit() {
    this.slides = new AcSlides(this.container, { interval: 3000, loop: true });
  }
}
