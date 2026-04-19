/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDelayedCallback, Autocode } from "@autocode-ts/autocode";
import { IAcScrollableOptions } from "../interfaces/ac-scrollable-options.inteface";
import { IAcScrollingElement } from "../interfaces/ac-scrolling-element.interface";
import { AcScrollableAttributeName } from "../consts/ac-scrollable-attribute-name.const";

export class AcScrollable {
  private element: HTMLElement;
  private elementHeight: number;
  private elementHeightFallback: number;
  private elementResizeObserver!: ResizeObserver;
  private mutationObserver!: MutationObserver;
  private options?: IAcScrollableOptions;
  private resizeObserver!: ResizeObserver;
  private renderedElements: IAcScrollingElement[] = [];
  private scrollingElements: IAcScrollingElement[] = [];
  private scrollTop = 0;
  private isRendering: boolean = false;
  private isWorking: boolean = true;
  private delayedCallback: AcDelayedCallback = new AcDelayedCallback();
  private items: any[] = [];
  private heightCache = new Map<any, number>();
  private heights: number[] = [];

  constructor({ element, options = {} }: { element: HTMLElement, options?: IAcScrollableOptions }) {
    this.element = element;
    this.options = options;
    this.elementHeight = element.clientHeight;
    this.elementHeightFallback = options.elementHeight ?? 50;
    this.element.style.overflowY = "auto";
    this.element.addEventListener("scroll", () => this.handleScroll());
    if (this.element.children.length > 0) {
      this.registerExistingElements();
    }
    this.initObservers();
  }

  setItems(items: any[]) {
    this.items = items;
    this.updateHeights();
    this.render();
  }

  addItem(item: any) {
    if (item instanceof HTMLElement) {
      this.addElement({ element: item });
    } else {
      this.items.push(item);
      this.updateHeights();
      this.render();
    }
  }

  addElement({ element }: { element: HTMLElement }) {
    const temp = element.cloneNode(true) as HTMLElement;
    temp.style.visibility = "hidden";
    temp.style.position = "absolute";
    temp.style.top = "-10000px";
    this.element.appendChild(temp);
    const height = temp.offsetHeight || this.elementHeightFallback;
    this.element.removeChild(temp);
    this.registerScrollingElement({ element: element, height: height });
    this.render();
  }

  private updateHeights() {
    if (this.options?.enableFixedHeight && this.options?.itemSize) {
      this.heights = new Array(this.items.length).fill(this.options.itemSize);
      return;
    }

    this.heights = this.items.map((item, index) => {
      if (this.heightCache.has(item)) {
        return this.heightCache.get(item)!;
      }
      const height = this.measureItemHeight(item, index);
      this.heightCache.set(item, height);
      return height;
    });
  }

  private measureItemHeight(item: any, index: number): number {
    if (this.options?.itemSize) return this.options.itemSize;
    if (!this.options?.itemTemplate) return this.elementHeightFallback;

    const element = this.options.itemTemplate(item, index);
    const temp = element.cloneNode(true) as HTMLElement;
    temp.style.visibility = "hidden";
    temp.style.position = "absolute";
    temp.style.top = "-10000px";
    temp.style.width = this.element.clientWidth + "px";
    this.element.appendChild(temp);
    const height = temp.offsetHeight || this.elementHeightFallback;
    this.element.removeChild(temp);
    return height;
  }

  private getVisibleRange() {
    const totalCount = this.items.length > 0 ? this.items.length : this.scrollingElements.length;
    if (totalCount === 0) return { startIndex: 0, endIndex: -1 };

    const heights = this.items.length > 0 ? this.heights : this.scrollingElements.map(el => el.height);

    let startIndex = 0;
    let y = 0;
    for (let i = 0; i < heights.length; i++) {
      if (y + heights[i] >= this.scrollTop) {
        startIndex = i;
        break;
      }
      y += heights[i];
    }

    let endIndex = startIndex;
    y = 0;
    for (let i = startIndex; i < heights.length; i++) {
      y += heights[i];
      if (y >= this.elementHeight) {
        endIndex = i;
        break;
      }
    }

    let buffer: number = this.options?.bufferCount ?? 2;
    startIndex = Math.max(0, startIndex - buffer);
    endIndex = Math.min(totalCount - 1, endIndex + buffer);

    return { startIndex, endIndex };
  }

  private handleScroll() {
    if (this.isWorking) {
      this.scrollTop = this.element.scrollTop;
      this.render();
    }
  }

