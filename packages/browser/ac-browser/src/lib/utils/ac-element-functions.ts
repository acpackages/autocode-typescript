/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { arrayRemove } from "@autocode-ts/ac-extensions";
import { AC_DOM_EVENT_TYPES } from "../consts/ac-dom-event-typess.const";
import { acDelayedCallback } from "@autocode-ts/autocode";

/* eslint-disable @typescript-eslint/no-unused-vars */
export function acAddClassToElement({ class_, element }: { class_: string, element: Element }) {
  const classList: string[] = class_.trim().split(" ")
  for (const className of classList) {
    element.classList.add(className);
  }
}

export function acAnimateElement(
  element: HTMLElement,
  property: string,
  from: string | number,
  to: string | number,
  duration: number = 300,
  callback?: () => void
) {
  const start = performance.now();
  const fromValue = typeof from === "number" ? from : parseFloat(from);
  const toValue = typeof to === "number" ? to : parseFloat(to);
  const unit = typeof from === "string" && /[a-z%]+$/i.test(from) ? from.replace(/[0-9.\-]+/g, "") : "";

  function step(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    const currentValue = fromValue + (toValue - fromValue) * progress;
    element.style.setProperty(property, currentValue + unit);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      if (callback) callback();
    }
  }

  requestAnimationFrame(step);
}

export function acCloneEvent(oldEvent: Event|any): Event|any {
  const newEvent = new (oldEvent.constructor as any)(oldEvent.type, {
    bubbles: oldEvent.bubbles,
    cancelable: oldEvent.cancelable,
    composed: oldEvent.composed,
    detail:oldEvent.detail
  });

  // Copy standard properties
  for (const key of Object.keys(oldEvent)) {
    try {
      (newEvent as any)[key] = (oldEvent as any)[key];
    } catch {
      //
    }
  }

  return newEvent;
}

export function acCopyElementStyles({ fromElement, toElement }: { fromElement: HTMLElement, toElement: HTMLElement }) {
  const computed: any = window.getComputedStyle(fromElement);
  for (const key of computed) {
    try {
      toElement.style.setProperty(key, computed.getPropertyValue(key), computed.getPropertyPriority(key));
    } catch {
      // Ignore read-only or invalid style properties
    }
  }
}

export function acCreateDocumentFragmentFromHtml({html}:{html: string}): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.cloneNode(true) as DocumentFragment;
};

export function acCreateElementFromHtml({html}:{html: string}): HTMLElement | null {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  const el = template.content.firstElementChild;
  return el instanceof HTMLElement ? el : null;
}

export function acClearElement({element}:{element:HTMLElement}):void{
  for(let el of Array.from(element.childNodes)){
    acClearElement({element:el as HTMLElement});
    el.remove();
    (el as any) = null;
  }
  element.innerHTML = "";
}

export function acDestroyElement(el: HTMLElement) {
  let clone = el.cloneNode(true) as HTMLElement;
  el.replaceWith(clone);
  clone.remove();
  (clone as any) = null;
  return null; // drop reference
}

export function acCreateValidityState(flags: Partial<ValidityState> = {}): any {
  return {
    valueMissing: false,
    typeMismatch: false,
    patternMismatch: false,
    tooLong: false,
    tooShort: false,
    rangeUnderflow: false,
    rangeOverflow: false,
    stepMismatch: false,
    badInput: false,
    customError: false,
    valid: Object.keys(flags).length === 0,
    ...flags,
  };
}

export function acElementHasParentTag({ element, tag }: { element: HTMLElement, tag: string }): boolean {
  tag = tag.toLowerCase(); // normalize for comparison
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName.toLowerCase() == tag) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

