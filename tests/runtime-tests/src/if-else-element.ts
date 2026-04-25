import {  AcElement } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'test-element',
  template: `
    <div class="test-card">
      <div></div>
    </div>

    <style>
  `
})
export class IfElseElement {
  counter = 0;

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}