  private initObservers() {
    this.mutationObserver = new MutationObserver((mutations) => {
      if (!this.isRendering && this.items.length === 0) {
        let needsRender = false;
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                if (!node.hasAttribute(AcScrollableAttributeName.acScrollingElementId) && !node.hasAttribute(AcScrollableAttributeName.acScrollingSpacer)) {
                  const height = node.offsetHeight || this.elementHeightFallback;
                  this.registerScrollingElement({ element: node, height });
                  needsRender = true;
                }
              }
            });
            mutation.removedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                const id = node.getAttribute(AcScrollableAttributeName.acScrollingElementId);
                if (id) {
                  this.scrollingElements = this.scrollingElements.filter(el => el.id !== id);
                  this.resizeObserver.unobserve(node);
                  needsRender = true;
                }
              }
            });
          }
        }
        if (needsRender) {
          this.render();
        }
      }
    });
    this.mutationObserver.observe(this.element, { childList: true });
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!this.isRendering && this.items.length === 0) {
        let needsRender = false;
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const id = target.getAttribute(AcScrollableAttributeName.acScrollingElementId);
          if (id) {
            const se = this.scrollingElements.find(el => el.id === id);
            if (se) {
              const newHeight = target.offsetHeight || this.elementHeightFallback;
              if (se.height !== newHeight) {
                se.height = newHeight;
                needsRender = true;
              }
            }
          }
        }
        if (needsRender) {
          this.render();
        }
      }
    });
    this.elementResizeObserver = new ResizeObserver(() => {
      const newHeight = this.element.clientHeight;
      if (this.elementHeight != newHeight) {
        this.elementHeight = newHeight;
        this.render();
      }
    });
    this.elementResizeObserver.observe(this.element);
    this.scrollingElements.forEach(el => {
      this.resizeObserver.observe(el.element);
    });
  }

  moveElement({ fromIndex, toIndex }: { fromIndex: number, toIndex: number }) {
    if (this.items.length > 0) {
      if (fromIndex < 0 || fromIndex >= this.items.length || toIndex < 0 || toIndex >= this.items.length) return;
      const [moved] = this.items.splice(fromIndex, 1);
      this.items.splice(toIndex, 0, moved);
      const [movedHeight] = this.heights.splice(fromIndex, 1);
      this.heights.splice(toIndex, 0, movedHeight);
    } else {
      if (fromIndex < 0 || fromIndex >= this.scrollingElements.length || toIndex < 0 || toIndex >= this.scrollingElements.length) return;
      const [moved] = this.scrollingElements.splice(fromIndex, 1);
      this.scrollingElements.splice(toIndex, 0, moved);
      this.reindexScrollingElements();
    }
    this.render();
  }

  private registerScrollingElement(data: Partial<IAcScrollingElement> & Pick<IAcScrollingElement, 'element' | 'height'>) {
    if (this.scrollingElements.findIndex((item: any) => { return item.element == data.element; }) == -1) {
      const id: string = Autocode.uuid();
      data.element.setAttribute(AcScrollableAttributeName.acScrollingElementId, id);
      if (data.index == undefined) {
        data.index = this.scrollingElements.length;
      }
      const scrollingElement: IAcScrollingElement = {
        element: data.element,
        id: id,
        index: data.index,
        height: data.height
      };
      this.scrollingElements.push(scrollingElement);
      if (this.resizeObserver) {
        this.resizeObserver.observe(data.element);
      }
    }
  }

  registerExistingElements() {
    const children = Array.from(this.element.children) as HTMLElement[];
    this.scrollingElements = [];
    children.forEach((el, index) => {
      if (!el.hasAttribute(AcScrollableAttributeName.acScrollingSpacer)) {
        const height = el.offsetHeight || this.elementHeightFallback;
        this.registerScrollingElement({ element: el, height: height, index: index });
      }
    });
    this.element.innerHTML = '';
    this.render();
  }

  private reindexScrollingElements() {
    this.scrollingElements.forEach((se, idx) => {
      se.index = idx;
    });
  }

  removeElement({ element, id, index }: { index?: number, id?: string, element?: HTMLElement }) {
    if (this.items.length > 0) {
      if (index === undefined && element) {
        index = this.items.indexOf(element);
      }
      if (index !== undefined && index >= 0 && index < this.items.length) {
        this.items.splice(index, 1);
        this.heights.splice(index, 1);
        this.render();
      }
      return;
    }

    if (index == undefined && element) {
      index = this.scrollingElements.findIndex(se => se.element === element);
    }
    else if (index == undefined && id) {
      index = this.scrollingElements.findIndex(se => se.id === id);
    }
    if (index != undefined) {
      const removed = this.scrollingElements.splice(index, 1)[0];
      if (removed) {
        this.resizeObserver.unobserve(removed.element);
        removed.element.remove();
        this.reindexScrollingElements();
        this.render();
      }
    }
  }

  private render() {
    this.isRendering = true;
    const { startIndex, endIndex } = this.getVisibleRange();
    this.element.innerHTML = "";

    const heights = this.items.length > 0 ? this.heights : this.scrollingElements.map(el => el.height);

    const topSpacer = document.createElement("div");
    topSpacer.style.height = heights.slice(0, startIndex).reduce((sum, h) => sum + h, 0) + "px";
    topSpacer.setAttribute(AcScrollableAttributeName.acScrollingSpacer, '');
    topSpacer.setAttribute(AcScrollableAttributeName.acScrollingSpacerBefore, '');
    this.element.appendChild(topSpacer);

    this.renderedElements = [];
    if (this.items.length > 0 && this.options?.itemTemplate) {
      for (let i = startIndex; i <= endIndex; i++) {
        const el = this.options.itemTemplate(this.items[i], i);
        this.element.appendChild(el);
      }
    } else {
      for (let i = startIndex; i <= endIndex; i++) {
        if (this.scrollingElements[i]) {
          this.renderedElements.push(this.scrollingElements[i]);
          this.element.appendChild(this.scrollingElements[i].element);
        }
      }
    }

    const bottomSpacer = document.createElement("div");
    bottomSpacer.setAttribute(AcScrollableAttributeName.acScrollingSpacer, '');
    bottomSpacer.setAttribute(AcScrollableAttributeName.acScrollingSpacerAfter, '');
    bottomSpacer.style.height = heights.slice(endIndex + 1).reduce((sum, h) => sum + h, 0) + "px";
    this.element.appendChild(bottomSpacer);

    this.delayedCallback.add({
      callback: () => {
        this.isRendering = false;
      }, duration: 10
    });
  }

  replaceElementAt({ index, newElement }: { index: number, newElement: any }) {
    if (this.items.length > 0) {
      if (index < 0 || index >= this.items.length) return;
      this.items[index] = newElement;
      this.updateHeights();
      this.render();
      return;
    }

    if (index < 0 || index >= this.scrollingElements.length) return;
    const old = this.scrollingElements[index];
    this.resizeObserver.unobserve(old.element);
    const height = newElement.offsetHeight || this.elementHeightFallback;
    this.scrollingElements[index] = {
      ...old,
      element: newElement,
      height
    };
    this.resizeObserver.observe(newElement);
    this.render();
  }

  scrollTo({ element, index }: { index?: number, element?: HTMLElement }) {
    const heights = this.items.length > 0 ? this.heights : this.scrollingElements.map(el => el.height);
    const totalCount = this.items.length > 0 ? this.items.length : this.scrollingElements.length;

    if (index == undefined && element) {
      index = this.items.length > 0 ? this.items.indexOf(element) : this.scrollingElements.findIndex(se => se.element === element);
    }

    if (index != undefined) {
      if (index < 0 || index >= totalCount) return;
      const scrollY = heights.slice(0, index).reduce((sum, h) => sum + h, 0);
      this.element.scrollTop = scrollY;
      this.render();
    }
  }

  clearAll() {
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.elementResizeObserver) this.elementResizeObserver.disconnect();

    this.element.innerHTML = "";
    this.renderedElements = [];
    this.scrollingElements = [];
    this.items = [];
    this.heightCache.clear();
    this.heights = [];

    this.isRendering = false;
    this.initObservers();
  }

  /**
   * Pauses detection of new elements and size changes.
   * Keeps existing scrollable data intact.
   */
  pause() {
    this.isWorking = false;
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.elementResizeObserver) this.elementResizeObserver.disconnect();
  }

  /**
   * Resumes detection of new elements and size changes.
   * Reconnects all observers.
   */
  resume() {
    this.isWorking = true;
    this.initObservers();
  }

  /**
   * Automatically registers any child elements
   * that are not yet registered as scrolling elements.
   */
  autoRegister() {
    const children = Array.from(this.element.children) as HTMLElement[];
    const existingIds = new Set(this.scrollingElements.map(el => el.id));

    children.forEach((el) => {
      const id = el.getAttribute(AcScrollableAttributeName.acScrollingElementId);
      if (!id || !existingIds.has(id)) {
        const height = el.offsetHeight || this.elementHeightFallback;
        this.registerScrollingElement({ element: el, height });
      }
    });

    this.render();
  }

}
