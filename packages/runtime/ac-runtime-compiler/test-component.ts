/**
 * @file Manual Test Component
 *
 * A sample component used for manual integration testing of the compiler.
 * Run through the CLI or the dev server to verify end-to-end compilation:
 *
 * ```bash
 * npx ts-node src/cli.ts test-component.ts
 * ```
 *
 * Exercises: `@AcInput`, text interpolation, event bindings, style bindings,
 * ternary expressions, and `ac:if` conditional rendering.
 */
import { AcElement, AcInput, AcOutput } from './decorators';

@AcElement({
  selector: 'test-counter',
  template: `
    <div>
      <h1>Counter: {{count}}</h1>
      <button (click)="increment()">Increment</button>
      <button (click)="decrement()">Decrement</button>
      <div [style.color]="count > 5 ? 'red' : 'black'">
        Status: {{count > 5 ? 'High' : 'Low'}}
      </div>
      <div ac:if="count > 10">
        <h2>Danger: Count is too high!</h2>
      </div>
    </div>
  `
})
export class TestCounter {
  @AcInput() title: string = 'My Counter';
  count = 0;

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }

  acOnInit() {
    console.log('Counter initialized with title:', this.title);
  }
}
