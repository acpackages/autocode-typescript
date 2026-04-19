import { AcSlides } from '@autocode-ts/ac-browser';

export class SlidesBasicTestPage extends HTMLElement {
  private acSlides!: AcSlides;

  connectedCallback() {
    this.innerHTML = `
      <style>
        .slides-container {
          position: relative;
          width: 600px;
          height: 300px;
          margin: 20px auto;
          border: 2px solid #007bff;
          border-radius: 8px;
          overflow: hidden;
          user-select: none;
          background: #eee;
        }
        .ac-slide {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 2rem;
          font-weight: bold;
          color: white;
          user-select: none;
        }
        .slide1 { background: #007bff; }
        .slide2 { background: #28a745; }
        .slide3 { background: #dc3545; }
        .slide4 { background: #ffc107; color: #333; }
        .controls {
          margin: 15px auto;
          text-align: center;
        }
        button {
          margin: 0 10px;
          padding: 8px 14px;
          font-size: 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #0056b3;
        }
      </style>

      <div class="slides-container">
        <div class="ac-slide slide1">Slide 1</div>
        <div class="ac-slide slide2">Slide 2</div>
        <div class="ac-slide slide3">Slide 3</div>
        <div class="ac-slide slide4">Slide 4</div>
      </div>

      <div class="controls">
        <button id="prevBtn">Previous</button>
        <button id="nextBtn">Next</button>
        <button id="startBtn">Start Auto Slide</button>
        <button id="stopBtn">Stop Auto Slide</button>
      </div>
    `;

    const container = this.querySelector('.slides-container') as HTMLElement;
    this.acSlides = new AcSlides(container, { interval: 2000, loop: true });

    this.querySelector('#prevBtn')?.addEventListener('click', () => this.acSlides.prev());
    this.querySelector('#nextBtn')?.addEventListener('click', () => this.acSlides.next());
    this.querySelector('#startBtn')?.addEventListener('click', () => this.acSlides.start());
    this.querySelector('#stopBtn')?.addEventListener('click', () => this.acSlides.stop());
  }
}
