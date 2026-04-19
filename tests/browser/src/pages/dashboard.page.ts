import { AcElement } from "@autocode-ts/ac-runtime";
import { SIDEBAR_NAV } from "../_app.export";

@AcElement({
  selector: 'dashboard-page',
  template: `
    <div class="app-page">
      <app-header title="Dashboard"></app-header>
      <div class="p-4 flex-fill overflow-auto">
        <div class="row g-4">
          <ac-container ac:for="let group of navItems">
            <div class="col-12 col-md-6 col-lg-4" *if="group.children">
              <div class="card h-100 shadow-sm border-0">
                <div class="card-header bg-primary text-white py-3">
                  <h5 class="card-title mb-0">{{group.label}}</h5>
                </div>
                <div class="card-body p-0">
                  <div class="list-group list-group-flush">
                    <ac-container ac:for="let child of group.children">
                      <a [href]="child.route" class="list-group-item list-group-item-action py-3 px-4 d-flex align-items-center">
                        <span class="flex-grow-1">{{child.label}}</span>
                        <i class="fa-solid fa-chevron-right text-muted opacity-50 small"></i>
                      </a>
                    </ac-container>
                  </div>
                </div>
              </div>
            </div>
          </ac-container>
        </div>
      </div>
    </div>
  `,
  styles: `
    .card {
      transition: transform 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    .list-group-item:hover {
      background-color: #f8f9fa;
    }
  `
})
export class DashboardPage {
  navItems = SIDEBAR_NAV.filter(item => item.label !== 'Dashboard');
}
