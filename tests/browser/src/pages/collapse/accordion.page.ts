import { AcElement } from "@autocode-ts/ac-runtime";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'accordion-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcAccordion Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates <code>&lt;AcAccordion&gt;</code> behavior with multiple collapses.</p>
        <ac-accordion>
          <div class="mb-2 border rounded p-2">
            <ac-collapse ac-collapse ac-collapse-open>
              <div class="collapse-header cursor-pointer fw-bold p-2" ac-collapse-toggle>Section A</div>
              <div ac-collapse-content class="collapse-content border bg-white p-3" style="overflow:hidden; height:auto;">
                <p>Content for section A</p>
                <p>Click the header to toggle this section.</p>
              </div>
            </ac-collapse>
          </div>
          <div class="mb-2 border rounded p-2">
            <ac-collapse ac-collapse>
              <div class="collapse-header cursor-pointer fw-bold p-2" ac-collapse-toggle>Section B</div>
              <div ac-collapse-content class="collapse-content border bg-white p-3" style="overflow:hidden; height:auto;">
                <p>Content for section B</p>
                <p>Click the header to toggle this section.</p>
              </div>
            </ac-collapse>
          </div>
          <div class="mb-2 border rounded p-2">
            <ac-collapse ac-collapse>
              <div class="collapse-header cursor-pointer fw-bold p-2" ac-collapse-toggle>Section C</div>
              <div ac-collapse-content class="collapse-content border bg-white p-3" style="overflow:hidden; height:auto;">
                <p>Content for section C</p>
                <p>Click the header to toggle this section.</p>
              </div>
            </ac-collapse>
          </div>
        </ac-accordion>
        <hr class="my-5">
        <p class="text-muted"><small>All sections above are managed by AcAccordion. Opening one section closes the others automatically.</small></p>
      </div>
    </div>
  `
})
export class AccordionPage {
  dropdownItems: IAppMenuItem[] = [
    { label: 'Accordion Actions', isHeader: true },
    {
      label: 'Log State', callback: () => {
        console.log('Accordion logged');
      }
    }
  ];
}
