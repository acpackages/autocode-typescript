/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcEnumDrawerEvent } from "../enums/ac-enum-drawer-event.enum";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DRAWER_TAG } from "../consts/ac-drawer-tag.const";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcDrawer extends AcElementBase{
  private backdropEl?: HTMLDivElement;
  private isOpen = false;
  get animationDuration():number{
    return parseInt(this.getAttribute('animation-duration')??"200");
  }
  set animationDuration(value:number){
    this.setAttribute('animation-duration',value.toString());
  }

  get suppressBackdropClose():boolean{
    return this.getAttribute('suppress-backdrop-close')!='true';
  }
  set suppressBackdropClose(value:boolean){
    this.setAttribute('suppress-backdrop-close',`${value}`);
  }

  get placement():string{
    return this.getAttribute('placement')??'left';
  }
  set placement(value:'left'|'right'|'top'|'bottom'){
    this.setAttribute('placement',value);
  }

  get showBackdrop():boolean{
    return this.getAttribute('show-backdrop')!='false';
  }
  set showBackdrop(value:boolean){
    this.setAttribute('show-backdrop',`${value}`);
  }

  override init() {
    super.init();
    const closeButton = this.querySelector('[ac-drawer-close]');
    if(closeButton ){
      closeButton.addEventListener('click',()=>{
        this.close();
      })
    }
    this.style.setProperty('--ac-drawer-duration', `${this.animationDuration}ms`);

    if (this.showBackdrop) {
      this.backdropEl = this.ownerDocument.createElement('div');
      this.backdropEl.classList.add('ac-drawer-backdrop');

      if (!this.suppressBackdropClose) {
        this.backdropEl.addEventListener('click', () => this.close());
      }
    }
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;

    if (this.showBackdrop && this.backdropEl) {
      this.ownerDocument.body.appendChild(this.backdropEl);
      requestAnimationFrame(() => {
        this.backdropEl?.classList.add('show');
      });
    }

    requestAnimationFrame(() => {
      this.classList.add('open');
    });
    this.events.execute({event:AcEnumDrawerEvent.Open});
    this.events.execute({event:AcEnumDrawerEvent.Toggle});
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.classList.remove('open');

    if (this.showBackdrop && this.backdropEl) {
      this.backdropEl.classList.remove('show');
      this.delayedCallback.add({callback:() => {
        if (this.backdropEl && this.backdropEl.parentElement) {
          this.backdropEl.parentElement.removeChild(this.backdropEl);
        }
      }, duration:this.animationDuration});
    }
    this.events.execute({event:AcEnumDrawerEvent.Close});
    this.events.execute({event:AcEnumDrawerEvent.Toggle});
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }
}

acRegisterCustomElement({tag:AC_DRAWER_TAG.drawer,type:AcDrawer})
