/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acAddClassToElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AcCollapseAttributeName } from "../consts/ac-collapse-attribute-name.const";
import { AcCollapseCssClassName } from "../consts/ac-collapse-css-class-name.const";
import { AcEnumCollapseDirection } from "../enums/ac-enum-collapse-direction.enum";
import { AcEnumCollapseEvent } from "../enums/ac-enum-collapse-event.enum";
import { IAcCollapseEvent } from "../interfaces/ac-collapse-event.interface";
import { AC_COLLAPSE_TAG } from "../consts/ac-collapse-tag.const";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcCollapse extends AcElementBase{
  useAnimation: boolean = true;
  contentElement: HTMLElement | undefined;
  toggleElement: HTMLElement | undefined;
  isOpen: boolean = false;
  isAnimating: boolean = false;
  direction: AcEnumCollapseDirection = AcEnumCollapseDirection.TopToBottom;
  mutationObserver?:MutationObserver;

  close({ skipAnimation = false }: { skipAnimation?: boolean } = {}) {
    if (skipAnimation) {
      this.isAnimating = false;
      this.isOpen = false;
      this.classList.remove(AcCollapseCssClassName.acCollapseOpen);
      this.removeAttribute(AcCollapseAttributeName.acCollapseOpen);
      if (this.contentElement) {
        this.contentElement.style.display = "none";
        this.contentElement.style.height = "";
        this.contentElement.style.width = "";
      }
    } else {
      if (!this.isOpen || this.isAnimating) return;
      this.isOpen = false;
      this.isAnimating = true;

      this.classList.remove(AcCollapseCssClassName.acCollapseOpen);
      this.removeAttribute(AcCollapseAttributeName.acCollapseOpen);

      if (this.contentElement) {
        const fullWidth = this.contentElement.scrollWidth + "px";
        const fullHeight = this.contentElement.scrollHeight + "px";

        const keyframes = this.getKeyFrames({ open: false, fullWidth, fullHeight });

        const animation = this.contentElement.animate(keyframes, {
          duration: 300,
          easing: "ease-in-out",
        });

        animation.onfinish = () => {
          if (this.contentElement) {
            this.contentElement.style.display = "none";
            this.contentElement.style.height = "";
            this.contentElement.style.width = "";
          }
          this.isAnimating = false;
        };

        const eventParams: IAcCollapseEvent = { collapse: this,target:this };
        this.events.execute({ event: AcEnumCollapseEvent.Close, args: eventParams });
      }
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'contents';
    const directionAttr = this.getAttribute(AcCollapseAttributeName.acCollapseDirection);
    if (directionAttr && Object.values(AcEnumCollapseDirection).includes(directionAttr as AcEnumCollapseDirection)) {
      this.direction = directionAttr as AcEnumCollapseDirection;
    }
    if (this.querySelector(`[${AcCollapseAttributeName.acCollapseToggle}]`)) {
      this.setToggleElement({ element: this.querySelector(`[${AcCollapseAttributeName.acCollapseToggle}]`)! });
    }
    if (this.querySelector(`[${AcCollapseAttributeName.acCollapseContent}]`)) {
      this.setContentElement({ element: this.querySelector(`[${AcCollapseAttributeName.acCollapseContent}]`)! });
    }
    acAddClassToElement({ element: this, class_: AcCollapseCssClassName.acCollapse });
    if (this.querySelector(`[${AcCollapseAttributeName.acCollapseToggle}]`)) {
      this.setToggleElement({ element: this.querySelector(`[${AcCollapseAttributeName.acCollapseToggle}]`)! });
    }
    if (this.querySelector(`[${AcCollapseAttributeName.acCollapseContent}]`)) {
      this.setContentElement({ element: this.querySelector(`[${AcCollapseAttributeName.acCollapseContent}]`)! });
    } else {
      this.setContentElement({ element: this });
    }
    this.observe();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unobserve();
  }

  open({ skipAnimation = false }: { skipAnimation?: boolean } = {}) {
    if (this.isOpen || this.isAnimating) return;
    this.isOpen = true;
    this.isAnimating = true;

    this.classList.add(AcCollapseCssClassName.acCollapseOpen);
    this.setAttribute(AcCollapseAttributeName.acCollapseOpen, "");

    if (this.contentElement) {
      this.contentElement.style.display = "block";

      const fullWidth = this.contentElement.scrollWidth + "px";
      const fullHeight = this.contentElement.scrollHeight + "px";

      if (skipAnimation) {
        this.contentElement.style.width = "";
        this.contentElement.style.height = "";
        this.isAnimating = false;
      } else {
        const keyframes = this.getKeyFrames({ open: true, fullWidth, fullHeight });
        const animation = this.contentElement.animate(keyframes, {
          duration: 300,
          easing: "ease-in-out",
        });
        animation.onfinish = () => {
          if (this.contentElement) {
            this.contentElement.style.width = "";
            this.contentElement.style.height = "";
          }
          this.isAnimating = false;
        };
      }

      const eventParams: IAcCollapseEvent = { collapse: this,target:this };
      this.events.execute({ event: AcEnumCollapseEvent.Open, args: eventParams });
    }
  }

  private getKeyFrames({
    open,
    fullHeight,
    fullWidth,
  }: {
    open: boolean;
    fullWidth: string;
    fullHeight: string;
  }): Keyframe[] {
    const isVertical = [
      AcEnumCollapseDirection.TopToBottom,
      AcEnumCollapseDirection.BottomToTop,
    ].includes(this.direction);
    const isHorizontal = [
      AcEnumCollapseDirection.LeftToRight,
      AcEnumCollapseDirection.RightToLeft,
    ].includes(this.direction);
    const isDiagonal = !isVertical && !isHorizontal;

    if (isDiagonal) {
      return open
        ? [
            { width: "0px", height: "0px", opacity: 0 },
            { width: fullWidth, height: fullHeight, opacity: 1 },
          ]
        : [
            { width: fullWidth, height: fullHeight, opacity: 1 },
            { width: "0px", height: "0px", opacity: 0 },
          ];
    }

    if (isHorizontal) {
      return open
        ? [{ width: "0px", opacity: 0 }, { width: fullWidth, opacity: 1 }]
        : [{ width: fullWidth, opacity: 1 }, { width: "0px", opacity: 0 }];
    }

    if (isVertical) {
      return open
        ? [{ height: "0px", opacity: 0 }, { height: fullHeight, opacity: 1 }]
        : [{ height: fullHeight, opacity: 1 }, { height: "0px", opacity: 0 }];
    }

    return [];
  }

  private observe(){
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === AcCollapseAttributeName.acCollapseOpen) {
          const shouldBeOpen = this.hasAttribute(AcCollapseAttributeName.acCollapseOpen);
          if (shouldBeOpen && !this.isOpen) this.open();
          else if (!shouldBeOpen && this.isOpen) this.close();
        }
      }
    });

    this.mutationObserver.observe(this, { attributes: true });
  }

  setContentElement({ element }: { element: HTMLElement }) {
    this.contentElement = element;
    acAddClassToElement({
      class_: AcCollapseCssClassName.acCollapseContent,
      element,
    });
    this.contentElement.style.overflow = "hidden";
    this.contentElement.style.opacity = "0";

    this.delayedCallback.add({callback:() => {
      if (this.contentElement) {
        this.contentElement.style.opacity = "1";
      }
      if (this.hasAttribute(AcCollapseAttributeName.acCollapseOpen)) {
        this.open({ skipAnimation: true });
      } else {
        this.close({ skipAnimation: true });
      }
    }, duration:100});
  }

  setToggleElement({ element }: { element: HTMLElement }) {
    this.toggleElement = element;
    acAddClassToElement({
      class_: AcCollapseCssClassName.acCollapseToggle,
      element,
    });
    this.toggleElement.addEventListener("click", () => this.toggle());
  }

  toggle() {
    if (this.isOpen) {
      this.close({ skipAnimation: !this.useAnimation });
    } else {
      this.open({ skipAnimation: !this.useAnimation });
    }
    const eventParams: IAcCollapseEvent = { collapse: this,target:this };
    this.events.execute({ event: AcEnumCollapseEvent.Toggle, args: eventParams });
  }

  unobserve(){
    if(this.mutationObserver){
      this.mutationObserver.disconnect();
    }
  }
}

acRegisterCustomElement({tag:AC_COLLAPSE_TAG.collapse,type:AcCollapse});
