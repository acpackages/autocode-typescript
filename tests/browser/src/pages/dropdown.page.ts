import { AcElement } from "@autocode-ts/ac-runtime";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'dropdown-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcDropdown Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates <code>AcDropdown</code> behavior for various placements and triggers.</p>

        <div class="row g-4">
          <div class="col-md-3 col-sm-6 text-center">
            <h5>Bottom</h5>
            <ac-dropdown placement="bottom">
              <button class="btn btn-primary" ac-dropdown-trigger>Toggle Bottom</button>
              <div class="card shadow dropdown-menu-test" ac-dropdown-target>
                <div class="list-group list-group-flush">
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Action 1</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Action 2</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Action 3</a>
                </div>
              </div>
            </ac-dropdown>
          </div>

          <div class="col-md-3 col-sm-6 text-center">
            <h5>Top</h5>
            <ac-dropdown placement="top">
              <button class="btn btn-primary" ac-dropdown-trigger>Toggle Top</button>
              <div class="card shadow dropdown-menu-test" ac-dropdown-target>
                <div class="list-group list-group-flush">
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Item A</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Item B</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Item C</a>
                </div>
              </div>
            </ac-dropdown>
          </div>

          <div class="col-md-3 col-sm-6 text-center">
            <h5>Left</h5>
            <ac-dropdown placement="left">
              <button class="btn btn-primary" ac-dropdown-trigger>Toggle Left</button>
              <div class="card shadow dropdown-menu-test" ac-dropdown-target>
                <div class="list-group list-group-flush" style="min-width: 150px;">
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Option X</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Option Y</a>
                </div>
              </div>
            </ac-dropdown>
          </div>

          <div class="col-md-3 col-sm-6 text-center">
            <h5>Right</h5>
            <ac-dropdown placement="right">
              <button class="btn btn-primary" ac-dropdown-trigger>Toggle Right</button>
              <div class="card shadow dropdown-menu-test" ac-dropdown-target>
                <div class="list-group list-group-flush" style="min-width: 150px;">
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Alpha</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Beta</a>
                </div>
              </div>
            </ac-dropdown>
          </div>
        </div>

        <hr class="my-5">

        <div class="row">
          <div class="col-md-6 text-center">
            <h5>Hover Trigger</h5>
            <ac-dropdown placement="bottom" trigger="hover">
              <button class="btn btn-outline-primary" ac-dropdown-trigger>Hover Me</button>
              <div class="card shadow dropdown-menu-test" ac-dropdown-target>
                <div class="list-group list-group-flush">
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Hover Item 1</a>
                  <a href="#" class="list-group-item list-group-item-action" ac-dropdown-item>Hover Item 2</a>
                </div>
              </div>
            </ac-dropdown>
          </div>

          <div class="col-md-6 text-center">
            <h5>Multi-level (Conceptual)</h5>
            <ac-dropdown placement="bottom">
              <button class="btn btn-dark" ac-dropdown-trigger>Options</button>
              <div class="card shadow dropdown-menu-test" ac-dropdown-target>
                 <div class="list-group list-group-flush">
                    <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" ac-dropdown-item>
                      Settings <i class="fa-solid fa-gear small opacity-50"></i>
                    </a>
                    <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-danger" ac-dropdown-item>
                      Logout <i class="fa-solid fa-power-off small opacity-50"></i>
                    </a>
                 </div>
              </div>
            </ac-dropdown>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .dropdown-menu-test {
      min-width: 180px;
      z-index: 1000;
    }
    .list-group-item {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }
  `
})
export class DropdownPage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Dropdown View', isHeader: true }];
}
