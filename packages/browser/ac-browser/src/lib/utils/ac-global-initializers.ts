/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AcArrayValuesInputElement, AcDatagrid, AcDatagridSelectInputElement, AcDatetimeInputElement, AcFilePreview, AcForm, AcFormField, AcFormFieldErrorMessage, AcInputElement, AcModal, AcNumberInput, AcOptionInputElement, AcPagination, AcPopoutTextareaInputElement, AcRepeaterBodyElement, AcRepeaterElement, AcRepeaterFooterElement, AcRepeaterHeaderElement, AcRepeaterRowElement, AcResizable, AcResizablePanel, AcResizablePanels, AcSelectInputElement, AcTextareaInputElement, AcTextInputElement, AcTooltip } from "../components/_components.export";
import { AcAccordion } from "../components/ac-accordion/elements/ac-accordion.element";
import { AcCollapse } from "../components/ac-collapse/elements/ac-collapse.element";
import { AcSvgIcon } from "../components/ac-svg-icon/_ac-svg-icon.element";
import { AcElementObserver, acElementObserver } from "../core/ac-element-observer";

const ATTRIBUTES_TO_LISTEN: string[] = [
  'ac-tooltip'
];

const elementObserver: AcElementObserver = new AcElementObserver();

export function acInit({ element, observe = true }: { element?: HTMLElement, observe?: boolean } = {}) {
  const instances: any[] = [];
  if (element == undefined) {
    element = document.querySelector('body') as HTMLElement;
  }
  elementObserver.observe({
    element, onMutation: (mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((element) => {
            if (element instanceof HTMLElement) {
              // acInit({ element });
            }
          });
        }
        else if (mutation.type == "attributes" && mutation.attributeName == 'ac-tooltip') {
          const targetElement: HTMLElement = mutation.target as HTMLElement;
          if (targetElement.hasAttribute('ac-tooltip')) {
            acInitTooltip({ element: targetElement });
          }
        }
      });
    }
  });
  if (element.hasAttribute('ac-tooltip')) {
    acInitTooltip({ element });
  }
  // element.childNodes.forEach((child) => {
  //   if (child instanceof HTMLElement) {
  //     // acInit({ element:child });
  //   }
  // });
  return instances;
}

export function acInitTooltip({ element }: { element: HTMLElement }) {
  new AcTooltip({ element: element });
}

AcAccordion;
AcCollapse;
AcDatagrid;

AcFilePreview;

AcForm;
AcFormField;
AcFormFieldErrorMessage;

// Start Input Elements
AcArrayValuesInputElement;
AcDatagridSelectInputElement;
AcDatetimeInputElement;
AcInputElement;
AcNumberInput;
AcOptionInputElement;
AcPopoutTextareaInputElement;
AcSelectInputElement;
AcTextInputElement;
AcTextareaInputElement;
// End Input Elements

AcResizable;
AcResizablePanel;
AcResizablePanels;

AcRepeaterElement;
AcRepeaterBodyElement;
AcRepeaterHeaderElement;
AcRepeaterFooterElement;
AcRepeaterRowElement;

AcModal;
AcPagination;
AcSvgIcon;
