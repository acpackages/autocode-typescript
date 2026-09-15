import { JSDOM } from 'jsdom';

// Setup DOM globals
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).customElements = dom.window.customElements;
(globalThis as any).HTMLElement = dom.window.HTMLElement;
(globalThis as any).Element = dom.window.Element;
(globalThis as any).Node = dom.window.Node;
(globalThis as any).Comment = dom.window.Comment;
(globalThis as any).DocumentFragment = dom.window.DocumentFragment;
(globalThis as any).MutationObserver = dom.window.MutationObserver;
(globalThis as any).NodeFilter = dom.window.NodeFilter;

import { performance } from 'perf_hooks';

let AcRuntimeElement: any;
let AcElementRenderer: any;
let AcElementArrayRenderer: any;
let AcReactivity: any;

async function setup() {
  const runtime = await import('../src/ac-runtime');
  AcRuntimeElement = runtime.AcRuntimeElement;
  AcElementRenderer = runtime.AcElementRenderer;
  AcElementArrayRenderer = runtime.AcElementArrayRenderer;
  const reactivity = await import('@autocode-ts/ac-reactivity');
  AcReactivity = reactivity.AcReactivity;
}

function getMemoryUsageMB() {
  if (global.gc) {
    global.gc();
  }
  return (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
}

// ----------------------------------------------------
// Benchmark 1: Component Instance Creation & Destruction
// ----------------------------------------------------
async function benchmarkComponentLifecycle() {
  console.log('\n======================================================');
  console.log('BENCHMARK 1: Component Lifecycle (Create -> Mount -> Update -> Destroy)');
  console.log('======================================================');

  class ItemComponent {
    title = 'Initial Title';
    count = 0;
  }

  class ItemRenderer extends AcElementRenderer {
    private static templateFragment: DocumentFragment | null = null;
    private elRef?: HTMLElement;

    override createRendererNodes(): void {
      if (!ItemRenderer.templateFragment) {
        const template = document.createElement('template');
        template.innerHTML = `<!--${this.rendererStartCommentText}--><div><span ac-ref="title-el"></span></div><!--${this.rendererEndCommentText}-->`;
        ItemRenderer.templateFragment = template.content;
      }
      const fragment = ItemRenderer.templateFragment.cloneNode(true) as DocumentFragment;
      this.nodes = Array.from(fragment.childNodes);
      if (this.nodes.length >= 2) {
        const first = this.nodes[0];
        const last = this.nodes[this.nodes.length - 1];
        if (first.nodeType === Node.COMMENT_NODE) {
          (first as Comment).data = this.rendererStartCommentText;
          this.commentCache.set(this.rendererStartCommentText, first as Comment);
        }
        if (last.nodeType === Node.COMMENT_NODE) {
          (last as Comment).data = this.rendererEndCommentText;
          this.commentCache.set(this.rendererEndCommentText, last as Comment);
        }
      }
      this.elRef = fragment.querySelector('[ac-ref="title-el"]') as HTMLElement;
    }

    private updateTitle(force = false) {
      const ctx = this.rootElement.acRuntimeInstance;
      const newValue = ctx.title;
      if (this.currentBindingValues['title'] !== newValue || force) {
        this.currentBindingValues['title'] = newValue;
        if (this.elRef) {
          this.elRef.textContent = String(newValue ?? '');
        }
      }
    }

    override setInitialState() {
      this.updateTitle(true);
      this.subscribe('title', () => this.updateTitle());
    }
  }

  class ItemCustomElement extends AcRuntimeElement {
    constructor() {
      super();
      this.propertyToListenForChanges = ['title', 'count'];
      this.acRuntimeInstance = this.makeReactive(new ItemComponent());
      this.elementRenderer = new ItemRenderer({
        targetId: 'root',
        rootElement: this,
        context: {},
      });
      this.instanceInputs = ['title'];
      this.instanceOutputs = [];
    }
  }

  if (!customElements.get('bench-item')) {
    customElements.define('bench-item', ItemCustomElement);
  }

  const appContainer = document.getElementById('app')!;
  const scales = [1, 100, 1000, 10000];

  for (const count of scales) {
    const memBefore = getMemoryUsageMB();
    const start = performance.now();

    // 1. Create & Mount
    const elements: ItemCustomElement[] = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('bench-item') as ItemCustomElement;
      appContainer.appendChild(el);
      elements.push(el);
    }

    const mountTime = performance.now() - start;

    // 2. Update
    const updateStart = performance.now();
    for (let i = 0; i < count; i++) {
      elements[i].acRuntimeInstance.title = `Updated Title ${i}`;
    }
    const updateTime = performance.now() - updateStart;

    // 3. Destroy & Unmount
    const destroyStart = performance.now();
    for (let i = 0; i < count; i++) {
      elements[i].remove();
    }
    const destroyTime = performance.now() - destroyStart;
    const totalTime = performance.now() - start;
    const memAfter = getMemoryUsageMB();

    console.log(`\nScale: ${count.toLocaleString()} instances`);
    console.log(`  - Mount:   ${mountTime.toFixed(2)} ms (${(mountTime / count).toFixed(3)} ms/inst)`);
    console.log(`  - Update:  ${updateTime.toFixed(2)} ms (${(updateTime / count).toFixed(3)} ms/inst)`);
    console.log(`  - Destroy: ${destroyTime.toFixed(2)} ms (${(destroyTime / count).toFixed(3)} ms/inst)`);
    console.log(`  - Total:   ${totalTime.toFixed(2)} ms`);
    console.log(`  - Heap:    ${memBefore} MB -> ${memAfter} MB`);
    console.log(`  - App DOM Children: ${appContainer.childNodes.length} (clean: ${appContainer.childNodes.length === 0})`);
  }
}

