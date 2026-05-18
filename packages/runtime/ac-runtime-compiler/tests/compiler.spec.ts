/**
 * @file ComponentCompiler Test Suite
 *
 * Comprehensive tests for the AC Runtime ComponentCompiler.
 *
 * Each test case provides a minimal TypeScript source string with an
 * `@AcElement`-decorated class, compiles it, and asserts that the
 * generated output contains the expected code patterns.
 *
 * **Coverage:**
 * - Basic component compilation (selector, class, signals)
 * - `@AcInput` / `@AcOutput` decorator handling
 * - Structural directives: `ac:if`, `ac:for`
 * - Reactive property optimization (only template-used props get signals)
 * - Method/event handler compilation
 * - `@AcViewChild` template reference resolution
 * - `<ac-container>` virtual container rendering
 * - Scoped style injection with `:host` replacement
 * - Binding types: class, style, model, attribute
 * - Class inheritance (`extends BaseComponent`)
 * - Non-component file passthrough
 */
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
    // Should generate IIFE-wrapped class
    expect(results[0].code).toContain('export const TestEl = (function()');
    expect(results[0].code).toContain('class TestEl');
    // Name should be reactive since it's used in template
    expect(results[0].code).toContain("Object.defineProperty(this, 'name'");
    expect(results[0].code).toContain('createSignal');
    // Template text binding should use textContent
    expect(results[0].code).toContain('el.textContent = String(');
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
    // Input should be reactive (signal-backed)
    expect(results[0].code).toContain("Object.defineProperty(this, 'title'");
    expect(results[0].code).toContain('createSignal');
    // Output should dispatch custom events
    expect(results[0].code).toContain("(this as any).change =");
    expect(results[0].code).toContain("emit: (data: any) => this.element.dispatchEvent(new CustomEvent('change'");
    // observedAttributes should include inputs
    expect(results[0].code).toContain('["title"]');
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
    // Should produce a comment placeholder for ac:if
    expect(results[0].code).toContain('<!--ac-if-');
    // Should use findComment to locate the placeholder
    expect(results[0].code).toContain('findComment(');
    // Should check the condition
    expect(results[0].code).toContain('const condition = this.show');
    // Should show reactive signal for 'show'
    expect(results[0].code).toContain("Object.defineProperty(this, 'show'");
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
    // 'used' and 'forced' should have signal-backed properties
    expect(results[0].code).toContain("Object.defineProperty(this, 'used'");
    expect(results[0].code).toContain("Object.defineProperty(this, 'forced'");
    // 'unused' should NOT be signal-backed
    expect(results[0].code).not.toContain("Object.defineProperty(this, 'unused'");
    // But 'unused' should still be initialized
    expect(results[0].code).toContain("(this as any).unused = 'I am static'");
  });

  it('should handle methods in the component class', () => {
    const source = `
      @AcElement({
        selector: 'test-methods',
        template: '<button (click)="increment()">Count: {{count}}</button>'
      })
      export class TestMethods {
        count = 0;
        increment() {
          this.count++;
        }
      }
    `;

    const results = compiler.compile(source);
    // Should include the method body
    expect(results[0].code).toContain('increment()');
    expect(results[0].code).toContain('this.count++');
    // Should set up event listener
    expect(results[0].code).toContain("addEventListener('click'");
  });

  it('should handle @AcViewChild', () => {
    const source = `
      @AcElement({
        selector: 'test-vc',
        template: '<div #myDiv>Hello</div>'
      })
      export class TestVC {
        @AcViewChild('myDiv') myDiv;
      }
    `;

    const results = compiler.compile(source);
    // Should generate a getter via Object.defineProperty for the view child
    expect(results[0].code).toContain("Object.defineProperty(this, 'myDiv'");
    expect(results[0].code).toContain("querySelector('[ac-ref=");
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
    // The innerHTML should contain spans directly inside div, no ac-container tag
    expect(results[0].code).toContain('<span>A</span><span>B</span>');
    expect(results[0].code).not.toContain('ac-container');
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
    // Should produce a comment placeholder for ac:for
    expect(results[0].code).toContain('<!--ac-for-');
    // Should use findComment to locate placeholder
    expect(results[0].code).toContain('findComment(');
    // Should iterate the list
    expect(results[0].code).toContain('const list = (this.items as any[]) || []');
    // 'items' should be reactive
    expect(results[0].code).toContain("Object.defineProperty(this, 'items'");
  });

  it('should handle styles with :host scoping', () => {
    const source = `
      @AcElement({
        selector: 'test-styles',
        template: '<div>Styled</div>',
        styles: ':host { display: block; color: red; }'
      })
      export class TestStyles {}
    `;

    const results = compiler.compile(source);
    // Should replace :host with tag selector and wrap
    expect(results[0].code).toContain('test-styles');
    expect(results[0].code).toContain('__styles');
    expect(results[0].code).toContain('__styleRefCount');
    expect(results[0].code).toContain("data-ac-style");
  });

  it('should handle class bindings', () => {
    const source = `
      @AcElement({
        selector: 'test-class',
        template: '<div [class.active]="isActive">Toggle</div>'
      })
      export class TestClass {
        isActive = false;
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain("classList.add('active')");
    expect(results[0].code).toContain("classList.remove('active')");
  });

  it('should handle style bindings', () => {
    const source = `
      @AcElement({
        selector: 'test-style-bind',
        template: '<div [style.color]="textColor">Colored</div>'
      })
      export class TestStyleBind {
        textColor = 'red';
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain("style['color']");
  });

  it('should handle ac:model two-way binding', () => {
    const source = `
      @AcElement({
        selector: 'test-model',
        template: '<input ac:model="name" />'
      })
      export class TestModel {
        name = '';
      }
    `;

    const results = compiler.compile(source);
    // Should set value from signal
    expect(results[0].code).toContain('el.value');
    // Should listen for input events
    expect(results[0].code).toContain("addEventListener('input'");
  });

  it('should handle attribute bindings', () => {
    const source = `
      @AcElement({
        selector: 'test-attr',
        template: '<div ac:bind:title="tooltip">Hover me</div>'
      })
      export class TestAttr {
        tooltip = 'Hello';
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain("setAttribute('title'");
    expect(results[0].code).toContain("removeAttribute('title'");
  });

  it('should handle inheritance with extends clause', () => {
    const source = `
      import { BaseComponent } from './base';
      @AcElement({
        selector: 'test-extend',
        template: '<div>{{label}}</div>'
      })
      export class TestExtend extends BaseComponent {
        label = 'Extended';
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].code).toContain('class TestExtend extends BaseComponent');
    expect(results[0].code).toContain('super();');
  });

  it('should preserve non-component code as-is', () => {
    const source = `
      const GLOBAL_CONST = 42;
      export function helper() { return true; }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    expect(results[0].selector).toBeNull();
    expect(results[0].code).toContain('GLOBAL_CONST');
    expect(results[0].code).toContain('helper');
  });
});
