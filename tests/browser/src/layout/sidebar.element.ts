
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcElement } from '@autocode-ts/ac-runtime';
import { App, SIDEBAR_NAV } from '../_app.export';
@AcElement({
  selector: 'app-sidebar',
  template: `
        <div class="sidebar-header pt-1 pb-2">
            <div class="sidebar-brand">
               <img src="assets/images/logo/logo-full-white.svg" class="sidebar-brand-full mt-1" height="23" name="logo"
                title="Accountea" />
            </div>
            <i class="fa fa-bars pt-1 d-none"></i>
        </div>
        <ac-filterable-elements class="flex-fill d-flex" style="flex-direction:column;">
            <div class="px-2 pt-2">
            <input type="text" class="form-control py-1 menu-search-input" placeholder="Search Menu" ac-filter-input />
            </div>
            <ul class="sidebar-nav" data-coreui="navigation" data-simplebar="">
                <ac-container  ac:for="let item of navItems">
                    <app-sidebar-menu-item [item]="item"></app-sidebar-menu-item>
                </ac-container>
            </ul>
        </ac-filterable-elements>
    `,
  styles: `
    .sidebar-footer{
      flex-direction:column;
    }
    .accountee-img {
      height: 30px;
      width: 30px;
      object-fit: contain;
      border-radius: 50%;
      background-color: white;
      padding: 2px;
    }
    .nav-item {
      cursor:pointer;
    }
    .dropdown {
      cursor:pointer;
    }
    .dropdown-icon {
      width:35px;
    }
    `
})
export class SidebarElement {
  App = App;
  ACI_SVG_SOLID = ACI_SVG_SOLID;

  navItems = [...SIDEBAR_NAV];

  acOnInit() {
    //
  }

  handleNavRoute(route: string) {
    App.navigateByUrl(route);
  }



}
