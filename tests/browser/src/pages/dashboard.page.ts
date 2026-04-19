import { AcElement } from "@autocode-ts/ac-runtime";

@AcElement({
  selector: 'dashboard-page',
  template: ``,
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
}
