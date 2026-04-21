import { AcElement, AcViewChild } from "@autocode-ts/ac-runtime";
import { AppHeaderElement } from "src/_app.export";

@AcElement({
  selector: 'dashboard-page',
  template: `
  <div class="app-page">
    <ac-container ac:if="showHeader">

      <app-header
      #appHeader
        [title]="'Dashboard'"
      ></app-header>
    </ac-container>
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
  @AcViewChild('appHeader') appHeader?:AppHeaderElement;
  showHeader:boolean = false;
  acOnInit(){
    setTimeout(() => {
      this.showHeader = true;
      console.log(this);
    }, 1500);
  }
}
