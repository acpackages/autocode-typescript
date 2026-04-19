import { AcElement, AcInputElement, AcOutput, AcEventEmitter } from '../core/element.base';

@AcElement({
  selector: 'app-child-counter, [app-child-counter]',
  template: `
    <div class="child-counter">
      <h4>Child Counter</h4>
      <p>Count from parent: <strong>{{ count }}</strong></p>
      <p>Message from parent: <em>{{ message }}</em></p>

      <button ac:on:click="increment()">Increment in Child</button>
      <button ac:on:click="sendMessage()">Send Message to Parent</button>
    </div>
  `,
  styles: [`
    .child-counter {
      border: 2px solid #3498db;
      padding: 15px;
      border-radius: 8px;
      background-color: #ecf0f1;
      margin: 10px 0;
    }
    .child-counter h4 {
      margin-top: 0;
      color: #3498db;
    }
    .child-counter button {
      margin: 5px;
      padding: 8px 12px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .child-counter button:hover {
      background-color: #2980b9;
    }
  `]
})
export class ChildCounterElement {
  @AcInputElement() count: number = 0;
  @AcInputElement() message: string = '';

  @AcOutput() countChange = new AcEventEmitter<number>();
  @AcOutput() messageFromChild = new AcEventEmitter<string>();

  increment() {
    this.countChange.emit(this.count + 1);
  }

  sendMessage() {
    this.messageFromChild.emit(`Hello from child at ${new Date().toLocaleTimeString()}`);
  }

  onInit() {
    console.log('ChildCounterElement initialized with count:', this.count);
  }
}
