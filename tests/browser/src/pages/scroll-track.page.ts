import { AcElement } from "@autocode-ts/ac-runtime";
import { AcScrollTrack } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'scroll-track-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcScrollTrack : Interaction Observer'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <div class="alert alert-primary shadow-sm mb-4">
           <strong>Active Viewport:</strong> <span class="badge bg-white text-primary ms-2 px-3 py-2 fs-6 border border-primary">{{activeSection || 'None'}}</span>
        </div>

        <div class="scroll-container border rounded bg-white shadow-sm" #scrollContainer>
          <div id="intro" class="scroll-section p-5 border-bottom bg-light bg-gradient">
            <h2 class="display-5 fw-bold text-primary mb-4">1. Introduction</h2>
            <p class="lead">Scroll tracking is essential in modern web apps to highlight navigation items, lazy load content, or trigger animations when sections come into view.</p>
            <div class="mt-4 p-3 bg-white border-start border-4 border-primary rounded shadow-sm">
               <em>"Efficiency is key—don't listen to scroll events, observe intersections."</em>
            </div>
          </div>

          <div id="tech" class="scroll-section p-5 border-bottom">
            <h2 class="display-6 fw-bold mb-4">2. The Technology</h2>
            <p>The <code>IntersectionObserver</code> API efficiently detects when elements enter or leave the viewport, without heavy scroll event listeners.</p>
            <div class="row g-4 mt-2">
               <div class="col-md-6" *for="let feature of ['Low CPU usage', 'Smooth performance', 'Async execution', 'Configurable thresholds']">
                  <div class="d-flex align-items-center">
                     <i class="fa-solid fa-circle-check text-success me-2"></i>
                     <span>{{feature}}</span>
                  </div>
               </div>
            </div>
          </div>

          <div id="examples" class="scroll-section p-5 border-bottom bg-dark text-white">
            <h2 class="display-6 fw-bold mb-4 text-warning">3. Real-world Examples</h2>
             <ul class="list-unstyled">
                <li class="mb-3 d-flex gap-3">
                   <div class="fs-4 text-warning"><i class="fa-solid fa-list-ul"></i></div>
                   <div><strong>Sticky TOC:</strong> Updating a table of contents highlighting as you read.</div>
                </li>
                <li class="mb-3 d-flex gap-3">
                   <div class="fs-4 text-warning"><i class="fa-solid fa-truck-ramp-box"></i></div>
                   <div><strong>Infinite Loading:</strong> Triggering data fetches when the "footer" comes into view.</div>
                </li>
                 <li class="mb-3 d-flex gap-3">
                   <div class="fs-4 text-warning"><i class="fa-solid fa-wand-sparkles"></i></div>
                   <div><strong>Scroll Reveals:</strong> Animating cards when they slide into the screen.</div>
                </li>
             </ul>
          </div>

          <div id="summary" class="scroll-section p-5 bg-primary text-white">
            <h2 class="display-6 fw-bold mb-4">4. Summary</h2>
            <p class="opacity-75">This scroll tracker demo shows the basic pattern for tracking visible sections inside a scroll container.</p>
            <button class="btn btn-light mt-3" (click)="scrollToIntro()">Back to Start</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .scroll-container {
      height: 500px;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
    .scroll-section {
      min-height: 400px;
    }
  `
})
export class ScrollTrackPage {
  activeSection: string = 'None';
  dropdownItems: IAppMenuItem[] = [{ label: 'Scroll Options', isHeader: true }];

  acOnInit() {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    const tracker = new AcScrollTrack(container, (activeId) => {
      this.activeSection = activeId ? (activeId.charAt(0).toUpperCase() + activeId.slice(1)) : 'None';
    });

    tracker.registerSections(".scroll-section");
    tracker.startTracking();
  }

  scrollToIntro() {
    const container = document.querySelector('.scroll-container') as HTMLElement;
    container.scrollTop = 0;
  }
}
