import { AcElement } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'for-test',
  template: `
    <div class="test-section">
      <h3>ac:for Loops</h3>

      <div class="controls">
        <input type="text" ac:model="newItemName" placeholder="New item name...">
        <button (click)="addItem()">Add Item</button>
        <button (click)="shuffleItems()">Shuffle</button>
        <button (click)="clearItems()">Clear All</button>
      </div>

      <ul class="item-list">
        <li ac:for="let item of items; let i = index; let isLast = last" class="list-item">
          <span class="index">#{{ i + 1 }}</span>
          <span class="name">{{ item.name }}</span>
          <button (click)="removeItem(i)" class="delete-btn">Remove</button>
          <span ac:if="isLast" class="last-badge">Last!</span>
        </li>
      </ul>

      <div ac:if="items.length === 0" class="empty-state">
        No items in the list. Add some!
      </div>
    </div>

    <style>
      .test-section {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .controls { margin-bottom: 1rem; display: flex; gap: 0.5rem; }
      input {
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
        color: white;
        padding: 0.5rem;
        border-radius: 4px;
        flex: 1;
      }
      .item-list { list-style: none; padding: 0; margin: 0; }
      .list-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 0.5rem;
        border-radius: 6px;
      }
      .index { color: #64748b; font-weight: bold; width: 30px; }
      .name { flex: 1; }
      .delete-btn {
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
      }
      .last-badge {
        background: #eab308;
        color: black;
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: bold;
      }
      .empty-state {
        text-align: center;
        color: #64748b;
        padding: 2rem;
        border: 2px dashed rgba(255,255,255,0.05);
        border-radius: 8px;
      }
    </style>
  `
})
export class ForTest {
  items = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cherry' }
  ];
  newItemName = '';

  addItem() {
    if (this.newItemName.trim()) {
      this.items.push({ name: this.newItemName.trim() });
      this.newItemName = '';
    }
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  shuffleItems() {
    this.items = [...this.items].sort(() => Math.random() - 0.5);
  }

  clearItems() {
    this.items = [];
  }
}
