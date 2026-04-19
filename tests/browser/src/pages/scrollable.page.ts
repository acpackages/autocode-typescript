import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcScrollable } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'scrollable-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcScrollable : Virtual Scroll'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto d-flex flex-column">
        <p class="text-muted small">Efficiently rendering 10,000+ items with variable heights using virtual scrolling.</p>

        <div class="row flex-fill overflow-hidden g-4">
          <div class="col-md-8 d-flex flex-column">
             <div class="scroll-container border rounded bg-white shadow-sm flex-fill overflow-auto" #container></div>
          </div>

          <div class="col-md-4">
             <div class="card shadow-sm border-0">
                <div class="card-body">
                   <h6 class="fw-bold mb-3">Programmatic Control</h6>
                   <div class="d-grid gap-2">
                      <button class="btn btn-primary" (click)="scrollToIndex(0)">Scroll to First</button>
                      <button class="btn btn-primary" (click)="scrollToIndex(500)">Scroll to Index 500</button>
                      <button class="btn btn-primary" (click)="scrollToIndex(9999)">Scroll to Last</button>
                      <hr>
                      <button class="btn btn-success" (click)="addItem()">Add Random Item</button>
                      <button class="btn btn-outline-danger" (click)="clearItems()">Clear All</button>
                   </div>
                   <div class="mt-3 p-3 bg-light rounded border text-center">
                      <div class="small text-muted">Total Items</div>
                      <div class="fs-4 fw-bold text-primary">{{itemsCount}}</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScrollablePage {
  @AcViewChild('#container') container!: HTMLElement;
  acScrollable!: AcScrollable;
  itemsCount = 10000;

  dropdownItems: IAppMenuItem[] = [{ label: 'Scroll Config', isHeader: true }];

  acOnInit() {
    this.acScrollable = new AcScrollable({
      element: this.container,
      options: {
        bufferCount: 10,
        itemTemplate: (item: any, index: number) => {
          const el = document.createElement('div');
          el.className = 'p-3 border-bottom d-flex align-items-center justify-content-between transition-all';
          el.style.height = `${item.height}px`;
          el.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f8f9fa';
          
          el.innerHTML = `
            <div>
               <span class="badge bg-secondary-subtle text-secondary border me-2">${index}</span>
               <span class="fw-bold">${item.text}</span>
            </div>
            <div class="text-muted small">${item.height}px</div>
          `;
          return el;
        }
      }
    });

    this.generateItems();
  }

  generateItems() {
    const items = [];
    for (let i = 0; i < this.itemsCount; i++) {
      items.push({
        text: `Virtual Item Block ${i}`,
        height: 60 + Math.floor(Math.random() * 80)
      });
    }
    this.acScrollable.setItems(items);
  }

  scrollToIndex(index: number) {
    this.acScrollable.scrollTo({ index });
  }

  addItem() {
    this.acScrollable.addItem({
      text: `Newly Appended Item`,
      height: 100
    });
    this.itemsCount++;
  }

  clearItems() {
    this.acScrollable.setItems([]);
    this.itemsCount = 0;
  }
}