// ----------------------------------------------------
// Benchmark 2: List Rendering (ac:for) Array Operations
// ----------------------------------------------------
async function benchmarkListRendering() {
  console.log('\n======================================================');
  console.log('BENCHMARK 2: List Rendering (ac:for) Operations');
  console.log('======================================================');

  class ForParentComponent {
    items: { id: number; name: string }[] = [];
  }

  class ForChildRenderer extends AcElementRenderer {
    private static templateFragment: DocumentFragment | null = null;
    private nameEl?: HTMLElement;

    override createRendererNodes(): void {
      if (!ForChildRenderer.templateFragment) {
        const template = document.createElement('template');
        template.innerHTML = `<!--${this.rendererStartCommentText}--><li ac-ref="name-el"></li><!--${this.rendererEndCommentText}-->`;
        ForChildRenderer.templateFragment = template.content;
      }
      const fragment = ForChildRenderer.templateFragment.cloneNode(true) as DocumentFragment;
      this.nodes = Array.from(fragment.childNodes);
      if (this.nodes.length >= 2) {
        const first = this.nodes[0];
        const last = this.nodes[this.nodes.length - 1];
        if (first.nodeType === Node.COMMENT_NODE) {
          (first as Comment).data = this.rendererStartCommentText;
          this.commentCache.set(this.rendererStartCommentText, first as Comment);
        }
        if (last.nodeType === Node.COMMENT_NODE) {
          (last as Comment).data = this.rendererEndCommentText;
          this.commentCache.set(this.rendererEndCommentText, last as Comment);
        }
      }
      this.nameEl = fragment.querySelector('[ac-ref="name-el"]') as HTMLElement;
    }

    private updateItem(force = false) {
      const { item } = this.context || {};
      const val = item ? item.name : '';
      if (this.currentBindingValues['item'] !== val || force) {
        this.currentBindingValues['item'] = val;
        if (this.nameEl) {
          this.nameEl.textContent = String(val ?? '');
        }
      }
    }

    override setInitialState() {
      this.updateItem(true);
    }
  }

  class ForParentRenderer extends AcElementRenderer {
    private static templateFragment: DocumentFragment | null = null;

    override createRendererNodes(): void {
      if (!ForParentRenderer.templateFragment) {
        const template = document.createElement('template');
        template.innerHTML = `<!--${this.rendererStartCommentText}--><ul id="list"><!--ac-for-items-start--><!--ac-for-items-end--></ul><!--${this.rendererEndCommentText}-->`;
        ForParentRenderer.templateFragment = template.content;
      }
      const fragment = ForParentRenderer.templateFragment.cloneNode(true) as DocumentFragment;
      this.nodes = Array.from(fragment.childNodes);
      if (this.nodes.length >= 2) {
        const first = this.nodes[0];
        const last = this.nodes[this.nodes.length - 1];
        if (first.nodeType === Node.COMMENT_NODE) {
          (first as Comment).data = this.rendererStartCommentText;
          this.commentCache.set(this.rendererStartCommentText, first as Comment);
        }
        if (last.nodeType === Node.COMMENT_NODE) {
          (last as Comment).data = this.rendererEndCommentText;
          this.commentCache.set(this.rendererEndCommentText, last as Comment);
        }
      }
    }

    private updateForBinding(force = false) {
      const ctx = this.rootElement.acRuntimeInstance;
      const newValue = ctx.items;
      if (this.childRenderers['for-items'] == undefined) {
        this.childRenderers['for-items'] = new AcElementArrayRenderer({
          targetId: 'ac-for-items',
          startComment: 'ac-for-items-start',
          endComment: 'ac-for-items-end',
          parentRenderer: this,
          context: { ...this.context },
          rootElement: this.rootElement,
          childRendererClass: ForChildRenderer,
        });
        (this.childRenderers['for-items'] as any).initLoop({
          itemVar: 'item',
          indexVar: '__index',
          expression: 'items',
          bindingId: 'for-items',
          items: newValue,
        });
      } else {
        (this.childRenderers['for-items'] as any).refreshLoop({ items: newValue });
      }
    }

    override setInitialState() {
      this.updateForBinding(true);
      this.subscribe('items', () => this.updateForBinding());
    }
  }

  class ForCustomElement extends AcRuntimeElement {
    constructor() {
      super();
      this.propertyToListenForChanges = ['items'];
      this.acRuntimeInstance = this.makeReactive(new ForParentComponent());
      this.elementRenderer = new ForParentRenderer({
        targetId: 'root',
        rootElement: this,
        context: {},
      });
      this.instanceInputs = [];
      this.instanceOutputs = [];
    }
  }

  if (!customElements.get('bench-for')) {
    customElements.define('bench-for', ForCustomElement);
  }

  const appContainer = document.getElementById('app')!;
  const el = document.createElement('bench-for') as ForCustomElement;
  appContainer.appendChild(el);

  const scales = [10, 100, 1000, 5000];

  for (const count of scales) {
    // 1. Initial Fill
    const items = Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i}` }));
    let start = performance.now();
    el.acRuntimeInstance.items = items;
    const fillTime = performance.now() - start;

    // 2. Append 100 items
    start = performance.now();
    for (let i = 0; i < 100; i++) {
      el.acRuntimeInstance.items.push({ id: count + i, name: `Appended ${i}` });
    }
    const appendTime = performance.now() - start;

    // 3. Update 100 items
    start = performance.now();
    for (let i = 0; i < 100; i++) {
      el.acRuntimeInstance.items[i].name = `Updated ${i}`;
    }
    const updateTime = performance.now() - start;

    // 4. Pop 50 items
    start = performance.now();
    for (let i = 0; i < 50; i++) {
      el.acRuntimeInstance.items.pop();
    }
    const popTime = performance.now() - start;

    // 5. Clear items
    start = performance.now();
    el.acRuntimeInstance.items = [];
    const clearTime = performance.now() - start;

    console.log(`\nScale: ${count.toLocaleString()} list items`);
    console.log(`  - Initial Render: ${fillTime.toFixed(2)} ms`);
    console.log(`  - Append 100:     ${appendTime.toFixed(2)} ms`);
    console.log(`  - Update 100:     ${updateTime.toFixed(2)} ms`);
    console.log(`  - Pop 50:         ${popTime.toFixed(2)} ms`);
    console.log(`  - Clear All:      ${clearTime.toFixed(2)} ms`);
  }

  el.remove();
}

// ----------------------------------------------------
// Benchmark 3: Rapid Conditional Toggling (ac:if)
// ----------------------------------------------------
async function benchmarkConditionalToggling() {
  console.log('\n======================================================');
  console.log('BENCHMARK 3: Rapid Conditional Toggling (ac:if)');
  console.log('======================================================');

  class IfComponent {
    visible = true;
  }

  class IfChildRenderer extends AcElementRenderer {
    private static templateFragment: DocumentFragment | null = null;

    override createRendererNodes(): void {
      if (!IfChildRenderer.templateFragment) {
        const template = document.createElement('template');
        template.innerHTML = `<!--${this.rendererStartCommentText}--><div class="conditional-content"><p>Conditional Paragraph</p><span>Extra Text</span></div><!--${this.rendererEndCommentText}-->`;
        IfChildRenderer.templateFragment = template.content;
      }
      const fragment = IfChildRenderer.templateFragment.cloneNode(true) as DocumentFragment;
      this.nodes = Array.from(fragment.childNodes);
      if (this.nodes.length >= 2) {
        const first = this.nodes[0];
        const last = this.nodes[this.nodes.length - 1];
        if (first.nodeType === Node.COMMENT_NODE) {
          (first as Comment).data = this.rendererStartCommentText;
          this.commentCache.set(this.rendererStartCommentText, first as Comment);
        }
        if (last.nodeType === Node.COMMENT_NODE) {
          (last as Comment).data = this.rendererEndCommentText;
          this.commentCache.set(this.rendererEndCommentText, last as Comment);
        }
      }
    }
  }

  class IfParentRenderer extends AcElementRenderer {
    private static templateFragment: DocumentFragment | null = null;

    override createRendererNodes(): void {
      if (!IfParentRenderer.templateFragment) {
        const template = document.createElement('template');
        template.innerHTML = `<!--${this.rendererStartCommentText}--><div><!--ac-if-visible-start--><!--ac-if-visible-end--></div><!--${this.rendererEndCommentText}-->`;
        IfParentRenderer.templateFragment = template.content;
      }
      const fragment = IfParentRenderer.templateFragment.cloneNode(true) as DocumentFragment;
      this.nodes = Array.from(fragment.childNodes);
      if (this.nodes.length >= 2) {
        const first = this.nodes[0];
        const last = this.nodes[this.nodes.length - 1];
        if (first.nodeType === Node.COMMENT_NODE) {
          (first as Comment).data = this.rendererStartCommentText;
          this.commentCache.set(this.rendererStartCommentText, first as Comment);
        }
        if (last.nodeType === Node.COMMENT_NODE) {
          (last as Comment).data = this.rendererEndCommentText;
          this.commentCache.set(this.rendererEndCommentText, last as Comment);
        }
      }
    }

    private updateIf(force = false) {
      const ctx = this.rootElement.acRuntimeInstance;
      const newValue = ctx.visible;
      const oldValue = this.currentBindingValues['if-visible'];
      if (oldValue !== newValue || force) {
        this.currentBindingValues['if-visible'] = newValue;
        this.destroyChildRenderer('ac-if-visible');
        this.removeNodesBetweenComments({ startComment: 'ac-if-visible-start', endComment: 'ac-if-visible-end' });
        if (newValue) {
          const childRenderer = new IfChildRenderer({
            targetId: 'ac-if-visible',
            startComment: 'ac-if-visible-start',
            endComment: 'ac-if-visible-end',
            parentRenderer: this,
            context: { ...this.context },
            rootElement: this.rootElement,
          });
          this.childRenderers['ac-if-visible'] = childRenderer;
          childRenderer.render();
        }
      }
    }

    override setInitialState() {
      this.updateIf(true);
      this.subscribe('visible', () => this.updateIf());
    }
  }

  class IfCustomElement extends AcRuntimeElement {
    constructor() {
      super();
      this.propertyToListenForChanges = ['visible'];
      this.acRuntimeInstance = this.makeReactive(new IfComponent());
      this.elementRenderer = new IfParentRenderer({
        targetId: 'root',
        rootElement: this,
        context: {},
      });
      this.instanceInputs = [];
      this.instanceOutputs = [];
    }
  }

  if (!customElements.get('bench-if')) {
    customElements.define('bench-if', IfCustomElement);
  }

  const appContainer = document.getElementById('app')!;
  const el = document.createElement('bench-if') as IfCustomElement;
  appContainer.appendChild(el);

  const TOGGLES = 2000;
  const start = performance.now();
  for (let i = 0; i < TOGGLES; i++) {
    el.acRuntimeInstance.visible = i % 2 === 0;
  }
  const duration = performance.now() - start;

  console.log(`\nExecuted ${TOGGLES.toLocaleString()} toggles in ${duration.toFixed(2)} ms (${(duration / TOGGLES).toFixed(4)} ms/toggle)`);

  // Final check: set to false and wait for microtask queue to flush
  el.acRuntimeInstance.visible = false;
  await Promise.resolve();
  const remainingChildren = el.querySelectorAll('.conditional-content');
  console.log(`Clean unmount check: ${remainingChildren.length === 0 ? 'PASSED (0 retained nodes)' : 'FAILED'}`);

  el.remove();
}

async function main() {
  await setup();
  await benchmarkComponentLifecycle();
  await benchmarkListRendering();
  await benchmarkConditionalToggling();
  console.log('\n======================================================');
  console.log('ALL BENCHMARKS COMPLETED SUCCESSFULLY');
  console.log('======================================================\n');
}

main().catch(console.error);
