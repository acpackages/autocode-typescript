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

  it('renders nested ac:for loops into their respective parent loop items without leaking into item 0', () => {
    const groupsStart = document.createComment('for-groups-start');
    const groupsEnd = document.createComment('for-groups-end');
    host.appendChild(groupsStart);
    host.appendChild(groupsEnd);

    class ProductItemRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(
          `<span class="prod">${this.context.group.name}: ${this.context.prod}</span>`
        );
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

    class GroupItemRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`
          <div class="group-box">
            <h4 class="group-title">${this.context.group.name}</h4>
            <!--prod-for-start--><!--prod-for-end-->
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
        this.updateProdLoop();
      }

      updateProdLoop() {
        if (!this.childRenderers['prod-for']) {
          const innerArray = new AcElementArrayRenderer({
            targetId: 'prod-for',
            startComment: 'prod-for-start',
            endComment: 'prod-for-end',
            parentRenderer: this,
            context: { ...this.context },
            rootElement: this.rootElement,
            childRendererClass: ProductItemRenderer,
          });
          this.childRenderers['prod-for'] = innerArray;
          innerArray.initLoop({
            itemVar: 'prod',
            indexVar: 'j',
            expression: 'group.products',
            bindingId: 'b_prod',
            items: this.context.group.products,
          });
        } else {
          const innerArray = this.childRenderers['prod-for'] as AcElementArrayRenderer;
          innerArray.context = { ...this.context };
          innerArray.refreshLoop({
            items: this.context.group.products,
            context: { ...this.context },
          });
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

    const outerArray = new AcElementArrayRenderer({
      targetId: 'for-groups',
      startComment: 'for-groups-start',
      endComment: 'for-groups-end',
      parentRenderer: rootRenderer,
      context: {},
      rootElement,
      childRendererClass: GroupItemRenderer,
    });

    outerArray.initLoop({
      itemVar: 'group',
      indexVar: 'i',
      expression: 'groups',
      bindingId: 'b_groups',
      items: [
        { name: 'Group A', products: ['A1', 'A2'] },
        { name: 'Group B', products: ['B1', 'B2', 'B3'] },
        { name: 'Group C', products: ['C1'] },
      ],
    });

    const groupBoxes = host.querySelectorAll('.group-box');
    expect(groupBoxes.length).toBe(3);

    // Group A (Item 0)
    const prodsA = groupBoxes[0].querySelectorAll('.prod');
    expect(prodsA.length).toBe(2);
    expect(prodsA[0].textContent).toBe('Group A: A1');
    expect(prodsA[1].textContent).toBe('Group A: A2');

    // Group B (Item 1) - Crucial: Must render inside Group B, NOT inside Group A!
    const prodsB = groupBoxes[1].querySelectorAll('.prod');
    expect(prodsB.length).toBe(3);
    expect(prodsB[0].textContent).toBe('Group B: B1');
    expect(prodsB[1].textContent).toBe('Group B: B2');
    expect(prodsB[2].textContent).toBe('Group B: B3');

    // Group C (Item 2)
    const prodsC = groupBoxes[2].querySelectorAll('.prod');
    expect(prodsC.length).toBe(1);
    expect(prodsC[0].textContent).toBe('Group C: C1');

    // Verify Group A did NOT receive Group B or Group C's elements
    expect(groupBoxes[0].querySelectorAll('.prod').length).toBe(2);

    // Refresh the inner loop of Group B
    const groupBRenderer = (outerArray as any).childRenderers[(outerArray as any).loopItemOrder[1]];
    expect(groupBRenderer).toBeDefined();
    groupBRenderer.context.group.products = ['B_Updated_1'];
    groupBRenderer.updateProdLoop();

    const prodsBUpdated = groupBoxes[1].querySelectorAll('.prod');
    expect(prodsBUpdated.length).toBe(1);
    expect(prodsBUpdated[0].textContent).toBe('Group B: B_Updated_1');
    // Group A still intact
    expect(groupBoxes[0].querySelectorAll('.prod').length).toBe(2);
  });

  it('removes and destroys element, renderer, child renderers and nested custom elements on destroy', () => {
    let childDestroyed = false;

    class MockChildElement extends AcRuntimeElement {
      override connectedCallback() {}
    }
    if (!customElements.get('mock-child-el')) {
      customElements.define('mock-child-el', MockChildElement);
    }

    const childEl = document.createElement('mock-child-el') as any;
    childEl.acRuntimeInstance = {
      acOnDestroy: () => {
        childDestroyed = true;
      },
    };

    class ItemWithChildRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml('<div class="item-card"><span>Card</span></div>');
        this.nodes[0].appendChild(childEl);
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

    const startComment = document.createComment('item-start');
    const endComment = document.createComment('item-end');
    host.appendChild(startComment);
    host.appendChild(endComment);

    const rootRenderer = new AcElementRenderer({
      targetId: 'root',
      rootElement,
      context: {},
      isRoot: true,
    });
    rootRenderer.nodes = [host];

    const itemRenderer = new ItemWithChildRenderer({
      targetId: 'item',
      startComment: 'item-start',
      endComment: 'item-end',
      parentRenderer: rootRenderer,
      context: {},
      rootElement,
    });
    rootRenderer.childRenderers['item'] = itemRenderer;
    itemRenderer.render();

    expect(host.querySelector('.item-card')).not.toBeNull();
    expect(host.querySelector('mock-child-el')).not.toBeNull();

    // Destroy item renderer
    itemRenderer.destroy();

    // Nodes between comments should be removed from DOM
    expect(host.querySelector('.item-card')).toBeNull();
    expect(host.querySelector('mock-child-el')).toBeNull();
    // Nested custom element's acOnDestroy should have been invoked
    expect(childDestroyed).toBe(true);

    // Destroy root element
    let rootDestroyed = false;
    rootElement.acRuntimeInstance.acOnDestroy = () => {
      rootDestroyed = true;
    };
    rootElement.elementRenderer = rootRenderer;
    rootElement.destroy();

    expect(rootDestroyed).toBe(true);
    expect(rootElement.parentNode).toBeNull();
  });

  it('renders nested previewRows (tbody > tr > td) and columnMappingRows (select > option) with complete isolation and correct context', () => {
    // ─── Part 1: previewRows table test ───
    const tableHost = document.createElement('div');
    host.appendChild(tableHost);
    tableHost.innerHTML = `
      <table>
        <!--preview-for-start--><!--preview-for-end-->
      </table>
    `;

    // Cell renderer for "cell of row"
    class CellRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`<td class="cell">${this.context.cell}</td>`);
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

    // Row renderer for "row of previewRows"
    class PreviewRowRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`
          <tbody>
            <tr>
              <!--cell-for-start--><!--cell-for-end-->
            </tr>
          </tbody>
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
        const innerArray = new AcElementArrayRenderer({
          targetId: 'cell-for',
          startComment: 'cell-for-start',
          endComment: 'cell-for-end',
          parentRenderer: this,
          context: { ...this.context },
          rootElement: this.rootElement,
          childRendererClass: CellRenderer,
        });
        this.childRenderers['cell-for'] = innerArray;
        innerArray.initLoop({
          itemVar: 'cell',
          indexVar: '__index',
          expression: 'row',
          bindingId: 'b_cell',
          items: this.context.row,
        });
      }
    }

    const rootRenderer = new AcElementRenderer({
      targetId: 'root',
      rootElement,
      context: {},
      isRoot: true,
    });
    rootRenderer.nodes = [tableHost];

    const previewArrayRenderer = new AcElementArrayRenderer({
      targetId: 'preview-for',
      startComment: 'preview-for-start',
      endComment: 'preview-for-end',
      parentRenderer: rootRenderer,
      context: {},
      rootElement,
      childRendererClass: PreviewRowRenderer,
    });

    const previewData = [
      ['R0-C0', 'R0-C1', 'R0-C2'],
      ['R1-C0', 'R1-C1', 'R1-C2'],
      ['R2-C0', 'R2-C1', 'R2-C2'],
    ];

    previewArrayRenderer.initLoop({
      itemVar: 'row',
      indexVar: '__index',
      expression: 'previewRows',
      bindingId: 'b_preview',
      items: previewData,
    });

    const tbodies = tableHost.querySelectorAll('tbody');
    expect(tbodies.length).toBe(3);

    for (let r = 0; r < 3; r++) {
      const cells = tbodies[r].querySelectorAll('td.cell');
      expect(cells.length).toBe(3);
      expect(cells[0].textContent).toBe(`R${r}-C0`);
      expect(cells[1].textContent).toBe(`R${r}-C1`);
      expect(cells[2].textContent).toBe(`R${r}-C2`);
    }

    // ─── Part 2: columnMappingRows with select and option test ───
    const mappingHost = document.createElement('div');
    host.appendChild(mappingHost);
    mappingHost.innerHTML = `
      <div class="mapping-container">
        <!--mapping-for-start--><!--mapping-for-end-->
      </div>
    `;

    // Option renderer for "field of row.availableFields"
    class OptionRenderer extends AcElementRenderer {
      override createRendererNodes() {
        const selected = this.context.row.selectedField === this.context.field.key;
        this.nodes = this.createNodesFromHtml(
          `<option value="${this.context.field.key}" ${selected ? 'selected' : ''}>${this.context.field.label}</option>`
        );
        if (selected) {
          (this.nodes.find(n => n.nodeName === 'OPTION') as HTMLOptionElement).selected = true;
        }
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

    // Mapping row renderer for "row of columnMappingRows"
    class MappingRowRenderer extends AcElementRenderer {
      override createRendererNodes() {
        this.nodes = this.createNodesFromHtml(`
          <div class="mtl-mapping-row">
            <span class="col-name">${this.context.row.column}</span>
            <select class="form-select">
              <!--opt-for-start--><!--opt-for-end-->
            </select>
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
        const innerArray = new AcElementArrayRenderer({
          targetId: 'opt-for',
          startComment: 'opt-for-start',
          endComment: 'opt-for-end',
          parentRenderer: this,
          context: { ...this.context },
          rootElement: this.rootElement,
          childRendererClass: OptionRenderer,
        });
        this.childRenderers['opt-for'] = innerArray;
        innerArray.initLoop({
          itemVar: 'field',
          indexVar: '__index',
          expression: 'row.availableFields',
          bindingId: 'b_opts',
          items: this.context.row.availableFields,
        });
      }
    }

    const mappingRootRenderer = new AcElementRenderer({
      targetId: 'mapping-root',
      rootElement,
      context: {},
      isRoot: true,
    });
    mappingRootRenderer.nodes = [mappingHost];

    const mappingArrayRenderer = new AcElementArrayRenderer({
      targetId: 'mapping-for',
      startComment: 'mapping-for-start',
      endComment: 'mapping-for-end',
      parentRenderer: mappingRootRenderer,
      context: {},
      rootElement,
      childRendererClass: MappingRowRenderer,
    });

    const mappingData = [
      {
        column: 'Date',
        selectedField: 'entry_time',
        availableFields: [
          { key: '__skip__', label: 'Skip' },
          { key: 'entry_time', label: 'Transaction Date' },
          { key: 'amount', label: 'Amount' },
        ],
      },
      {
        column: 'Description',
        selectedField: 'desc',
        availableFields: [
          { key: '__skip__', label: 'Skip' },
          { key: 'desc', label: 'Description' },
          { key: 'amount', label: 'Amount' },
        ],
      },
      {
        column: 'Amount',
        selectedField: 'amount',
        availableFields: [
          { key: '__skip__', label: 'Skip' },
          { key: 'amount', label: 'Amount' },
        ],
      },
    ];

    mappingArrayRenderer.initLoop({
      itemVar: 'row',
      indexVar: '__index',
      expression: 'columnMappingRows',
      bindingId: 'b_map',
      items: mappingData,
    });

    const mappingRows = mappingHost.querySelectorAll('.mtl-mapping-row');
    expect(mappingRows.length).toBe(3);

    // Row 0: Date
    expect(mappingRows[0].querySelector('.col-name')?.textContent).toBe('Date');
    const opts0 = mappingRows[0].querySelectorAll('select option');
    expect(opts0.length).toBe(3);
    expect((mappingRows[0].querySelector('select') as HTMLSelectElement).value).toBe('entry_time');

    // Row 1: Description
    expect(mappingRows[1].querySelector('.col-name')?.textContent).toBe('Description');
    const opts1 = mappingRows[1].querySelectorAll('select option');
    expect(opts1.length).toBe(3);
    expect((mappingRows[1].querySelector('select') as HTMLSelectElement).value).toBe('desc');

    // Row 2: Amount
    expect(mappingRows[2].querySelector('.col-name')?.textContent).toBe('Amount');
    const opts2 = mappingRows[2].querySelectorAll('select option');
    expect(opts2.length).toBe(2);
    expect((mappingRows[2].querySelector('select') as HTMLSelectElement).value).toBe('amount');

    // Crucial: opts0 should NOT have options from Row 1 or Row 2
    expect(opts0.length).toBe(3);
  });

  it('retains style element permanently in head across element lifecycles (Method 5)', () => {
    const selector = 'test-multi-style-el';
    const styles = `${selector} { color: blue; }`;
    let stylesInjected = false;

    class TestStyledElement extends AcRuntimeElement {
      constructor() {
        super();
        this.acRuntimeInstance = {};
      }
      override connectedCallback() {
        super.connectedCallback();
        if (!stylesInjected) {
          let styleEl = document.head.querySelector(`style[data-ac-style="${selector}"]`);
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.setAttribute('data-ac-style', selector);
            styleEl.innerHTML = styles;
            document.head.appendChild(styleEl);
          }
          stylesInjected = true;
        }
      }
    }

    if (!customElements.get(selector)) {
      customElements.define(selector, TestStyledElement);
    }

    // Create 2 instances
    const el1 = document.createElement(selector) as TestStyledElement;
    const el2 = document.createElement(selector) as TestStyledElement;
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    // Style element should exist in head
    const styleElsBefore = document.head.querySelectorAll(`style[data-ac-style="${selector}"]`);
    expect(styleElsBefore.length).toBe(1);

    // Destroy first element (el2 is still in DOM)
    el1.destroy();
    expect(document.body.contains(el1)).toBe(false);
    expect(document.body.contains(el2)).toBe(true);

    // Style element MUST STILL BE IN HEAD
    expect(document.head.querySelector(`style[data-ac-style="${selector}"]`)).not.toBeNull();

    // Destroy second element
    el2.destroy();
    expect(document.body.contains(el2)).toBe(false);

    // In Method 5, style element remains in head permanently (no layout thrashing, no premature removal)
    expect(document.head.querySelector(`style[data-ac-style="${selector}"]`)).not.toBeNull();

    // Reconnecting a new element uses the existing style without adding duplicate tags
    const el3 = document.createElement(selector) as TestStyledElement;
    document.body.appendChild(el3);
    const styleElsAfter = document.head.querySelectorAll(`style[data-ac-style="${selector}"]`);
    expect(styleElsAfter.length).toBe(1);
    el3.destroy();
  });
});
