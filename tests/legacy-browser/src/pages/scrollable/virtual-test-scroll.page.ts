import { AcScrollable } from '@autocode-ts/ac-browser';

export class VirtualTestScrollPage extends HTMLElement {
  private acScrollable!: AcScrollable;

  connectedCallback() {
    this.innerHTML = `
      <style>
        .scroll-container {
          position: relative;
          width: 300px;
          height: 400px;
          margin: 20px auto;
          border: 2px solid #007bff;
          border-radius: 8px;
          overflow-y: auto;
          background: #f9f9f9;
        }
        .item {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          background: #fff;
        }
        .controls {
          margin: 15px auto;
          text-align: center;
        }
        button {
          margin: 0 8px;
          padding: 6px 12px;
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

      <div class="scroll-container"></div>

      <div class="controls">
        <button id="addBtn">Add Item</button>
        <button id="scrollTopBtn">Scroll to Top</button>
        <button id="scrollBottomBtn">Scroll to Bottom</button>
      </div>
    `;

    const container = this.querySelector('.scroll-container') as HTMLElement;
    this.acScrollable = new AcScrollable({
      element: container,
      options: {
        bufferCount: 5,
        itemTemplate: (item: { text: string, height: number }, index: number) => {
          const el = document.createElement('div');
          el.className = 'item';
          el.style.height = `${item.height}px`;
          el.textContent = `${item.text} (${index})`;
          return el;
        }
      }
    });

    // Add initial items data
    const items = [];
    for (let i = 1; i <= 1000; i++) {
      items.push({
        text: `Item ${i}`,
        height: 50 + Math.floor(Math.random() * 100)
      });
    }
    this.acScrollable.setItems(items);

    // Controls
    this.querySelector('#addBtn')?.addEventListener('click', () => {
      this.acScrollable.addItem({
        text: `New Item`,
        height: 75
      });
    });

    this.querySelector('#scrollTopBtn')?.addEventListener('click', () => {
      this.acScrollable.scrollTo({ index: 0 });
    });

    this.querySelector('#scrollBottomBtn')?.addEventListener('click', () => {
      this.acScrollable.scrollTo({ index: items.length - 1 });
    });
  }
}