export function acGetParentElementWithTag({ element, tag }: { element: HTMLElement, tag: string }): HTMLElement|null {
  tag = tag.toLowerCase(); // normalize for comparison
  let parent = element.parentElement;
  while (parent) {
    if (parent.tagName.toLowerCase() == tag) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export function acHideElement({
  element,
  animateHeight = false,
  animateWidth = false,
  duration = 300,
}: {
  element: HTMLElement;
  animateHeight?: boolean;
  animateWidth?: boolean;
  duration?: number;
}) {
  const computed = getComputedStyle(element);

  const originalStyles: any = {
    opacity: element.style.opacity || computed.opacity,
    display: element.style.display || computed.display,
  };

  // Handle height
  if (animateHeight) {
    originalStyles.height = element.style.height ? element.style.height : "auto";
    const currentHeight = computed.height;
    acAnimateElement(element, "height", currentHeight, 0, duration);
  }

  // Handle width
  if (animateWidth) {
    originalStyles.width = element.style.width ? element.style.width : "auto";
    const currentWidth = computed.width;
    acAnimateElement(element, "width", currentWidth, 0, duration);
  }

  element.setAttribute(
    "ac-show-original-style-values",
    JSON.stringify(originalStyles)
  );

  // Animate opacity
  acAnimateElement(
    element,
    "opacity",
    originalStyles.opacity,
    0,
    duration,
    () => {
      element.style.display = "none";
    }
  );
}

export function acIsElementVisibleInContainer({element,container}:{element: HTMLElement, container: HTMLElement}) {
   const elTop = element.offsetTop;
  const elBottom = elTop + element.offsetHeight;

  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;
  const isVisible =
   (
    elTop >= containerTop &&
    elBottom <= containerBottom
  );
  return isVisible;
}

export function acLinkElementScroll({ source, destination, both = true }: { source: HTMLElement, destination: HTMLElement, both?: boolean }) {
  source.addEventListener('wheel', e => {
    source.scrollLeft += e.deltaX;
    destination.scrollLeft = source.scrollLeft;
  }, { passive: true });

  source.addEventListener('scroll', (e) => {
    e.preventDefault();
    if (destination.scrollLeft !== source.scrollLeft){
      destination.scrollLeft = source.scrollLeft;
    }
  });

  if (both) {
    acLinkElementScroll({ source: destination, destination: source, both: false });
  }
}

export function acListenElementEvents(options: {
  element: HTMLElement;
  callback: ({ name, event }: { name: string, event: Event }) => void;
  mouse?: boolean;
  pointer?: boolean;
  touch?: boolean;
  keyboard?: boolean;
  focus?: boolean;
  form?: boolean;
  clipboard?: boolean;
  drag?: boolean;
  media?: boolean;
  animation?: boolean;
  viewport?: boolean;
  window?: boolean;
  network?: boolean;
  fullscreen?: boolean;
  history?: boolean;
  websocket?: boolean;
  serviceWorker?: boolean;
  worker?: boolean;
  mutationDeprecated?: boolean;
  exclude?:string[]
}) {
  const { element, callback, ...flags } = options;

  const categories = Object.keys(AC_DOM_EVENT_TYPES) as (keyof typeof AC_DOM_EVENT_TYPES)[];

  // check if user enabled any category
  const anySelected = categories.some(c => flags[c] === true);

  // build final list of events
  let events: string[] = [];

  for (const category of categories) {
    if (anySelected) {
      if (flags[category]) {
        events.push(...AC_DOM_EVENT_TYPES[category]);
      }
    } else {
      // none selected => include all categories
      events.push(...AC_DOM_EVENT_TYPES[category]);
    }
  }

  if(options.exclude){
    for(const event of options.exclude){
      if(events.includes(event)){
        events = arrayRemove(events,event);
      }
    }
  }

  // attach listeners
  const handlers: { [event: string]: (ev: Event) => void } = {};

  for (const eventName of events) {
    const handler = (ev: Event) => callback({name:eventName,event: ev});
    handlers[eventName] = handler;
    element.addEventListener(eventName, handler,{passive:true});
  }

  // return unsubscribe function
  return () => {
    for (const eventName of events) {
      element.removeEventListener(eventName, handlers[eventName]);
    }
  };
}

export function acMorphElement({ source, destination, sourceColor, destinationColor, duration = 300 }: { source: HTMLElement, destination: HTMLElement, sourceColor?: string; destinationColor?: string; duration?: number }): void {
  // Get bounding client rectangles
  const sourceRect = source.getBoundingClientRect();
  const destRect = destination.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Clone both source and destination elements
  const sourceClone: HTMLElement = source.cloneNode(true) as HTMLElement;
  const destClone: HTMLElement = destination.cloneNode(true) as HTMLElement;

  // Style source clone to match source initially
  Object.assign(sourceClone.style, {
    position: "fixed",
    left: `${sourceRect.x + scrollX}px`,
    top: `${sourceRect.y + scrollY}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "9999",
    transition: `all ${duration}ms ease-in-out`,
    opacity: "1",
  });
  if (sourceColor) {
    acClearElement({element:sourceClone});
    sourceClone.style.background = `${sourceColor}!important`;
  }


  // Style destination clone to match source initially
  Object.assign(destClone.style, {
    position: "fixed",
    left: `${sourceRect.x}px`,
    top: `${sourceRect.y}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    margin: "0",
    pointerEvents: "none",
    zIndex: "9998",
    transition: `all ${duration}ms ease-in-out`,
    opacity: "0",
  });
  if (destinationColor) {
    acClearElement({element:destClone});
    destClone.style.background = `${destinationColor}!important`;
  }

  // Append clones to body
  document.body.appendChild(sourceClone);
  document.body.appendChild(destClone);

  // Force reflow to ensure transition starts
  void sourceClone.offsetHeight;
  void destClone.offsetHeight;

  // Animate source clone → fade out and move
  Object.assign(sourceClone.style, {
    left: `${destRect.x}px`,
    top: `${destRect.y}px`,
    width: `${destRect.width}px`,
    height: `${destRect.height}px`,
    opacity: "0",
  });

  // Animate destination clone → move & resize naturally, fade in
  Object.assign(destClone.style, {
    left: `${destRect.x}px`,
    top: `${destRect.y}px`,
    width: `${destRect.width}px`,
    height: `${destRect.height}px`,
    opacity: "1",
  });

  // Cleanup after animation
  acDelayedCallback.add({callback:() => {
    sourceClone.remove();
    destClone.remove();
  }, duration});
}

export function acRegisterCustomElement({ tag, type }: { tag: string, type: any }) {
  if (customElements.get(tag) == undefined) {
    customElements.define(tag, type);
  }
}

export function acRemoveClassFromElement({ class_, element }: { class_: string, element: Element }) {
  const classList: string[] = class_.trim().split(" ")
  for (const className of classList) {
    element.classList.remove(className);
  }
}

export function acScrollIntoViewIfHidden({ element, behavior = 'smooth' }: { element: HTMLElement, behavior?: ScrollBehavior }) {
  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const canScrollY = overflowY === 'auto' || overflowY === 'scroll';
    const canScrollX = overflowX === 'auto' || overflowX === 'scroll';

    if (canScrollY || canScrollX) {
      const elRect = element.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();

      const fullyVisible =
        elRect.top >= parentRect.top &&
        elRect.bottom <= parentRect.bottom &&
        elRect.left >= parentRect.left &&
        elRect.right <= parentRect.right;

      if (!fullyVisible) {
        element.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' });
      }

      return; // Stop at the first scrollable ancestor
    }

    parent = parent.parentElement;
  }

  // No scrollable ancestor found — fallback to window
  const rect = element.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;

  const fullyVisible =
    rect.top >= 0 &&
    rect.bottom <= viewHeight &&
    rect.left >= 0 &&
    rect.right <= viewWidth;

  if (!fullyVisible) {
    element.scrollIntoView({ behavior, block: 'nearest', inline: 'nearest' });
  }
}

export function acSetElementAttributes({ attributes, element }: { attributes: any, element: Element }) {
  for (const attributeName of Object.keys(attributes)) {
    element.setAttribute(attributeName, attributes[attributeName]);
  }
}

export function acSwapElementsWithAnimation({
  element1,
  element2,
  duration = 300,
  suppressElement1Animation = false,
  suppressElement2Animation = false,
  onComplete
}: {
  element1: HTMLElement;
  element2: HTMLElement;
  duration?: number;
  suppressElement1Animation?: boolean;
  suppressElement2Animation?: boolean;
  onComplete?: () => void;
}) {
  if (!element1 || !element2 || element1 === element2) return;

  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  const parent1 = element1.parentElement!;
  const parent2 = element2.parentElement!;

  // Create placeholders with same size
  const placeholder1 = element1.cloneNode(true) as HTMLElement;
  const placeholder2 = element2.cloneNode(true) as HTMLElement;

  acCopyElementStyles({ fromElement: element1, toElement: placeholder1 });
  acCopyElementStyles({ fromElement: element2, toElement: placeholder2 });

  placeholder1.style.visibility = "hidden";
  placeholder2.style.visibility = "hidden";

  parent1.replaceChild(placeholder1, element1);
  parent2.replaceChild(placeholder2, element2);

  // Create absolutely positioned clones for animation
  const anim1 = element1.cloneNode(true) as HTMLElement;
  const anim2 = element2.cloneNode(true) as HTMLElement;

  acCopyElementStyles({ fromElement: element1, toElement: anim1 });
  acCopyElementStyles({ fromElement: element2, toElement: anim2 });

  document.body.appendChild(anim1);
  document.body.appendChild(anim2);

  Object.assign(anim1.style, {
    position: "fixed",
    top: `${rect1.top}px`,
    left: `${rect1.left}px`,
    width: `${rect1.width}px`,
    height: `${rect1.height}px`,
    margin: "0",
    zIndex: 9999,
    transition: suppressElement1Animation ? "none" : `transform ${duration}ms ease`,
    pointerEvents: "none"
  });

  Object.assign(anim2.style, {
    position: "fixed",
    top: `${rect2.top}px`,
    left: `${rect2.left}px`,
    width: `${rect2.width}px`,
    height: `${rect2.height}px`,
    margin: "0",
    zIndex: 9999,
    transition: suppressElement2Animation ? "none" : `transform ${duration}ms ease`,
    pointerEvents: "none"
  });

  // Start animations
  requestAnimationFrame(() => {
    if (!suppressElement1Animation)
      anim1.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top}px)`;

    if (!suppressElement2Animation)
      anim2.style.transform = `translate(${rect1.left - rect2.left}px, ${rect1.top - rect2.top}px)`;
  });

  // After animation, do the real swap
  acDelayedCallback.add({callback:() => {
    placeholder1.replaceWith(element2);
    placeholder2.replaceWith(element1);
    anim1.remove();
    anim2.remove();
    onComplete?.();
  }, duration});
}

export function acShowElement({
  element,
  duration = 300,
}: {
  element: HTMLElement;
  duration?: number;
}) {
  const stored = element.getAttribute("ac-show-original-style-values");
  if (!stored) return;
  element.removeAttribute("ac-show-original-style-values");

  const originalStyles = JSON.parse(stored);
  element.style.display = originalStyles.display;

  // Animate opacity back
  acAnimateElement(element, "opacity", 0, originalStyles.opacity, duration);

  // Handle height
  if (originalStyles.height) {
    if (originalStyles.height === "auto") {
      const targetHeight = element.scrollHeight + "px";
      acAnimateElement(element, "height", "0px", targetHeight, duration, () => {
        element.style.height = ""; // reset back to auto
      });
    } else {
      acAnimateElement(element, "height", "0px", originalStyles.height, duration);
    }
  }

  // Handle width
  if (originalStyles.width) {
    if (originalStyles.width === "auto") {
      const targetWidth = element.scrollWidth + "px";
      acAnimateElement(element, "width", "0px", targetWidth, duration, () => {
        element.style.width = ""; // reset back to auto
      });
    } else {
      acAnimateElement(element, "width", "0px", originalStyles.width, duration);
    }
  }
}

export function acWrapElementWithTag({ element, wrapperTag = "div" }: { element: HTMLElement, wrapperTag: string }): HTMLElement {
  const wrapper = document.createElement(wrapperTag);
  if (element.isConnected && element.parentNode) {
    element.parentNode.insertBefore(wrapper, element);
  }
  wrapper.appendChild(element);
  return wrapper;
}







