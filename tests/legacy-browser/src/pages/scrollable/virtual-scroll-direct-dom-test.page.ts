import { AcScrollable } from '@autocode-ts/ac-browser';

/**
 * VirtualScrollDirectDomTestPage
 *
 * Demo page for AcScrollable:
 * - Creates a scrollable container with 1000 items of random height.
 * - Uses AcScrollable for virtual scrolling (renders only visible items + buffer).
 * - Allows adding, removing, and updating items directly in the DOM.
 * - Demonstrates that AcScrollable automatically detects DOM changes (add/remove/update).
 * - Adds per-item action buttons so changes can be made without using top-level controls.
 */
export class VirtualScrollDirectDomTestPage extends HTMLElement {
  private acScrollable!: AcScrollable;
  private itemCounter = 0; // Tracks total number of items created

  connectedCallback() {
    // Template & styles with HTML documentation
    this.innerHTML = `
      <!--
        ===============================
        Virtual Scroll Demo HTML Layout
        ===============================
        .scroll-container
          - Main virtualized scroll area managed by AcScrollable.
          - Initially populated with items of random height.
          - AcScrollable will replace DOM children with spacers + visible items.

        .controls
          - Buttons for adding/removing/updating items globally.
          - These modify the DOM directly; AcScrollable detects changes.

        Each .item:
          - A flexbox container with random height.
          - Contains:
              - Item label.
              - "Update Height" button (changes height randomly).
              - "Delete" button (removes element from DOM).
          - Changes are picked up automatically by AcScrollable observers.
      -->
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
          justify-content: space-between;
          font-size: 1rem;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          background: #fff;
          padding: 0 8px;
        }
        .item button {
          font-size: 0.8rem;
          padding: 2px 6px;
          margin-left: 4px;
          cursor: pointer;
          border: none;
          border-radius: 3px;
          background-color: #007bff;
          color: white;
        }
        .item button:hover {
          background-color: #0056b3;
        }
        .controls {
          margin: 15px auto;
          text-align: center;
        }
        .controls button {
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
        .controls button:hover {
          background-color: #0056b3;
        }
      </style>

      <div class="scroll-container" style="resize:both;"></div>

      <div class="controls">
        <button id="addBtn">Add Item</button>
        <button id="removeBtn">Remove First Item</button>
        <button id="updateHeightBtn">Randomize First Item Height</button>
        <button id="scrollTopBtn">Scroll to Top</button>
        <button id="scrollBottomBtn">Scroll to Bottom</button>
      </div>
    `;

    const container = this.querySelector('.scroll-container') as HTMLElement;

    /**
     * Creates a new item with:
     *  - Random height (50–150px)
     *  - Item label
     *  - Update Height & Delete buttons
     */
    const createItem = (index: number) => {
      const item = document.createElement('div');
      item.className = 'item';
      item.style.height = `${50 + Math.floor(Math.random() * 100)}px`;
      item.innerHTML = `
        <span>Item ${index}</span>
        <span>
          <button class="update-btn">Update Height</button>
          <button class="delete-btn">Delete</button>
        </span>
      `;

      // Update height button
      item.querySelector('.update-btn')?.addEventListener('click', () => {
        console.log(item.style.height);
        item.style.height = `${50 + Math.floor(Math.random() * 100)}px`;
        console.log(item.style.height);
        // ResizeObserver in AcScrollable updates its height automatically
      });

      // Delete button
      item.querySelector('.delete-btn')?.addEventListener('click', () => {
        item.remove(); // MutationObserver updates scrollingElements
      });

      return item;
    };

    // Add initial 1000 items before initializing AcScrollable
    for (let i = 1; i <= 1000; i++) {
      this.itemCounter++;
      container.append(createItem(this.itemCounter));
    }

    // Initialize AcScrollable
    this.acScrollable = new AcScrollable({
      element: container,
      options: { bufferCount: 1 }
    });

    // === Controls ===
    this.querySelector('#addBtn')?.addEventListener('click', () => {
      this.itemCounter++;
      container.append(createItem(this.itemCounter));
    });

    this.querySelector('#removeBtn')?.addEventListener('click', () => {
      const firstItem = container.querySelector('.item');
      if (firstItem) firstItem.remove();
    });

    this.querySelector('#updateHeightBtn')?.addEventListener('click', () => {
      const firstItem = container.querySelector('.item') as HTMLElement;
      if (firstItem) {
        firstItem.style.height = `${50 + Math.floor(Math.random() * 100)}px`;
      }
    });

    this.querySelector('#scrollTopBtn')?.addEventListener('click', () => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.querySelector('#scrollBottomBtn')?.addEventListener('click', () => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });

    console.log('AcScrollable instance:', this.acScrollable);
  }
}
