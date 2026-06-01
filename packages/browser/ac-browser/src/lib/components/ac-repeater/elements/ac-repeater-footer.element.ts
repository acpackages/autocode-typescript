import { acGetParentElementWithTag, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcRepeaterApi } from "../core/ac-repeater-api";
import { AcElementBase } from "../../../core/_core.export";
import { AcRepeaterElement } from "./ac-repeater.element";
import { AC_REPEATER_TAG } from "../consts/ac-repeater-tag.const";
import { AcEnumRepeaterHook } from "../_ac-repeater.export";


export class AcRepeaterFooterElement extends AcElementBase {
  private repeaterApi: AcRepeaterApi;
  private isPaginationAdded:boolean = false;

  private autoBindRepeater() {
    if (this.isConnected) {
      const repeater: AcRepeaterElement = acGetParentElementWithTag({ element: this, tag: AC_REPEATER_TAG.repeater }) as any;
      if (repeater) {
        this.repeaterApi = repeater.repeaterApi;
        this.repeaterApi.hooks.subscribe({
          hook: AcEnumRepeaterHook.UsePaginationChange, callback: () => {
            this.setPagination();
          }
        });
        if (this.repeaterApi.usePagination && this.repeaterApi.pagination) {
          this.setPagination();
        }
      }
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.autoBindRepeater();
        }, duration: 50, key: 'autoInit'
      });
    }
  }

  override init(): void {
    super.init();
    this.autoBindRepeater();
  }

  setPagination() {
    if (this.repeaterApi) {
      if (this.repeaterApi.usePagination && this.repeaterApi.pagination) {
        if(!this.isPaginationAdded){
          this.isPaginationAdded = true;
          this.append(this.repeaterApi.pagination);
        }
      } else if (!this.repeaterApi.usePagination && this.repeaterApi?.pagination) {
        this.repeaterApi.pagination.remove();
        this.isPaginationAdded = false;
      }
    }

  }
}

acRegisterCustomElement({ tag: AC_REPEATER_TAG.repeaterFooter, type: AcRepeaterFooterElement });
