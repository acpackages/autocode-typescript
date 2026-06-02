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
import { TemplateCompiler } from '../src/lib/template-compiler.js';

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
    // Should use removeNodesBetweenComments to clear structural block elements
    expect(results[0].code).toContain('removeNodesBetweenComments(');
    // Should check the condition on the context
    expect(results[0].code).toContain('const newValue = ctx.show');
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

  it('should handle @AcSubscribeChange on method declarations only', () => {
    const source = `
      import { AcElement, AcSubscribeChange } from './decorators';
      @AcElement({
        selector: 'test-sub',
        template: '<div>Hello</div>'
      })
      export class TestSub {
        @AcSubscribeChange('theme')
        onThemeChange(change) {}

        @AcSubscribeChange(['layout', 'sidebar'])
        onLayoutChange(change) {}

        @AcSubscribeChange('ignored')
        onIgnoredProp = (change) => {};
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].subscribeChanges).toBeDefined();
    expect(results[0].subscribeChanges).toContainEqual({
      methodName: 'onThemeChange',
      keys: ['theme']
    });
    expect(results[0].subscribeChanges).toContainEqual({
      methodName: 'onLayoutChange',
      keys: ['layout', 'sidebar']
    });
    // Property declaration with @AcSubscribeChange should be ignored
    expect(results[0].subscribeChanges).not.toContainEqual(
      expect.objectContaining({ methodName: 'onIgnoredProp' })
    );
  });

  it('should handle @AcListenChanges on property declarations only', () => {
    const source = `
      import { AcElement, AcListenChanges } from './decorators';
      @AcElement({
        selector: 'test-listen',
        template: '<div>Hello</div>'
      })
      export class TestListen {
        @AcListenChanges('count')
        onCountChange = (change) => {};

        @AcListenChanges(['width', 'height'])
        onResize = (change) => {};

        @AcListenChanges()
        directDecoratorChangeListenerProperty = false;

        @AcListenChanges('ignored')
        onIgnored(change) {}
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].listenChanges).toBeDefined();
    // listenChanges is a flat array of keys
    expect(results[0].listenChanges).toContain('count');
    expect(results[0].listenChanges).toContain('width');
    expect(results[0].listenChanges).toContain('height');
    expect(results[0].listenChanges).toContain('directDecoratorChangeListenerProperty');
    // Method declaration with @AcListenChanges should be ignored
    expect(results[0].listenChanges).not.toContain('ignored');
  });

  it('should resolve @AcListenChanges and @AcSubscribeChange keys from nested paths, static properties, enums, and constants', () => {
    const source = `
      import { AcElement, AcListenChanges, AcSubscribeChange } from './decorators';
      
      const ROOT_KEY = 'global.theme';
      
      export enum ConfigEnum {
        FONT = 'theme.font',
        SIZE = 'theme.size'
      }
      
      export class ConfigClass {
        static COLOR = 'theme.color';
      }

      @AcElement({
        selector: 'test-nested-listen',
        template: '<div>Nested</div>'
      })
      export class TestNestedListen {
        @AcListenChanges(ROOT_KEY)
        onGlobalTheme = () => {};

        @AcListenChanges(ConfigClass.COLOR)
        onColorChange = () => {};

        @AcListenChanges([ConfigEnum.FONT, ConfigEnum.SIZE, 'sidebar.state'])
        onStyleChange = () => {};

        @AcSubscribeChange(ConfigClass.COLOR)
        handleColorChange() {}
      }
    `;

    const results = compiler.compile(source);
    expect(results[0].listenChanges).toContain('global.theme');
    expect(results[0].listenChanges).toContain('theme.color');
    expect(results[0].listenChanges).toContain('theme.font');
    expect(results[0].listenChanges).toContain('theme.size');
    expect(results[0].listenChanges).toContain('sidebar.state');
    
    expect(results[0].subscribeChanges).toContainEqual({
      methodName: 'handleColorChange',
      keys: ['theme.color']
    });
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
    // Should use initLoop to instantiate loop items
    expect(results[0].code).toContain('initLoop(');
    // Should define the child renderer class
    expect(results[0].code).toContain('childRendererClass: $$$TestFor$ForItem$');
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

  it('should pass `this` to constructor when parameter type is AcRuntimeElement', () => {
    const source = `
      import { AcElement } from './decorators';
      import { AcRuntimeElement } from '@autocode-ts/ac-runtime';
      @AcElement({
        selector: 'test-ctor',
        template: '<div>Hello</div>'
      })
      export class TestCtor {
        constructor(private element: AcRuntimeElement) {}
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    expect(results[0].selector).toBe('test-ctor');
    // Should pass `this` to the constructor for AcRuntimeElement param
    expect(results[0].code).toContain('new TestCtor(this)');
  });

  it('should generate no-arg constructor call when class has no constructor', () => {
    const source = `
      import { AcElement } from './decorators';
      @AcElement({
        selector: 'test-no-ctor',
        template: '<div>Hello</div>'
      })
      export class TestNoCtor {
        name = 'World';
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should call with no arguments
    expect(results[0].code).toContain('new TestNoCtor()');
  });

  it('should handle constructor with multiple params including AcRuntimeElement', () => {
    const source = `
      import { AcElement } from './decorators';
      import { AcRuntimeElement } from '@autocode-ts/ac-runtime';
      @AcElement({
        selector: 'test-multi-ctor',
        template: '<div>Hello</div>'
      })
      export class TestMultiCtor {
        constructor(private element: AcRuntimeElement, private other: SomeService) {}
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // AcRuntimeElement -> this, unknown type -> undefined
    expect(results[0].code).toContain('new TestMultiCtor(this, undefined)');
  });

  it('should compile multiple AcElement classes in a single file', () => {
    const source = `
      import { AcElement } from './decorators';
      
      @AcElement({
        selector: 'test-multiple-a',
        template: '<div>Component A</div>'
      })
      export class TestMultipleA {}

      @AcElement({
        selector: 'test-multiple-b',
        template: '<div>Component B</div>'
      })
      export class TestMultipleB {}

      export const helperConst = 123;
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(2);
    expect(results[0].selector).toBe('test-multiple-a');
    expect(results[1].selector).toBe('test-multiple-b');

    // Both results should have the full code containing both component IIFEs and the helper constant
    expect(results[0].code).toContain('export const TestMultipleA = (function()');
    expect(results[0].code).toContain('export const TestMultipleB = (function()');
    expect(results[0].code).toContain('export const helperConst = 123;');

    expect(results[1].code).toContain('export const TestMultipleA = (function()');
    expect(results[1].code).toContain('export const TestMultipleB = (function()');
    expect(results[1].code).toContain('export const helperConst = 123;');
  });
});

describe('TemplateCompiler - reactiveProperties map', () => {
  const tc = new TemplateCompiler();

  it('should generate map for text, property, class, model, if, and for reactivity types', () => {
    const template = `
      <div [class.active]="isActive" [style.color]="textColor" ac:bind:title="tooltip">
        Hello {{name}}!
        <input ac:model="username" />
        <div ac:if="show">
          <ul>
            <li ac:for="item of items">{{item.name}}</li>
          </ul>
        </div>
      </div>
    `;

    const result = tc.compile(template);
    expect(result.reactiveProperties).toBeDefined();

    // isActive
    expect(result.reactiveProperties['isActive']).toBeDefined();
    expect(result.reactiveProperties['isActive'][0].type).toBe('class');

    // textColor
    expect(result.reactiveProperties['textColor']).toBeDefined();
    expect(result.reactiveProperties['textColor'][0].type).toBe('style');

    // tooltip
    expect(result.reactiveProperties['tooltip']).toBeDefined();
    expect(result.reactiveProperties['tooltip'][0].type).toBe('bind');

    // name
    expect(result.reactiveProperties['name']).toBeDefined();
    expect(result.reactiveProperties['name'][0].type).toBe('value');

    // username
    expect(result.reactiveProperties['username']).toBeDefined();
    expect(result.reactiveProperties['username'][0].type).toBe('model');

    // show
    expect(result.reactiveProperties['show']).toBeDefined();
    expect(result.reactiveProperties['show'][0].type).toBe('if');

    // items
    expect(result.reactiveProperties['items']).toBeDefined();
    expect(result.reactiveProperties['items'][0].type).toBe('for');

    // local loop variable 'item' should not be in the reactive properties map
    expect(result.reactiveProperties['item']).toBeUndefined();
  });

  it('should exclude global variables and local function variables', () => {
    const template = `
      <div>
        {{Math.round(count)}}
        {{items.map(item => item.name).join(', ')}}
      </div>
    `;

    const result = tc.compile(template);
    expect(result.reactiveProperties).toBeDefined();

    // Math is global, should not be reactive
    expect(result.reactiveProperties['Math']).toBeUndefined();

    // count is a property, should be reactive
    expect(result.reactiveProperties['count']).toBeDefined();
    expect(result.reactiveProperties['count'][0].type).toBe('value');

    // items is a property, should be reactive
    expect(result.reactiveProperties['items']).toBeDefined();
    expect(result.reactiveProperties['items'][0].type).toBe('value');

    // item is a local parameter in arrow function, should not be reactive
    expect(result.reactiveProperties['item']).toBeUndefined();
  });

  it('should generate targetElementHtml with correct finalized HTML on each reactive property entry', () => {
    const template = `
      <div [class.active]="isActive">
        Hello {{name}}!
        <div ac:if="show">Conditional</div>
      </div>
    `;

    const result = tc.compile(template);
    expect(result.reactiveProperties).toBeDefined();

    // isActive -> targetElementHtml should be the div tag, containing the child elements and ac-ref
    const activeEntry = result.reactiveProperties['isActive'][0];
    expect(activeEntry.targetElementHtml).toBeDefined();
    expect(activeEntry.targetElementHtml).toContain('<div');
    expect(activeEntry.targetElementHtml).toContain('ac-ref=');
    expect(activeEntry.targetElementHtml).toContain('<span');

    // name -> targetElementHtml should be the span placeholder
    const nameEntry = result.reactiveProperties['name'][0];
    expect(nameEntry.targetElementHtml).toBeDefined();
    expect(nameEntry.targetElementHtml).toContain('<span');
    expect(nameEntry.targetElementHtml).toContain('ac-ref=');

    // show -> targetElementHtml should be the ac-if comment node
    const showEntry = result.reactiveProperties['show'][0];
    expect(showEntry.targetElementHtml).toBeDefined();
    expect(showEntry.targetElementHtml).toContain('<!--ac-if-');
  });

  it('should include properties in bindings matching extracted identifiers', () => {
    const template = `
      <div [class.active]="isActive">
        Hello {{name}}!
        <div ac:if="show">Conditional</div>
      </div>
    `;
    const result = tc.compile(template);
    expect(result.bindings).toBeDefined();

    const classBinding = result.bindings.find(b => b.type === 'class');
    expect(classBinding).toBeDefined();
    expect(classBinding?.properties).toEqual(['isActive']);

    const textBinding = result.bindings.find(b => b.type === 'text');
    expect(textBinding).toBeDefined();
    expect(textBinding?.properties).toEqual(['name']);

    const ifBinding = result.bindings.find(b => b.type === 'if');
    expect(ifBinding).toBeDefined();
    expect(ifBinding?.properties).toEqual(['show']);
  });

  it('should extract properties correctly when prefixed with this', () => {
    const template = `
      <div [class.active]="this.isActive">
        Hello {{this.name}}!
        <div ac:if="this.show">Conditional</div>
      </div>
    `;
    const result = tc.compile(template);
    expect(result.bindings).toBeDefined();

    const classBinding = result.bindings.find(b => b.type === 'class');
    expect(classBinding).toBeDefined();
    expect(classBinding?.properties).toEqual(['isActive']);

    const textBinding = result.bindings.find(b => b.type === 'text');
    expect(textBinding).toBeDefined();
    expect(textBinding?.properties).toEqual(['name']);

    const ifBinding = result.bindings.find(b => b.type === 'if');
    expect(ifBinding).toBeDefined();
    expect(ifBinding?.properties).toEqual(['show']);

    expect(result.reactiveProperties['isActive']).toBeDefined();
    expect(result.reactiveProperties['name']).toBeDefined();
    expect(result.reactiveProperties['show']).toBeDefined();
  });

  it('should compile text nodes with static text correctly', () => {
    const template = `<div>Hello {{name}}! Welcome back.</div>`;
    const result = tc.compile(template);
    expect(result.bindings).toBeDefined();

    const textBinding = result.bindings.find(b => b.type === 'text');
    expect(textBinding).toBeDefined();
    expect(textBinding?.expression).toBe("name");
    expect(textBinding?.properties).toEqual(['name']);
    expect(result.html).toContain('Hello <span ac-ref="');
    expect(result.html).toContain('></span>! Welcome back.');
  });

  it('should compute ownedElementIds correctly for nested structures', () => {
    const template = `
      <div [class.active]="isActive">
        <span [id]="someId"></span>
        <ac-datagrid #grid></ac-datagrid>
        <div ac:if="show">
          <p [class.visible]="isVisible"></p>
          <div ac:for="item of items">
            <span [class.active]="item.active"></span>
          </div>
        </div>
        <ac-template #myTemplate>
          <span [class.selected]="isSelected"></span>
        </ac-template>
      </div>
    `;
    const result = tc.compile(template);
    expect(result.ownedElementIds).toBeDefined();

    const divId = result.bindings.find(b => b.type === 'class' && b.expression === 'isActive')?.targetId;
    const spanId = result.bindings.find(b => b.type === 'property' && b.expression === 'someId')?.targetId;
    const gridId = result.idMap['grid'];
    const ifBinding = result.bindings.find(b => b.type === 'if');
    const pId = ifBinding?.childBindings?.find(b => b.type === 'class' && b.expression === 'isVisible')?.targetId;
    const forBinding = ifBinding?.childBindings?.find(b => b.type === 'for');
    const innerSpanId = forBinding?.childBindings?.find(b => b.type === 'class' && b.expression === 'item.active')?.targetId;
    const templateBinding = result.bindings.find(b => b.type === 'template');
    const templateSpanId = templateBinding?.childBindings?.find(b => b.type === 'class' && b.expression === 'isSelected')?.targetId;

    expect(divId).toBeDefined();
    expect(spanId).toBeDefined();
    expect(gridId).toBeDefined();
    expect(ifBinding).toBeDefined();
    expect(pId).toBeDefined();
    expect(forBinding).toBeDefined();
    expect(innerSpanId).toBeDefined();
    expect(templateBinding).toBeDefined();
    expect(templateSpanId).toBeDefined();

    expect(result.ownedElementIds).toContain(divId);
    expect(result.ownedElementIds).toContain(spanId);
    expect(result.ownedElementIds).toContain(gridId);
    expect(result.ownedElementIds).toContain(ifBinding?.targetId);
    expect(result.ownedElementIds).toContain(pId);
    expect(result.ownedElementIds).toContain(forBinding?.targetId);
    expect(result.ownedElementIds).toContain(templateBinding?.targetId);
    expect(result.ownedElementIds).not.toContain(innerSpanId);
    expect(result.ownedElementIds).not.toContain(templateSpanId);

    expect(forBinding?.ownedElementIds).toBeUndefined();
    expect(forBinding?.item?.ownedElementIds).toContain(innerSpanId);
    expect(forBinding?.item?.ownedElementIds).not.toContain(divId);

    expect(templateBinding?.ownedElementIds).toContain(templateSpanId);
    expect(templateBinding?.ownedElementIds).not.toContain(divId);
  });
});

describe('Compile-time event/model/pipe migration', () => {
  const compiler = new ComponentCompiler();

  it('should compile event handlers to direct code instead of evaluateExpression', () => {
    const source = `
      @AcElement({
        selector: 'test-event-compiled',
        template: '<button (click)="handleClick($event)">Click</button>'
      })
      export class TestEventCompiled {
        handleClick(e: any) {}
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should NOT use evaluateExpression for event handlers
    expect(results[0].code).not.toContain('this.evaluateExpression');
    // Should generate direct compiled code with ctx reference
    expect(results[0].code).toContain('ctx.handleClick($event)');
    // Should still set up event listener
    expect(results[0].code).toContain("addEventListener('click'");
    // Should extract $event from AcRuntimeElementEvent or use native event
    expect(results[0].code).toContain('AcRuntimeElementEvent');
  });

  it('should compile model bindings to direct assignment instead of evaluateExpression', () => {
    const source = `
      @AcElement({
        selector: 'test-model-compiled',
        template: '<input ac:model="username" />'
      })
      export class TestModelCompiled {
        username = '';
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should NOT use evaluateExpression for model write-back
    expect(results[0].code).not.toContain('this.evaluateExpression');
    // Should generate direct assignment
    expect(results[0].code).toContain('ctx.username = el.value');
    // Should set up both input and change listeners
    expect(results[0].code).toContain("addEventListener('input'");
    expect(results[0].code).toContain("addEventListener('change'");
  });

  it('should compile pipe expressions at build time instead of deferring to runtime', () => {
    const source = `
      @AcElement({
        selector: 'test-pipe-compiled',
        template: '<div>{{amount | currency}}</div>'
      })
      export class TestPipeCompiled {
        amount = 100;
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should NOT use evaluateExpression for pipe evaluation
    expect(results[0].code).not.toContain('this.evaluateExpression');
    // Should have compiled the pipe to evaluateAcPipeExpression call
    expect(results[0].code).toContain('evaluateAcPipeExpression');
    expect(results[0].code).toContain("'currency'");
  });

  it('should compile chained pipe expressions at build time', () => {
    const source = `
      @AcElement({
        selector: 'test-chained-pipe',
        template: '<div>{{amount | currency | uppercase}}</div>'
      })
      export class TestChainedPipe {
        amount = 100;
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should NOT use evaluateExpression
    expect(results[0].code).not.toContain('this.evaluateExpression');
    // Should have nested evaluateAcPipeExpression calls for chained pipes
    expect(results[0].code).toContain("evaluateAcPipeExpression(evaluateAcPipeExpression(");
  });

  it('should compile event handler with complex expression to direct code', () => {
    const source = `
      @AcElement({
        selector: 'test-complex-event',
        template: '<div (click)="count = count + 1">Increment</div>'
      })
      export class TestComplexEvent {
        count = 0;
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should NOT use evaluateExpression
    expect(results[0].code).not.toContain('this.evaluateExpression');
    // Should generate direct assignment with prefixed identifiers
    expect(results[0].code).toContain('ctx.count = ctx.count + 1');
  });

  it('should compile @AcSubscribeChange to direct method call instead of evaluateExpression', () => {
    const source = `
      import { AcSubscribeChange } from './decorators';

      @AcElement({
        selector: 'test-subscribe',
        template: '<div>{{name}}</div>'
      })
      export class TestSubscribe {
        name = '';

        @AcSubscribeChange('name')
        onNameChange(args: any) {}
      }
    `;

    const results = compiler.compile(source);
    expect(results).toHaveLength(1);
    // Should NOT use evaluateExpression for subscribe change callbacks
    expect(results[0].code).not.toContain('evaluateExpression');
    // Should generate direct method call on acRuntimeInstance
    expect(results[0].code).toContain('this.acRuntimeInstance.onNameChange(');
  });
});

