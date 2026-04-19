import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcWindowTabs } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'tabs-window-page',
  template: `
    <div class="app-page h-100 d-flex flex-column bg-dark">
      <app-header
        [title]="'Window Tabs (VS Code Style)'"
        [dropdownItems]="dropdownItems"
        class="bg-dark border-bottom border-secondary text-white"
      ></app-header>
      
      <div class="p-0 flex-fill d-flex flex-column overflow-hidden">
        <ac-window-tabs #tabs class="w-100"></ac-window-tabs>
        
        <div class="flex-fill d-flex align-items-center justify-content-center text-secondary opacity-50 bg-black">
           <div class="text-center">
              <i class="fa-solid fa-code display-1 mb-4"></i>
              <h3>Editor Workspace</h3>
              <p>Active Tab ID: <span class="text-info fw-bold">{{activeTabId || 'None'}}</span></p>
           </div>
        </div>

        <div class="p-3 bg-dark border-top border-secondary d-flex gap-2 justify-content-center">
           <button class="btn btn-sm btn-outline-primary" (click)="addTab()"><i class="fa-solid fa-plus me-1"></i> Add File</button>
           <button class="btn btn-sm btn-outline-warning" (click)="updateTitle()"><i class="fa-solid fa-pen me-1"></i> Update Title</button>
           <button class="btn btn-sm btn-outline-danger" (click)="removeActive()"><i class="fa-solid fa-xmark me-1"></i> Close Active</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { --ac-tabs-bg: #252526; }
    ac-window-tabs { height: 35px; }
  `
})
export class TabsWindowPage {
  @AcViewChild('#tabs') tabs!: AcWindowTabs;
  activeTabId: string | null = null;

  dropdownItems: IAppMenuItem[] = [{ label: 'Editor Themes', isHeader: true }];

  acOnInit() {
    this.tabs.setTabs({
      tabs: [
        { id: '1', title: 'main.ts', icon: 'fa-solid fa-file-code', closeable: true },
        { id: '2', title: 'styles.scss', icon: 'fa-solid fa-file-lines', closeable: true },
        { id: '3', title: 'index.html', icon: 'fa-solid fa-file-code', closeable: false }
      ]
    });

    this.tabs.addEventListener('tab-change', (e: any) => {
      this.activeTabId = e.detail.id;
    });

    this.activeTabId = this.tabs.activeIdGetter;
  }

  addTab() {
    const id = Math.random().toString(36).substring(7);
    this.tabs.addTab({
      tab: { id, title: `New_${id}.ts`, icon: 'fa-solid fa-file-plus', closeable: true }
    });
  }

  updateTitle() {
    const active = this.tabs.activeTab;
    if (active) {
      active.title = `Modified_${active.id}.ts`;
    }
  }

  removeActive() {
    const id = this.tabs.activeIdGetter;
    if (id) this.tabs.removeTab({ id });
  }
}
