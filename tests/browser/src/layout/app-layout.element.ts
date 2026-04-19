import { AcElement } from "@autocode-ts/ac-runtime";

@AcElement({
  selector: 'app-layout',
  template: `
    <div class="sidebar sidebar-dark sidebar-fixed" id="sidebar">
      <app-sidebar></app-sidebar>
    </div>
    <div class="wrapper d-flex flex-column min-vh-100 bg-light">
      <div class="body flex-grow-1">
          <ac-router></ac-router>
      </div>
    </div>
  `
})
export class AppLayout {
  acOnInit(){
    console.log("Main Layout");
  }
}
