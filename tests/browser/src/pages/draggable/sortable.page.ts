import { AcElement } from "@autocode-ts/ac-runtime";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'draggable-sortable-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcSortable Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto text-center">
        <p class="mb-5">Drag and drop the tags to reorder them with smooth animation.</p>

        <div class="p-4 border rounded bg-white shadow-sm d-inline-block mx-auto">
          <ac-sortable>
            <div class="tag-container d-flex flex-wrap gap-2 justify-content-center">
              <div class="tag-item" ac-draggable-element ac-draggable-target *for="let tag of tags">
                <i class="fa-solid fa-grip-vertical me-2 opacity-50"></i>
                {{tag}}
              </div>
            </div>
          </ac-sortable>
        </div>

        <div class="mt-5 text-muted small">
          <p>Uses <code>&lt;ac-sortable&gt;</code> component which internally manages <code>AcDraggable</code> instances.</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .tag-item {
      padding: 8px 16px;
      background-color: #0d6efd;
      color: white;
      border-radius: 50px;
      cursor: grab;
      user-select: none;
      transition: background-color 0.2s, transform 0.2s;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .tag-item:active {
      cursor: grabbing;
      transform: scale(0.95);
    }
    .tag-item:hover {
      background-color: #0b5ed7;
    }
  `
})
export class SortablePage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Sortable Actions', isHeader: true }];

  tags = ['Design', 'Development', 'Testing', 'Deployment', 'Maintenance', 'Support', 'Quality Assurance'];
}
