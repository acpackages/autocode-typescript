import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcTabs, AcTabsAttributeName, AcTabsCssClassName } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'tabs-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcTabs Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates <code>AcTabs</code> behaviors in AcRuntime.</p>

        <div class="mb-5 border rounded p-3 bg-light">
          <h5 class="mb-2">Programmatic Tabs</h5>
          <ac-tabs #tabs>
            <div class="nav nav-tabs" role="tablist">
              <button class="nav-link" type="button" ac-tab ac-tab-target="#pane-a">Tab A</button>
              <button class="nav-link" type="button" ac-tab ac-tab-target="#pane-b" #tabB>Tab B</button>
              <button class="nav-link" type="button" ac-tab ac-tab-target="#pane-c">Tab C</button>
            </div>

            <div class="tab-content border border-top-0 p-3 bg-white">
              <div id="pane-a" class="ac-tab-pane" ac-tab-pane role="tabpanel">
                <p>Content for Pane A.</p>
              </div>
              <div id="pane-b" class="ac-tab-pane" ac-tab-pane role="tabpanel">
                <p>Content for Pane B.</p>
              </div>
              <div id="pane-c" class="ac-tab-pane" ac-tab-pane role="tabpanel">
                <p>Content for Pane C.</p>
              </div>
            </div>
          </ac-tabs>

          <div class="d-flex gap-2 mt-3 flex-wrap">
            <button type="button" class="btn btn-outline-primary btn-sm" (click)="tabs.prev()">Prev</button>
            <button type="button" class="btn btn-outline-primary btn-sm" (click)="tabs.next()">Next</button>
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="tabs.show({target:'#pane-a'})">Show A</button>
            <button type="button" class="btn btn-outline-secondary btn-sm" (click)="tabs.show({target:'#pane-b'})">Show B</button>
            <button type="button" class="btn btn-outline-danger btn-sm" (click)="tabs.enable({target:tabB, enable:false})">Disable B</button>
            <button type="button" class="btn btn-outline-success btn-sm" (click)="tabs.enable({target:tabB, enable:true})">Enable B</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TabsPage {
  @AcViewChild('#tabs') tabs!: AcTabs;
  @AcViewChild('#tabB') tabB!: HTMLElement;

  dropdownItems: IAppMenuItem[] = [{ label: 'Tabs Actions', isHeader: true }];
}
