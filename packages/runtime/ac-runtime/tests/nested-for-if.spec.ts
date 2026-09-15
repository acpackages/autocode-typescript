// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  AcRuntimeElement,
  AcElementRenderer,
  AcElementArrayRenderer
} from '../src/ac-runtime';

describe('Nested ac:for and ac:if rendering isolation', () => {
  let host: HTMLElement;
  let rootElement: any;

  class MockDashboardElement extends AcRuntimeElement {
    override connectedCallback() {
      // Manual test driver - no-op automatic lifecycle
    }
  }
  if (!customElements.get('mock-dashboard')) {
    customElements.define('mock-dashboard', MockDashboardElement);
  }

  beforeEach(() => {
    document.body.innerHTML = '';
    rootElement = document.createElement('mock-dashboard') as MockDashboardElement;
    rootElement.acRuntimeInstance = {};
    document.body.appendChild(rootElement);

    host = document.createElement('div');
    host.id = 'host';
    rootElement.appendChild(host);
  });

  it('renders nested conditionals into their respective loop items without leaking into item 0', () => {
    // Root template has an array renderer for loop:
    // <!--for-start--><!--for-end-->
    const forStart = document.createComment('for-start');
    const forEnd = document.createComment('for-end');
    host.appendChild(forStart);
    host.appendChild(forEnd);

    // If renderer class for "isInt"
    class IsIntIfRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`<h5 class="int-val">${this.context.s.value}</h5>`);
        if (this.parentRenderer && this.startComment && this.endComment) {
          this.parentRenderer.appendNodesBetweenComments({
            startComment: this.startComment,
            endComment: this.endComment,
            nodes: this.nodes,
          });
        }
      }
      override render() {
        this.createRendererNodes();
      }
    }

    // If renderer class for "isCurrency"
    class IsCurrencyIfRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`<h5 class="currency-val">$${this.context.s.value}</h5>`);
        if (this.parentRenderer && this.startComment && this.endComment) {
          this.parentRenderer.appendNodesBetweenComments({
            startComment: this.startComment,
            endComment: this.endComment,
            nodes: this.nodes,
          });
        }
      }
      override render() {
        this.createRendererNodes();
      }
    }

    // Loop Item Renderer Class (shared compiled class for each item in loop)
    // Every item in the loop has identical compiled comments:
    // <!--if-int-start--><!--if-int-end-->
    // <!--if-curr-start--><!--if-curr-end-->
    class StatItemRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`
          <div class="card">
            <span class="label">${this.context.s.label}</span>
            <!--if-int-start--><!--if-int-end-->
            <!--if-curr-start--><!--if-curr-end-->
          </div>
        `);
        if (this.parentRenderer && this.startComment && this.endComment) {
          this.parentRenderer.appendNodesBetweenComments({
            startComment: this.startComment,
            endComment: this.endComment,
            nodes: this.nodes,
          });
        }
      }

      override render() {
        this.createRendererNodes();
        this.updateConditionals();
      }

      updateConditionals() {
        const s = this.context.s;

        // Handle isInt
        this.destroyChildRenderer('if-int');
        this.removeNodesBetweenComments({ startComment: 'if-int-start', endComment: 'if-int-end' });
        if (s.isInt) {
          const child = new IsIntIfRenderer({
            targetId: 'if-int',
            rootElement: this.rootElement,
            context: this.context,
            startComment: 'if-int-start',
            endComment: 'if-int-end',
            parentRenderer: this,
          });
          this.childRenderers['if-int'] = child;
          child.render();
        }

        // Handle isCurrency
        this.destroyChildRenderer('if-curr');
        this.removeNodesBetweenComments({ startComment: 'if-curr-start', endComment: 'if-curr-end' });
        if (s.isCurrency) {
          const child = new IsCurrencyIfRenderer({
            targetId: 'if-curr',
            rootElement: this.rootElement,
            context: this.context,
            startComment: 'if-curr-start',
            endComment: 'if-curr-end',
            parentRenderer: this,
          });
          this.childRenderers['if-curr'] = child;
          child.render();
        }
      }
    }

    // Root element renderer
    const rootRenderer = new AcElementRenderer({
      targetId: 'root',
      rootElement,
      context: {},
      isRoot: true,
    });
    rootRenderer.nodes = [host];

    // Array renderer for the loop
    const arrayRenderer = new AcElementArrayRenderer({
      targetId: 'for',
      startComment: 'for-start',
      endComment: 'for-end',
      parentRenderer: rootRenderer,
      context: {},
      rootElement,
      childRendererClass: StatItemRenderer,
    });

    const dashboardStats = [
      { label: 'Customers', value: 4733, isInt: true, isCurrency: false },
      { label: 'Revenue', value: 3717174.52, isInt: false, isCurrency: true },
      { label: 'Products', value: 50, isInt: true, isCurrency: false },
    ];

    arrayRenderer.initLoop({
      itemVar: 's',
      indexVar: 'i',
      expression: 'dashboardStats',
      bindingId: 'b_stats',
      items: dashboardStats,
    });

    const cards = host.querySelectorAll('.card');
    expect(cards.length).toBe(3);

    // Card 0: Customers (isInt = true, isCurrency = false)
    expect(cards[0].querySelector('.label')?.textContent).toBe('Customers');
    expect(cards[0].querySelector('.int-val')?.textContent).toBe('4733');
    expect(cards[0].querySelector('.currency-val')).toBeNull();

    // Card 1: Revenue (isInt = false, isCurrency = true)
    // CRUCIAL: It must have its OWN currency-val and NO int-val,
    // and its currency-val must NOT have leaked into cards[0]!
    expect(cards[1].querySelector('.label')?.textContent).toBe('Revenue');
    expect(cards[1].querySelector('.currency-val')?.textContent).toBe('$3717174.52');
    expect(cards[1].querySelector('.int-val')).toBeNull();

    // Card 2: Products (isInt = true, isCurrency = false)
    expect(cards[2].querySelector('.label')?.textContent).toBe('Products');
    expect(cards[2].querySelector('.int-val')?.textContent).toBe('50');
    expect(cards[2].querySelector('.currency-val')).toBeNull();

    // Verify Card 0 did NOT receive Card 1's currency-val (the exact bug reported!)
    expect(cards[0].querySelectorAll('h5').length).toBe(1);
    expect(cards[1].querySelectorAll('h5').length).toBe(1);
    expect(cards[2].querySelectorAll('h5').length).toBe(1);
  });

  it('updates nested conditional elements independently when items change or loop refreshes', () => {
    const forStart = document.createComment('for-start');
    const forEnd = document.createComment('for-end');
    host.appendChild(forStart);
    host.appendChild(forEnd);

    class CondIfRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`<div class="badge">${this.context.item.tag}</div>`);
        if (this.parentRenderer && this.startComment && this.endComment) {
          this.parentRenderer.appendNodesBetweenComments({
            startComment: this.startComment,
            endComment: this.endComment,
            nodes: this.nodes,
          });
        }
      }
      override render() {
        this.createRendererNodes();
      }
    }

    class ListItemRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`
          <div class="row-item">
            <span>${this.context.item.name}</span>
            <!--tag-if-start--><!--tag-if-end-->
          </div>
        `);
        if (this.parentRenderer && this.startComment && this.endComment) {
          this.parentRenderer.appendNodesBetweenComments({
            startComment: this.startComment,
            endComment: this.endComment,
            nodes: this.nodes,
          });
        }
      }

      override render() {
        this.createRendererNodes();
        this.updateCond();
      }

      updateCond() {
        this.destroyChildRenderer('tag-if');
        this.removeNodesBetweenComments({ startComment: 'tag-if-start', endComment: 'tag-if-end' });
        if (this.context.item.showTag) {
          const child = new CondIfRenderer({
            targetId: 'tag-if',
            rootElement: this.rootElement,
            context: this.context,
            startComment: 'tag-if-start',
            endComment: 'tag-if-end',
            parentRenderer: this,
          });
          this.childRenderers['tag-if'] = child;
          child.render();
        }
      }
    }

    const rootRenderer = new AcElementRenderer({
      targetId: 'root',
      rootElement,
      context: {},
      isRoot: true,
    });
    rootRenderer.nodes = [host];

    const arrayRenderer = new AcElementArrayRenderer({
      targetId: 'for',
      startComment: 'for-start',
      endComment: 'for-end',
      parentRenderer: rootRenderer,
      context: {},
      rootElement,
      childRendererClass: ListItemRenderer,
    });

    arrayRenderer.initLoop({
      itemVar: 'item',
      indexVar: 'i',
      expression: 'items',
      bindingId: 'b_items',
      items: [
        { name: 'Item 1', showTag: false, tag: 'T1' },
        { name: 'Item 2', showTag: true, tag: 'T2' },
      ],
    });

    let rowItems = host.querySelectorAll('.row-item');
    expect(rowItems.length).toBe(2);
    expect(rowItems[0].querySelector('.badge')).toBeNull();
    expect(rowItems[1].querySelector('.badge')?.textContent).toBe('T2');

    // Refresh loop with reversed tags
    arrayRenderer.refreshLoop({
      items: [
        { name: 'Item 1', showTag: true, tag: 'T1' },
        { name: 'Item 2', showTag: false, tag: 'T2' },
      ],
    });

    rowItems = host.querySelectorAll('.row-item');
    expect(rowItems.length).toBe(2);
    expect(rowItems[0].querySelector('.badge')?.textContent).toBe('T1');
    expect(rowItems[1].querySelector('.badge')).toBeNull();
  });
});
