import { AcElementBase } from "../../../core/ac-element-base";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcEnumPaginationEvent, AcPaginationElement, AcPaginationCssClassName, AC_PAGINATION_SVG_ICONS } from "../_ac-pagination.export";
import { IAcPaginationPageChangeEvent } from "../interfaces/event-params/ac-page-change-event.interface";

export class AcPaginationNavigationButtonsElement extends AcElementBase{
  private _pagination?: AcPaginationElement;
  get pagination():AcPaginationElement|undefined{
    return this._pagination;
  }
  set pagination(value: AcPaginationElement) {
    this._pagination = value;
    value.on({
      event: AcEnumPaginationEvent.PageChange, callback: (event: IAcPaginationPageChangeEvent) => {
        this.render();
      }
    });

    value.on({
      event: AcEnumPaginationEvent.PageSizeChange, callback: (event: any) => {
        this.render();
      }
    });
  }

  private previousButton:HTMLElement;
  private firstButton:HTMLElement;
  private lastButton:HTMLElement;
  private nextButton:HTMLElement;
  private pageLabel:HTMLElement;

  constructor(){
    super();
    this.classList.add(AcPaginationCssClassName.acPaginationNavigationButtons);
    this.innerHTML = `
      <button type="button" class="${AcPaginationCssClassName.acPaginationPageButton}" ac-pagination-first-button><ac-svg-icon>${AC_PAGINATION_SVG_ICONS.first}</ac-svg-icon></button>
      <button type="button" class="${AcPaginationCssClassName.acPaginationPageButton}" ac-pagination-previous-button><ac-svg-icon>${AC_PAGINATION_SVG_ICONS.previous}</ac-svg-icon></button>
      <div ac-pagination-page-label style="margin: 0 10px; font-size: 14px;"></div>
      <button type="button" class="${AcPaginationCssClassName.acPaginationPageButton}" ac-pagination-next-button><ac-svg-icon>${AC_PAGINATION_SVG_ICONS.next}</ac-svg-icon></button>
      <button type="button" class="${AcPaginationCssClassName.acPaginationPageButton}" ac-pagination-last-button><ac-svg-icon>${AC_PAGINATION_SVG_ICONS.last}</ac-svg-icon></button>
    `;
    this.firstButton = this.querySelector('[ac-pagination-first-button]') as HTMLButtonElement;
    this.previousButton = this.querySelector('[ac-pagination-previous-button]') as HTMLButtonElement;
    this.pageLabel = this.querySelector('[ac-pagination-page-label]') as HTMLElement;
    this.nextButton = this.querySelector('[ac-pagination-next-button]') as HTMLButtonElement;
    this.lastButton = this.querySelector('[ac-pagination-last-button]') as HTMLButtonElement;
    this.registerListeners();
  }

  override init(){
    super.init();
    this.validateButtons();
    this.renderPageLabel();
  }

  handlePageChanged(event:IAcPaginationPageChangeEvent){
    this.render();
  }

  render(){
    this.validateButtons();
    this.renderPageLabel();
  }

  registerListeners(){
    this.firstButton.addEventListener('click',(event:Event)=>{
      if (this.pagination) {
      this.pagination.activePage = 1;
      }
    });
    this.previousButton.addEventListener('click',(event:Event)=>{
      if (this.pagination) {
      this.pagination.activePage = this.pagination.activePage - 1;
      }
    });
    this.nextButton.addEventListener('click',(event:Event)=>{
      if (this.pagination) {
      this.pagination.activePage = this.pagination.activePage + 1;
      }
    });
    this.lastButton.addEventListener('click',(event:Event)=>{
      if (this.pagination) {
      this.pagination.activePage = this.pagination.totalPages;
      }
    });
  }

  renderPageLabel(){
    if (this.pagination) {
    this.pageLabel.innerHTML = `Page <b>${this.pagination.activePage}</b> of <b>${this.pagination.totalPages}</b>`;
    }
  }

  validateButtons(){
    if(this.pagination && this.pagination.activePage <= 1){
      this.firstButton.setAttribute('disabled',"true");
      this.previousButton.setAttribute('disabled',"true");
    }
    else{
      this.firstButton.removeAttribute('disabled');
      this.previousButton.removeAttribute('disabled');
    }
    if(this.pagination && this.pagination.activePage >= this.pagination.totalPages){
      this.nextButton.setAttribute('disabled',"true");
      this.lastButton.setAttribute('disabled',"true");
    }
    else{
      this.nextButton.removeAttribute('disabled');
      this.lastButton.removeAttribute('disabled');
    }
  }

}

acRegisterCustomElement({'tag':'ac-pagination-navigation-buttons',type:AcPaginationNavigationButtonsElement});
