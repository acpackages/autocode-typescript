import { describe, it, expect } from 'vitest';
import { ComponentCompiler } from '../src/lib/component-compiler.js';

describe('ComponentCompiler', () => {
  const compiler = new ComponentCompiler();

  it('should extract metadata and compile a simple component', () => {
    const source = `
      import { AcElement } from './decorators';
      @AcElement({
        selector: 'test-el',
        template: '<div>Hello {{name}}</div>'
      })
      export class TestEl {
        name = 'World';
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    expect(results[0].selector).toBe('test-el');
    expect(results[0].className).toBe('TestEl');
    expect(results[0].code).toContain('class TestElCompiled extends HTMLElement');
    expect(results[0].code).toContain('createSignal<any>(\'World\')');
    expect(results[0].code).toContain('String(`Hello ${this.name}` ?? \'\')');
  });

  it('should handle @AcInput and @AcOutput', () => {
    const source = `
      import { AcElement, AcInput, AcOutput } from './decorators';
      @AcElement({
        selector: 'test-io',
        template: '<div>{{title}}</div>'
      })
      export class TestIO {
        @AcInput() title = 'Default';
        @AcOutput() change = new EventEmitter();
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain('createSignal<any>(\'Default\')');
    expect(results[0].code).toContain("Object.defineProperty(this, 'title'");
    expect(results[0].code).toContain("(this as any).change = { emit: (data: any) => this.dispatchEvent(new CustomEvent('change', { detail: data })) }");
  });

  it('should handle ac:if structural directive', () => {
    const source = `
      @AcElement({
        selector: 'test-if',
        template: '<div ac:if="show">Visible</div>'
      })
      export class TestIf {
        show = true;
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain("document.createComment('ac:if')");
    expect(results[0].code).toContain("const condition = this.show;");
  });

  it('should only create signals for properties used in template or marked as @AcInput', () => {
    const source = `
      @AcElement({
        selector: 'test-opt',
        template: '<div>{{used}}</div>'
      })
      export class TestOpt {
        used = 'I am reactive';
        unused = 'I am static';
        @AcInput() forced = 'I am also reactive';
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain("Object.defineProperty(this, 'used'");
    expect(results[0].code).toContain("Object.defineProperty(this, 'forced'");
    expect(results[0].code).not.toContain("Object.defineProperty(this, 'unused'");
    expect(results[0].code).toContain("(this as any).unused = 'I am static'");
  });

  it('should transform mutating array calls to trigger signals', () => {
    const source = `
      @AcElement({
        selector: 'test-mut',
        template: '<div>{{items.length}}</div>'
      })
      export class TestMut {
        items = [];
        addItem(x) {
          this.items.push(x);
        }
      }
    `;

    const results = compiler.compile(source);
    // The transformation should wrap the push call in a comma expression that triggers the setter
    expect(results[0].code).toContain('(this.items.push(x), this.items = this.items)');
  });

  it('should handle @AcViewChild', () => {
    const source = `
      @AcElement({
        selector: 'test-vc',
        template: '<div id="myDiv">Hello</div>'
      })
      export class TestVC {
        @AcViewChild('myDiv') element;
      }
    `;

    const results = compiler.compile(source);
    // Should find el0 (the div) and assign it to this.element
    expect(results[0].code).toContain('(this as any).element = el0;');
  });

  it('should handle ac-container by not rendering the tag but rendering children', () => {
    const source = `
      @AcElement({
        selector: 'test-container',
        template: '<div><ac-container><span>A</span><span>B</span></ac-container></div>'
      })
      export class TestContainer {}
    `;

    const results = compiler.compile(source);
    // Should NOT contain document.createElement('ac-container')
    expect(results[0].code).not.toContain("createElement('ac-container')");
    // Should contain span A and span B appended to div
    expect(results[0].code).toContain("el0.appendChild(el1);"); // span A
    expect(results[0].code).toContain("el0.appendChild(el3);"); // span B
  });

  it('should handle ac:for structural directive', () => {
    const source = `
      @AcElement({
        selector: 'test-for',
        template: '<div ac:for="item of items">{{item}}</div>'
      })
      export class TestFor {
        items = [1, 2, 3];
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain("document.createComment('ac:for')");
    expect(results[0].code).toContain("const list = (this.items as any[]) || [];");
    expect(results[0].code).toContain("const subRender = (function(this: any, item: any) {");
  });
});
