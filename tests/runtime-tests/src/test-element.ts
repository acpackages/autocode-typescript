import {  AcElement } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'test-element',
  template: `
    <div class="test-card">
      <h2>Test Element</h2>
      <p>Counter: {{ counter }}</p>
      <button (click)="increment()">Increment</button>
      <button (click)="decrement()">Decrement</button>

      <div class="status" ac:if="counter > 5">
        🔥 High Count!
      </div>
    </div>

    <style>
      .test-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      h2 { margin-top: 0; color: #60a5fa; }
      button {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
        margin-right: 0.5rem;
      }
      button:hover { background: #2563eb; }
      .status {
        margin-top: 1rem;
        padding: 0.5rem;
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        border-radius: 4px;
        text-align: center;
      }
    </style>
  `
})
export class TestElement {
  counter = 0;

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}
