import { AcElement, AcInputElement, AcOutput, AcViewChild, AcEventEmitter } from '../core/element.base';
import { ChildCounterElement } from './child-counter.element';

@AcElement({
  selector: '#parent-child-demo',
  template: `
    <div class="parent-container">
      <h3>Nested Components & ViewChild Demo</h3>

      <div class="parent-controls">
        <h4>Parent Component State</h4>
        <p>Parent Count: <strong>{{ parentCount }}</strong></p>
        <p>Parent Message: <em>"{{ parentMessage }}"</em></p>
        <p>Last Child Event: <em>{{ childMessage }}</em></p>

        <div class="button-group">
          <button ac:on:click="incrementParent()">Increment Parent Count</button>
          <button ac:on:click="updateMessage()">Update Parent Message</button>
          <button ac:on:click="accessChildDirectly()">Log Child Instance</button>
        </div>
      </div>

      <hr>

      <div class="nested-section">
        <h4>1. Tag-Based Element (&lt;app-child-counter&gt;)</h4>
        <app-child-counter
          [count]="parentCount"
          [message]="parentMessage"
          (countChange)="handleCountChange($event)"
          (messageFromChild)="handleChildMessage($event)">
        </app-child-counter>
      </div>

      <div class="nested-section user-styled">
        <h4>2. Attribute-Based Element (&lt;div app-child-counter&gt;)</h4>
        <div app-child-counter
          [count]="parentCount"
          [message]="'Attribute Style: ' + parentMessage"
          (countChange)="handleCountChange($event)"
          (messageFromChild)="handleChildMessage($event)">
        </div>
      </div>

      <hr>

      <div class="explanation">
        <h4>Features Demonstrated:</h4>
        <ul>
          <li><strong>Tag-Based Elements:</strong> <code>&lt;app-child-counter&gt;</code></li>
          <li><strong>Attribute-Based Elements:</strong> <code>&lt;div app-child-counter&gt;</code></li>
          <li><strong>Property Binding:</strong> <code>[count]="parentCount"</code></li>
          <li><strong>Event Binding:</strong> <code>(countChange)="handler($event)"</code></li>
          <li><strong>ViewChild:</strong> Access child instance via <code>@AcViewChild</code></li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .parent-container {
      border: 2px solid #8e44ad;
      padding: 20px;
      border-radius: 8px;
      background-color: #f9f9f9;
      margin: 20px 0;
    }
    .parent-container h3 {
      margin-top: 0;
      color: #8e44ad;
    }
    .parent-controls {
      background-color: #f4ecf7;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      border-left: 4px solid #8e44ad;
    }
    .nested-section {
      margin: 15px 0;
      padding: 10px;
      background-color: #fff;
      border: 1px dashed #ccc;
      border-radius: 4px;
    }
    .nested-section h4 {
      margin-top: 0;
      color: #555;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .user-styled {
      background-color: #e8f6f3;
      border-color: #1abc9c;
    }
    .button-group button {
      margin: 5px;
      padding: 8px 12px;
      background-color: #8e44ad;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .button-group button:hover {
      background-color: #7d3c98;
    }
    .explanation {
      background-color: #fff;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #ddd;
    }
    .explanation li {
      margin-bottom: 5px;
    }
    code {
      background-color: #f0f0f0;
      padding: 2px 5px;
      border-radius: 3px;
      color: #c7254e;
    }
  `]
})
export class ParentChildDemoElement {
  public parentCount = 5;
  public parentMessage = 'Hello from parent!';
  public childMessage = 'No events yet...';

  @AcViewChild('app-child-counter')
  public childCounter!: ChildCounterElement;

  incrementParent() {
    this.parentCount++;
  }

  updateMessage() {
    const messages = [
      'Hello from parent!',
      'Data flows down via [Input]',
      'Events flow up via (Output)',
      'Nested Components Work!'
    ];
    const currentIndex = messages.indexOf(this.parentMessage);
    this.parentMessage = messages[(currentIndex + 1) % messages.length];
  }

  accessChildDirectly() {
    if (this.childCounter) {
      console.log('Accessed Child via @AcViewChild:', this.childCounter);
      this.childMessage = `Accessed child directly! Current count: ${this.childCounter.count}`;
      // Direct manipulation is possible!
      this.childCounter.count += 10;
    } else {
      console.warn('Child not found via @AcViewChild');
    }
  }

  handleCountChange(newCount: number) {
    console.log('Parent received countChange:', newCount);
    this.parentCount = newCount;
  }

  handleChildMessage(message: string) {
    console.log('Parent received message:', message);
    this.childMessage = message;
  }

  onInit() {
    console.log('ParentChildDemoElement initialized');
  }
}
