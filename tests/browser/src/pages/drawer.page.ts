import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AcDrawer } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'drawer-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcDrawer Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates <code>AcDrawer</code> behavior for all 4 supported placements.</p>

        <div class="row g-4">
          <div class="col-md-6" *for="let side of sides">
            <div class="card h-100 shadow-sm border p-3 bg-light">
              <h5 class="capitalize">{{side}} Drawer</h5>
              <p class="text-muted small">Opens from the {{side}} side with smooth animation.</p>
              <button class="btn btn-primary" (click)="openDrawer(side)">Open {{side}} Drawer</button>
            </div>
          </div>
        </div>

        <!-- Drawers -->
        <ac-drawer #drawerLeft placement="left">
          <div class="bg-white h-100 shadow-lg border-end" style="width: 320px;">
            <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Left Sidebar</h5>
              <button class="btn-close" (click)="drawerLeft.close()"></button>
            </div>
            <div class="p-4">
              <p>Welcome to the left drawer. This is common for side navigation menus.</p>
            </div>
          </div>
        </ac-drawer>

        <ac-drawer #drawerRight placement="right">
          <div class="bg-white h-100 shadow-lg border-start" style="width: 350px;">
             <div class="p-4 border-bottom d-flex justify-content-between align-items-center bg-light">
              <h5 class="mb-0">Right Inspector</h5>
              <button class="btn-close" (click)="drawerRight.close()"></button>
            </div>
            <div class="p-4">
              <p>The right drawer is often used for properties or settings panels.</p>
              <div class="mt-3">
                <label class="form-label small fw-bold">Setting 1</label>
                <input type="text" class="form-control mb-2" value="Default Value">
                <div class="form-check form-switch mt-3">
                  <input class="form-check-input" type="checkbox" checked>
                  <label class="form-check-label">Enable Notifications</label>
                </div>
              </div>
            </div>
          </div>
        </ac-drawer>

        <ac-drawer #drawerTop placement="top">
          <div class="bg-white shadow-lg border-bottom" style="height: 250px;">
            <div class="container h-100 p-4 d-flex flex-column">
               <div class="d-flex justify-content-between align-items-center mb-3">
                 <h5 class="mb-0 text-primary">Announcement</h5>
                 <button class="btn-close" (click)="drawerTop.close()"></button>
               </div>
               <div class="alert alert-info border-0 shadow-sm">
                 We've updated our platform with new features! Check them out below.
               </div>
               <div class="mt-auto text-end">
                 <button class="btn btn-secondary" (click)="drawerTop.close()">Dismiss</button>
               </div>
            </div>
          </div>
        </ac-drawer>

        <ac-drawer #drawerBottom placement="bottom">
          <div class="bg-white shadow-lg border-top" style="height: 300px;">
             <div class="container p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h5 class="mb-0">Quick Menu</h5>
                  <button class="btn-close" (click)="drawerBottom.close()"></button>
                </div>
                <div class="row g-3">
                   <div class="col-4 col-md-2" *for="let i of [1,2,3,4,5,6]">
                      <div class="p-3 border rounded text-center btn btn-light w-100">
                         <i class="fa-solid fa-cube d-block mb-2 fs-4 text-primary"></i>
                         <span class="small">Action {{i}}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </ac-drawer>
      </div>
    </div>
  `,
  styles: `
    .capitalize { text-transform: capitalize; }
  `
})
export class DrawerPage {
  @AcViewChild('#drawerLeft') drawerLeft!: AcDrawer;
  @AcViewChild('#drawerRight') drawerRight!: AcDrawer;
  @AcViewChild('#drawerTop') drawerTop!: AcDrawer;
  @AcViewChild('#drawerBottom') drawerBottom!: AcDrawer;

  sides = ['left', 'right', 'top', 'bottom'];

  dropdownItems: IAppMenuItem[] = [{ label: 'Drawer Config', isHeader: true }];

  openDrawer(side: string) {
    if (side === 'left') this.drawerLeft.open();
    if (side === 'right') this.drawerRight.open();
    if (side === 'top') this.drawerTop.open();
    if (side === 'bottom') this.drawerBottom.open();
  }
}
