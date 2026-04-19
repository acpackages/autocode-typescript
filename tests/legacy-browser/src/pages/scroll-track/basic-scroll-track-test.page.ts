import { AcScrollTrack } from "@autocode-ts/ac-browser";

export class BasicScrollTrackTestPage extends HTMLElement {
  private statusEl!: HTMLElement;

  connectedCallback() {
    this.innerHTML = `
      <style>
        .container {
          height: 320px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 12px;
          font-family: Arial, sans-serif;
          margin-bottom: 1rem;
          background: #fafafa;
        }
        section {
          height: 260px;
          margin-bottom: 24px;
          border: 1px solid #007bff;
          border-radius: 6px;
          padding: 16px;
          background: #e9f5ff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          overflow: auto;
        }
        section h3 {
          margin-top: 0;
          color: #004085;
        }
        #status {
          font-weight: bold;
          font-size: 1.2rem;
          color: #333;
        }
        p {
          line-height: 1.5;
        }
      </style>

      <div class="container" id="scroll-container">
        <section id="section1">
          <h3>Section 1: Introduction to Scroll Tracking</h3>
          <p>Scroll tracking is essential in modern web apps to highlight navigation items, lazy load content, or trigger animations when sections come into view.</p>
          <p>In this demo, as you scroll, the active section name updates live below the container.</p>
          <p>Try scrolling down to see how the active section changes.</p>
        </section>

        <section id="section2">
          <h3>Section 2: Why Use IntersectionObserver?</h3>
          <p>The IntersectionObserver API efficiently detects when elements enter or leave the viewport, without heavy scroll event listeners.</p>
          <p>It provides smooth and performant scroll-tracking behavior across devices and browsers.</p>
        </section>

        <section id="section3">
          <h3>Section 3: Common Use Cases</h3>
          <ul>
            <li>Updating a sticky table of contents as users scroll</li>
            <li>Loading images or data only when visible (lazy loading)</li>
            <li>Triggering animations on scroll into view</li>
          </ul>
        </section>

        <section id="section4">
          <h3>Section 4: Limitations and Considerations</h3>
          <p>Threshold and root margin settings control how much of the element must be visible to trigger the callback.</p>
          <p>Be careful with dynamic content heights and rapid scrolling, which may cause flicker if not handled properly.</p>
        </section>

        <section id="section5">
          <h3>Section 5: Summary</h3>
          <p>This scroll tracker demo shows the basic pattern for tracking visible sections inside a scroll container using IntersectionObserver.</p>
          <p>Feel free to adapt it for your apps and improve user experience through active state highlights.</p>
        </section>
      </div>

      <div id="status">Active Section: <span id="active-id">None</span></div>
    `;

    this.statusEl = this.querySelector("#active-id") as HTMLElement;

    const container = this.querySelector("#scroll-container") as HTMLElement;
    // const tracker = new AcScrollTrack(container, (activeId) => this.onSectionChange(activeId));

    // tracker.registerSections("section");
    // tracker.startTracking();
  }

  private onSectionChange(activeId: string | null) {
    this.statusEl.textContent = activeId || "None";
  }
}

