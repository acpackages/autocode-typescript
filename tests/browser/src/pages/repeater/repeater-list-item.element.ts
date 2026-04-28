import { AcElement } from "@autocode-ts/ac-runtime";

@AcElement({
    selector: 'app-repeater-list-item',
    template: `
    Extension list item
    `
})
export class RepeaterListItem {
    element!:HTMLElement;

}
