/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable prefer-const */
import { AcDropdownAttributeName } from "../consts/ac-dropdown-attribute-name.const";
import { AcEnumDropdownEvent } from "../enums/ac-enum-dropdown-event.enum";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DROPDOWN_TAG } from "../consts/ac-dropdown-tag.const";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcDropdown extends AcElementBase {
  get autoClose(): string {
    return this.getAttribute("auto-close") ?? "both";
  }
  set autoClose(value: "inside" | "outside" | "both" | "manual") {
    this.setAttribute("auto-close", `${value}`);
  }

  get alignment(): string {
    return this.getAttribute("alignment") ?? "start";
  }
  set alignment(value: "start" | "end") {
    this.setAttribute("alignment", `${value}`);
  }

  get offset(): number {
    return parseInt(this.getAttribute("offset") ?? "4");
  }
  set offset(value: number) {
    this.setAttribute("offset", `${value}`);
  }

  get position(): string {
    return this.getAttribute("position") ?? "auto";
  }
  set position(value: "auto" | "bottom" | "left" | "right" | "top") {
    this.setAttribute("position", value);
  }

  get trigger(): string {
    return this.getAttribute("trigger") ?? "click";
  }
  set trigger(value: "click" | "hover") {
    this.setAttribute("trigger", value);
  }

  private keydownHandler!: (e: KeyboardEvent) => void;
  private isOpen = false;
  private observer?: IntersectionObserver;
  private outsideClickHandler!: (e: MouseEvent) => void;

  private resizeHandler!: () => void;
  private scrollHandler!: () => void;
  private targetElement!: HTMLElement;
  private triggerElement!: HTMLElement;

  private triggerClickHandler?: (e: Event) => void;
  private triggerEnterHandler?: () => void;
  private triggerLeaveHandler?: () => void;
  private targetEnterHandler?: () => void;
  private targetLeaveHandler?: () => void;

  private chosenPosition: "auto" | "bottom" | "left" | "right" | "top" | string = "auto";

  override init() {
    super.init();
    this.style.display = "contents";
    this.setAttribute(AcDropdownAttributeName.acDropdownId, this.id);
    this.setAttribute(AcDropdownAttributeName.acDropdown, "");

    this.keydownHandler = (e) => this.handleKeydown(e);
    this.outsideClickHandler = (e) => this.handleOutsideClick(e);
    this.scrollHandler = () => this.updatePosition();
    this.resizeHandler = () => this.updatePosition();

    window.addEventListener("scroll", this.scrollHandler, true);
    window.addEventListener("resize", this.resizeHandler);

    this.querySelectorAll(`[${AcDropdownAttributeName.acDropdownTarget}]`).forEach((el) => {
      this.setTargetElement({ element: el as HTMLElement });
    });
    this.querySelectorAll(`[${AcDropdownAttributeName.acDropdownTrigger}]`).forEach((el) => {
      this.setTriggerElement({ element: el as HTMLElement });
    });
    this.querySelectorAll(`[${AcDropdownAttributeName.acDropdownItem}]`).forEach((el) => {
      this.setDropdownItemElement({ element: el as HTMLElement });
    });
  }

  open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.targetElement.style.display = "block";
    this.targetElement.classList.add("fade-in");

    this.chosenPosition = this.position === "auto" ? this.getBestPosition() : this.position;
    this.updatePosition();

    document.addEventListener("click", this.outsideClickHandler);
    this.triggerElement.setAttribute("aria-expanded", "true");

    const firstItem = this.targetElement.querySelector(
      `[${AcDropdownAttributeName.acDropdownItem}]`
    ) as HTMLElement;
    if (firstItem) {
      firstItem.tabIndex = 0;
      firstItem.focus();
    }

    this.events.execute({ event: AcEnumDropdownEvent.Open, args: { dropdown: this } });
    this.events.execute({ event: AcEnumDropdownEvent.Toggle, args: { dropdown: this } });
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.targetElement.classList.remove("fade-in");
    this.targetElement.style.display = "none";

    document.removeEventListener("click", this.outsideClickHandler);
    this.triggerElement.setAttribute("aria-expanded", "false");

    this.events.execute({ event: AcEnumDropdownEvent.Close, args: { dropdown: this } });
    this.events.execute({ event: AcEnumDropdownEvent.Toggle, args: { dropdown: this } });
  }

  toggle(): void {
    this.isOpen ? this.close() : this.open();
  }

  override destroy(): void {
    window.removeEventListener("scroll", this.scrollHandler, true);
    window.removeEventListener("resize", this.resizeHandler);

    this.triggerElement?.removeEventListener("keydown", this.keydownHandler);
    this.targetElement?.removeEventListener("keydown", this.keydownHandler);
    if (this.triggerClickHandler) this.triggerElement?.removeEventListener("click", this.triggerClickHandler);
    if (this.triggerEnterHandler) this.triggerElement?.removeEventListener("mouseenter", this.triggerEnterHandler);
    if (this.triggerLeaveHandler) this.triggerElement?.removeEventListener("mouseleave", this.triggerLeaveHandler);
    if (this.targetEnterHandler) this.targetElement?.removeEventListener("mouseenter", this.targetEnterHandler);
    if (this.targetLeaveHandler) this.targetElement?.removeEventListener("mouseleave", this.targetLeaveHandler);

    if (this.observer) {
      this.observer.disconnect();
    }
    document.removeEventListener("click", this.outsideClickHandler);

    super.destroy();
  }

  setDropdownItemElement({ element }: { element: HTMLElement }): void {
    element.setAttribute("role", "menuitem");
    element.setAttribute(AcDropdownAttributeName.acDropdownItem, "");
    element.tabIndex = 0;
  }

  setTargetElement({ element }: { element: HTMLElement }): void {
    this.targetElement = element;
    if (!this.targetElement.id) {
      this.targetElement.id = `${this.id}-menu`;
    }
    element.setAttribute(AcDropdownAttributeName.acDropdownTarget, "");
    element.setAttribute("role", "menu");
    element.style.position = "fixed";
    element.style.display = "none";
    element.style.zIndex = "9999";
    element.addEventListener("keydown", this.keydownHandler);

    if (this.trigger === "hover") {
      this.targetEnterHandler = () => this.open();
      this.targetLeaveHandler = () => this.close();
      element.addEventListener("mouseenter", this.targetEnterHandler);
      element.addEventListener("mouseleave", this.targetLeaveHandler);
    }
  }

  setTriggerElement({ element }: { element: HTMLElement }): void {
    this.triggerElement = element;
    element.setAttribute(AcDropdownAttributeName.acDropdownTrigger, "");
    this.triggerElement.setAttribute("aria-haspopup", "true");
    this.triggerElement.setAttribute("aria-expanded", "false");
    this.triggerElement.setAttribute("aria-controls", this.targetElement?.id ?? `${this.id}-menu`);
    this.triggerElement.addEventListener("keydown", this.keydownHandler);

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting && this.isOpen) this.close();
      }
    });
    this.observer.observe(this.triggerElement);

    if (this.trigger === "click") {
      this.triggerClickHandler = (e) => {
        e.preventDefault();
        this.toggle();
      };
      this.triggerElement.addEventListener("click", this.triggerClickHandler);
    } else if (this.trigger === "hover") {
      this.triggerEnterHandler = () => this.open();
      this.triggerLeaveHandler = () => this.close();
      this.triggerElement.addEventListener("mouseenter", this.triggerEnterHandler);
      this.triggerElement.addEventListener("mouseleave", this.triggerLeaveHandler);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    const items = Array.from(
      this.targetElement.querySelectorAll(`[${AcDropdownAttributeName.acDropdownItem}]`)
    ) as HTMLElement[];
    let index = items.indexOf(document.activeElement as HTMLElement);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (index === -1) items[0]?.focus();
        else items[(index + 1) % items.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index === -1) items[items.length - 1]?.focus();
        else items[(index - 1 + items.length) % items.length]?.focus();
        break;
      case "Escape":
        this.close();
        this.triggerElement.focus();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        (document.activeElement as HTMLElement).click();
        break;
    }
  }

  private handleOutsideClick(e: MouseEvent) {
    if (this.autoClose === "manual") return;
    const isInsideTarget = this.targetElement.contains(e.target as Node);
    const isInsideTrigger = this.triggerElement.contains(e.target as Node);

    if (
      (this.autoClose === "both" && !isInsideTarget && !isInsideTrigger) ||
      (this.autoClose === "outside" && !isInsideTarget && !isInsideTrigger) ||
      (this.autoClose === "inside" && isInsideTarget)
    ) {
      this.close();
    }
  }

  private getBestPosition(): "bottom" | "top" | "right" | "left" {
  const rect = this.triggerElement.getBoundingClientRect();
  const menuHeight = this.targetElement.offsetHeight;
  const menuWidth = this.targetElement.offsetWidth;

  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = window.innerWidth - rect.right;
  const spaceLeft = rect.left;

  // Preferred order: bottom → top → right → left
  if (spaceBelow >= menuHeight) return "bottom";
  if (spaceAbove >= menuHeight) return "top";
  if (spaceRight >= menuWidth) return "right";
  if (spaceLeft >= menuWidth) return "left";

  // fallback (pick the side with max space)
  const maxSpace = Math.max(spaceBelow, spaceAbove, spaceRight, spaceLeft);
  switch (maxSpace) {
    case spaceBelow: return "bottom";
    case spaceAbove: return "top";
    case spaceRight: return "right";
    case spaceLeft: return "left";
  }
  return "bottom";
}

  private updatePosition(): void {
  if (!this.isOpen) return;
  const rect = this.triggerElement.getBoundingClientRect();
  let top = 0, left = 0;

  switch (this.chosenPosition) {
    case "bottom":
      top = rect.bottom + this.offset;
      left = rect.left;
      break;
    case "top":
      top = rect.top - this.targetElement.offsetHeight - this.offset;
      left = rect.left;
      break;
    case "left":
      top = rect.top + (rect.height - this.targetElement.offsetHeight) / 2;
      left = rect.left - this.targetElement.offsetWidth - this.offset;
      break;
    case "right":
      top = rect.top + (rect.height - this.targetElement.offsetHeight) / 2;
      left = rect.right + this.offset;
      break;
  }

  // Collision adjustment: keep inside viewport
  const menuRect = this.targetElement.getBoundingClientRect();

  // adjust vertically
  if (top + this.targetElement.offsetHeight > window.innerHeight) {
    top = window.innerHeight - this.targetElement.offsetHeight - this.offset;
  }
  if (top < this.offset) {
    top = this.offset;
  }

  // adjust horizontally
  if (left + this.targetElement.offsetWidth > window.innerWidth) {
    left = window.innerWidth - this.targetElement.offsetWidth - this.offset;
  }
  if (left < this.offset) {
    left = this.offset;
  }

  // alignment: "start" = align left edge, "end" = align right edge
  if (this.alignment === "end") {
    left = rect.right - this.targetElement.offsetWidth;
    // clamp after alignment
    if (left < this.offset) left = this.offset;
  }

  this.targetElement.style.top = `${Math.round(top)}px`;
  this.targetElement.style.left = `${Math.round(left)}px`;
}
}

acRegisterCustomElement({ tag: AC_DROPDOWN_TAG.dropdown, type: AcDropdown });
