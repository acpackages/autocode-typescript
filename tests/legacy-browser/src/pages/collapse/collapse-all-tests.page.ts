/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcCollapse, AcEnumCollapseDirection } from "@autocode-ts/ac-browser";

export class CollapseTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcCollapse Direction Test Page</h2>
        <p>This page demonstrates <code>&lt;AcCollapse&gt;</code> behavior for all 8 supported directions.</p>

        ${this.renderTestBlock('Left to Right', AcEnumCollapseDirection.LeftToRight, 'Collapses from left to right (shrinks width from left edge).')}
        ${this.renderTestBlock('Right to Left', AcEnumCollapseDirection.RightToLeft, 'Collapses from right to left (shrinks width from right edge).')}
        ${this.renderTestBlock('Top to Bottom', AcEnumCollapseDirection.TopToBottom, 'Collapses downward (shrinks height from top).')}
        ${this.renderTestBlock('Bottom to Top', AcEnumCollapseDirection.BottomToTop, 'Collapses upward (shrinks height from bottom).')}
        ${this.renderTestBlock('Top Left to Bottom Right', AcEnumCollapseDirection.TopLeftToBottomRight, 'Collapses diagonally from top-left to bottom-right.')}
        ${this.renderTestBlock('Bottom Right to Top Left', AcEnumCollapseDirection.BottomRightToTopLeft, 'Collapses diagonally from bottom-right to top-left.')}
        ${this.renderTestBlock('Top Right to Bottom Left', AcEnumCollapseDirection.TopRightToBottomLeft, 'Collapses diagonally from top-right to bottom-left.')}
        ${this.renderTestBlock('Bottom Left to Top Right', AcEnumCollapseDirection.BottomLeftToTopRight, 'Collapses diagonally from bottom-left to top-right.')}

        <hr class="my-5">
        <p class="text-muted"><small>All sections above are animated using JavaScript and AcCollapse's internal animation logic. Styling uses Bootstrap 5 classes.</small></p>
      </div>
    `;

    this.querySelectorAll('[ac-collapse]').forEach(el => {
      console.log(new AcCollapse());
    });
  }

  renderTestBlock(title: string, direction: AcEnumCollapseDirection, description: string): string {
    const id = direction.toLowerCase().replace(/[^a-z]/g, '-');
    let flexDirection: string = 'column';
    if (direction == AcEnumCollapseDirection.TopToBottom) {
      flexDirection = 'column';
    }
    else if (direction == AcEnumCollapseDirection.BottomToTop) {
      flexDirection = 'column-reverse';
    }
    else if (direction == AcEnumCollapseDirection.LeftToRight) {
      flexDirection = 'row';
    }
    else if (direction == AcEnumCollapseDirection.RightToLeft) {
      flexDirection = 'row-reverse';
    }
    else if (direction == AcEnumCollapseDirection.TopLeftToBottomRight) {
      flexDirection = 'column-reverse';
    }
    else if (direction == AcEnumCollapseDirection.TopRightToBottomLeft) {
      flexDirection = 'column-reverse';
    }
    else if (direction == AcEnumCollapseDirection.BottomLeftToTopRight) {
      flexDirection = 'column-reverse';
    }
    else if (direction == AcEnumCollapseDirection.BottomRightToTopLeft) {
      flexDirection = 'column-reverse';
    }
    return `
      <div class="mb-4 border rounded p-3 bg-light" >
        <h5>${title}</h5>
        <p><small class="text-muted">${description}</small></p>
        <ac-collapse ac-collapse-open ac-collapse-direction="${direction}">
        <div class="mb-2">
          <button type="button" class="btn btn-primary btn-sm" ac-collapse-toggle>Toggle ${title}</button>
        </div>
        <div style="width:100%;display:flex;flex-direction:${flexDirection};">
        `+ (flexDirection == AcEnumCollapseDirection.BottomRightToTopLeft ? `<div style=''>` : ``) + `<div ac-collapse-content class="border bg-white p-3" style="overflow: hidden; width: 100%; height: 100%;float:right">
              <div>
                <p>This is content for <strong>${title}</strong> direction collapse.</p>
                <p>Click the button above to toggle this content visibility with animation.</p>
              </div>
            </div> `+ (flexDirection == AcEnumCollapseDirection.BottomRightToTopLeft ? `</div>` : ``) + `</div>
            </ac-collapse>
            </div>`;
  }
}
