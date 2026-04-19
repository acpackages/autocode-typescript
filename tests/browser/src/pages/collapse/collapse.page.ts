/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElement } from "@autocode-ts/ac-runtime";
import { AcEnumCollapseDirection } from "@autocode-ts/ac-browser";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'collapse-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcCollapse Direction Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p>This page demonstrates <code>&lt;AcCollapse&gt;</code> behavior for all 8 supported directions.</p>

        <div class="row">
          <div class="col-md-6 mb-4" *for="let test of tests">
            <div class="border rounded p-3 bg-light h-100">
              <h5>{{test.title}}</h5>
              <p><small class="text-muted">{{test.description}}</small></p>
              <ac-collapse ac-collapse-open [ac-collapse-direction]="test.direction">
                <div class="mb-2">
                  <button type="button" class="btn btn-primary btn-sm" ac-collapse-toggle>Toggle {{test.title}}</button>
                </div>
                <div [style.display]="'flex'" [style.flex-direction]="test.flexDirection">
                   <div ac-collapse-content class="border bg-white p-3" style="overflow: hidden; width: 100%; height: 100%;">
                      <div>
                        <p>This is content for <strong>{{test.title}}</strong> direction collapse.</p>
                        <p>Click the button above to toggle this content visibility with animation.</p>
                      </div>
                   </div>
                </div>
              </ac-collapse>
            </div>
          </div>
        </div>

        <hr class="my-5">
        <p class="text-muted"><small>All sections above are animated using JavaScript and AcCollapse's internal animation logic. Styling uses Bootstrap 5 classes.</small></p>
      </div>
    </div>
  `
})
export class CollapsePage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Collapse Actions', isHeader: true }];

  tests = [
    { title: 'Left to Right', direction: AcEnumCollapseDirection.LeftToRight, description: 'Collapses from left to right (shrinks width from left edge).', flexDirection: 'row' },
    { title: 'Right to Left', direction: AcEnumCollapseDirection.RightToLeft, description: 'Collapses from right to left (shrinks width from right edge).', flexDirection: 'row-reverse' },
    { title: 'Top to Bottom', direction: AcEnumCollapseDirection.TopToBottom, description: 'Collapses downward (shrinks height from top).', flexDirection: 'column' },
    { title: 'Bottom to Top', direction: AcEnumCollapseDirection.BottomToTop, description: 'Collapses upward (shrinks height from bottom).', flexDirection: 'column-reverse' },
    { title: 'Top Left to Bottom Right', direction: AcEnumCollapseDirection.TopLeftToBottomRight, description: 'Collapses diagonally from top-left to bottom-right.', flexDirection: 'column-reverse' },
    { title: 'Bottom Right to Top Left', direction: AcEnumCollapseDirection.BottomRightToTopLeft, description: 'Collapses diagonally from bottom-right to top-left.', flexDirection: 'column-reverse' },
    { title: 'Top Right to Bottom Left', direction: AcEnumCollapseDirection.TopRightToBottomLeft, description: 'Collapses diagonally from top-right to bottom-left.', flexDirection: 'column-reverse' },
    { title: 'Bottom Left to Top Right', direction: AcEnumCollapseDirection.BottomLeftToTopRight, description: 'Collapses diagonally from bottom-left to top-right.', flexDirection: 'column-reverse' },
  ];
}
