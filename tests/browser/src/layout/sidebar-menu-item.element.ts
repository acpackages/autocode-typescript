/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElement, AcInput, AcViewChild, IAcOnInit } from "@autocode-ts/ac-runtime";
import { App, IAppNavItem } from "../_app.export";

@AcElement({
  selector: 'app-sidebar-menu-item',
  template: `
    <li #li ac:class:nav-item="!hasChildren" ac:class:nav-group="hasChildren"  ac:bind:ac-filter-value="item.label">
      <a class="nav-link px-2 py-1" ac:class:nav-group-toggle="hasChildren"
      ac:class:active="isActive" (click)="handleNavItemClick(item)">
          <span>{{item.label}}</span>
      </a>
      <ul ac:if="hasChildren" class="nav-group-items compact ps-2">
          <app-sidebar-menu-item [item]="child"  ac:for="let child of item.children"></app-sidebar-menu-item>
      </ul>
    </li>
    `,
  styles: `

    `
})

export class SidebarMenuItemElement implements IAcOnInit {
  @AcViewChild('li') li!: HTMLLIElement;
  @AcInput() item:IAppNavItem|any = {};
  isActive = false;
  hasChildren:boolean = false;

  acOnInit(): void {
    App.on({
      event: 'routeChange', callback: () => {
        this.setActiveNavItem();
      }
    });
    this.setActiveNavItem();
    if(this.item.children && this.item.children.length > 0){
      this.hasChildren = true;
    }
  }

  handleNavItemClick(item: any) {
    if (item.route) {
      // alert(`Navigating to route : ${item.route}`)
      App.navigateByUrl(item.route);
    }
  }

  setActiveNavItem() {
    const activeRoute = App.getActiveRoute();
    if (activeRoute == this.item.route) {
      this.isActive = true;
    }
    else {
      this.isActive = false;
    }
  }

}
