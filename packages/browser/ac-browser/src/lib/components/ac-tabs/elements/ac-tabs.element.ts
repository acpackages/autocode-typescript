/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AcEvents, Autocode } from "@autocode-ts/autocode";
import { AcTabsAttributeName } from "../consts/ac-tabs-attribute-name.const";
import { AcTabsCssClassName } from "../consts/ac-tabs-css-class-name.const";
import { IAcTabsOptions } from "../interfaces/ac-tabs-options.interface";
import { AcTabsEvent } from "../enums/ac-tabs-event.enum";
import { acAddClassToElement, acRegisterCustomElement, acRemoveClassFromElement } from "../../../utils/ac-element-functions";
import { AC_TABS_TAG } from "../_ac-tabs.export";
import { AcElementBase } from "../../../core/ac-element-base";

export class AcTabs extends AcElementBase{
  get loop(): boolean{
    return this.getAttribute('loop') != 'false';
  }
  set loop(value:boolean){
    this.setAttribute('loop',`${value}`);
  }

  get preventScrollOnHash(): boolean{
    return this.getAttribute('prevent-scroll-on-hash') == 'true';
  }
  set preventScrollOnHash(value:boolean){
    this.setAttribute('prevent-scroll-on-hash',`${value}`);
  }

  get updateHash(): boolean{
    return this.getAttribute('update-hash') == 'true';
  }
  set updateHash(value:boolean){
    this.setAttribute('update-hash',`${value}`);
  }

  private tabsList?: HTMLElement;
  private tabs: HTMLElement[] = [];
  private tabPanes: HTMLElement[] = [];
  private currentIndex = -1;
  private boundClick?: (e: Event) => void;
  private boundKeydown?: (e: KeyboardEvent) => void;

  override init() {
    super.init();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'tablist');
    const tabs = Array.from(this.querySelectorAll(`.${AcTabsCssClassName.acTab}, [${AcTabsAttributeName.acTab}]`));
    for (const el of tabs) {
      this.registerTabElement({ element: el as HTMLElement });
    }
    const tabPanes = Array.from(this.querySelectorAll(`[${AcTabsAttributeName.acTabPane}]`));
    for (const el of tabPanes) {
      this.registerTabPaneElement({ element: el as HTMLElement });
    }
    if (this.tabs.length === 0 || this.tabPanes.length === 0) return;
    const initial = this.resolveIndexFromHash() ?? this.findFirstEnabledIndex();
    this.show({ target: initial, options: { skipFocus: true, skipIfSame: true } });
  }

  private activate({ index = -1, options = {} }: { index?: number, options?: { skipFocus?: boolean; programmatic?: boolean; skipIfSame?: boolean } } = {}) {
    if (index < 0 || index >= this.tabs.length) return;
    if (options.skipIfSame && index === this.currentIndex) return;
    const newTab = this.tabs[index];
    const isDisabled =
      newTab.classList.contains('disabled') ||
      newTab.getAttribute('aria-disabled') === 'true' ||
      (newTab as any).disabled === true;
    if (isDisabled) return;
    const oldIndex = this.currentIndex;
    const oldTab = this.tabs[oldIndex] || null;
    const newPane = this.getPaneForTab({ tab: newTab });
    const oldPane = oldTab ? this.getPaneForTab({ tab: oldTab }) : null;
    this.events.execute({ event: AcTabsEvent.TabBeforeShow, args: { from: oldIndex, to: index, oldTab, newTab, oldPane, newPane } });
    if (oldTab) {
      acRemoveClassFromElement({ element: oldTab, class_: AcTabsCssClassName.acTabActive });
      oldTab.setAttribute('aria-selected', 'false');
      oldTab.setAttribute('tabindex', '-1');
    }
    if (oldPane) {
      acRemoveClassFromElement({ element: oldTab, class_: AcTabsCssClassName.acTabPaneActive });
      this.hidePane({ pane: oldPane });
    }
    acAddClassToElement({ element: newTab, class_: AcTabsCssClassName.acTabActive });
    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');
    if (!options.skipFocus) newTab.focus();
    if (newPane){
      acAddClassToElement({ element: newPane, class_: AcTabsCssClassName.acTabPaneActive });
      this.showPane({ pane: newPane });
    }
    this.currentIndex = index;
    if (this.updateHash) {
      const paneId = newPane?.id;
      if (paneId) {
        const method = this.preventScrollOnHash ? 'replaceState' : 'pushState';
        try {
          history[method](null, '', `#${paneId}`);
        } catch {
          location.hash = paneId;
        }
      }
    }
    this.events.execute({ event: AcTabsEvent.TabShow, args: { from: oldIndex, to: index, oldTab, newTab, oldPane, newPane } });
    this.events.execute({ event: AcTabsEvent.TabChange, args: { index, tab: newTab, pane: newPane } });
  }

  override destroy() {
    if (this.boundClick) this.removeEventListener('click', this.boundClick);
    if (this.boundKeydown)
      this.removeEventListener('keydown', this.boundKeydown);

    super.destroy();
  }

  public enable({ target, enable = true }: { target: number | string | HTMLElement, enable?: boolean }) {
    const i = this.resolveIndex({ target });
    if (i < 0) return;
    const tab = this.tabs[i];
    tab.setAttribute('aria-disabled', (!enable).toString());
    tab.classList.toggle('disabled', !enable);
    (tab as any).disabled = !enable;
  }

  private ensureId({ element }: { element: HTMLElement }) {
    if (!element.id) element.id = Autocode.uniqueId();
    return element.id;
  }

  private findFirstEnabledIndex() {
    return this.tabs.findIndex((t) => !this.isDisabled({ tab: t }));
  }

  private findLastEnabledIndex() {
    for (let i = this.tabs.length - 1; i >= 0; i--) {
      if (!this.isDisabled({ tab: this.tabs[i] })) return i;
    }
    return -1;
  }

  private findTabIdForPane({ paneId }: { paneId: string }) {
    const tab = this.tabs.find((t) => this.getTargetIdFromTab({ tab: t }) === paneId) as HTMLElement | undefined;
    return tab ? this.ensureId({ element: tab }) : null;
  }

  public getActiveIndex() {
    return this.currentIndex;
  }

  private getPaneForTab({ tab }: { tab: HTMLElement }): HTMLElement | null {
    const id = this.getTargetIdFromTab({ tab });
    if (!id) return null;
    return this.tabPanes.find((p) => p.id === id) ?? null;
  }

  private getTargetIdFromTab({ tab }: { tab: HTMLElement }): string | null {
    const targetQuery = tab.getAttribute('ac-tab-target');
    if (targetQuery && targetQuery.startsWith("#")){
      return targetQuery.replace('#', '')
    }
    else if(targetQuery){
      const targetElement = this.querySelector(targetQuery);
      if(targetElement){
        return this.ensureId({element:targetElement as HTMLElement});
      }
    }
    if (tab instanceof HTMLAnchorElement && tab.hash) return tab.hash.replace('#', '');

    const controls = tab.getAttribute('aria-controls');
    if (controls) return controls.replace('#', '');

    return null;
  }

  private hidePane({ pane, immediate = false }: { pane: HTMLElement, immediate?: boolean }) {
    const useFade = pane.classList.contains('fade');
    if (useFade && !immediate) {
      pane.classList.remove('show');
      const onEnd = (e: Event) => {
        if (e.target !== pane) return;
        pane.removeEventListener('transitionend', onEnd);
        pane.classList.remove('active');
        pane.setAttribute('hidden', 'true');
        pane.setAttribute('aria-hidden', 'true');
      };
      pane.addEventListener('transitionend', onEnd, { once: true });
    } else {
      pane.classList.remove('show', 'active');
      pane.setAttribute('hidden', 'true');
      pane.setAttribute('aria-hidden', 'true');
    }
  }

  private isDisabled({ tab }: { tab: HTMLElement }) {
    return (
      tab.classList.contains('disabled') ||
      tab.getAttribute('aria-disabled') === 'true' ||
      (tab as any).disabled === true
    );
  }

  private isHorizontal() {
    const orient =
      (this.tabsList?.getAttribute('aria-orientation') ||
        this.tabsList?.getAttribute('data-orientation') ||
        'horizontal') as 'horizontal' | 'vertical';
    return orient !== 'vertical';
  }

  public next() {
    const idx = this.nextEnabledIndex({ start: this.currentIndex + 1 });
    if (idx !== -1) this.activate({ index: idx, options: { programmatic: true } });
  }

  private nextEnabledIndex({ start, wrap = this.loop }: { start: number, wrap?: boolean }) {
    for (let i = 0; i < this.tabs.length; i++) {
      const idx = (start + i) % this.tabs.length;
      if (!this.isDisabled({ tab: this.tabs[idx] })) return idx;
      if (!wrap && start + i >= this.tabs.length) break;
    }
    return -1;
  }

  public prev() {
    const idx = this.previousEnabledIndex({ start: this.currentIndex - 1 });
    if (idx !== -1) this.activate({ index: idx, options: { programmatic: true } });
  }

  private previousEnabledIndex({ start, wrap = this.loop }: { start: number, wrap?: boolean }) {
    for (let i = 0; i < this.tabs.length; i++) {
      const idx = ((start - i) % this.tabs.length + this.tabs.length) % this.tabs.length;
      if (!this.isDisabled({ tab: this.tabs[idx] })) return idx;
      if (!wrap && start - i < 0) break;
    }
    return -1;
  }

  registerTabElement({ element, index = -1 }: { element: HTMLElement, index?: number }) {
    if (!element.hasAttribute(AcTabsAttributeName.acTabPaneRegistered)) {
      element.setAttribute(AcTabsAttributeName.acTabRegistered, "true");
      if (!this.hasAttribute(AcTabsAttributeName.acTabId)) {
        const id = Autocode.uuid();
        element.setAttribute(AcTabsAttributeName.acTabId, id);
      }
      if (index == -1) {
        index = this.tabs.length;
      }
      element.setAttribute('role', 'tab');
      element.setAttribute('tabindex', index === 0 ? '0' : '-1');
      const paneId = this.getTargetIdFromTab({ tab: element });
      if (paneId) element.setAttribute('aria-controls', paneId);
      const isDisabled = element.classList.contains('disabled') ||
        element.getAttribute('aria-disabled') === 'true' ||
        (element as any).disabled === true;
      element.setAttribute('aria-disabled', isDisabled.toString());
      this.tabs.push(element);
      element.addEventListener('click', (event: MouseEvent) => {
        if (element.hasAttribute(AcTabsAttributeName.acTabTarget)) {
          const targetTabQuery = element.getAttribute(AcTabsAttributeName.acTabTarget);
          if (targetTabQuery) {
            const targetTab = this.querySelector(targetTabQuery);
            if (targetTab) {
              this.show({ tabPane: targetTab as HTMLElement });
            }
          }
        }
      });
    }
  }

  registerTabPaneElement({ element }: { element: HTMLElement }) {
    if (!element.hasAttribute(AcTabsAttributeName.acTabPaneRegistered)) {
      element.setAttribute(AcTabsAttributeName.acTabPaneRegistered, "true");
      if (!element.hasAttribute(AcTabsAttributeName.acTabPaneId)) {
        const paneId = Autocode.uuid();
        element.setAttribute(AcTabsAttributeName.acTabPaneId, paneId);
      }
      element.setAttribute('role', 'tabpanel');
      const id = element.id || this.ensureId({ element: element });
      element.setAttribute('aria-labelledby', this.findTabIdForPane({ paneId: id }) ?? '');
      if (!element.classList.contains('active')) this.hidePane({ pane: element, immediate: true });
      this.tabPanes.push(element);
    }
  }

  private resolveIndex({ target }: { target: number | string | HTMLElement }): number {
    if (typeof target === 'number') return target;
    if (typeof target === 'string') {
      const id = target.startsWith('#') ? target.slice(1) : target;
      const pane = this.tabPanes.find((p) => p.id === id);
      if (pane) {
        const tabId = pane.getAttribute('aria-labelledby');
        if (tabId) {
          const tab = this.tabs.find((t) => this.ensureId({ element: t as HTMLElement }) === tabId);
          if (tab) return this.tabs.indexOf(tab);
        }
      }
      const el = this.querySelector<HTMLElement>(target);
      if (el) return this.tabs.indexOf(el);
      return -1;
    }
    return this.tabs.indexOf(target);
  }

  private resolveIndexFromHash(): number | null {
    const hash = (location.hash || '').replace('#', '');
    if (!hash) return null;
    const pane = this.tabPanes.find((p) => p.id === hash);
    if (!pane) return null;
    const tabId = pane.getAttribute('aria-labelledby');
    const tab = tabId ? this.tabs.find((t) => this.ensureId({ element: t as HTMLElement }) === tabId) : null;
    return tab ? this.tabs.indexOf(tab) : null;
  }

  public show({ tab, tabPane, target, tabIndex = -1, options }: { tabPane?: HTMLElement, tab?: HTMLElement, target?: HTMLElement | string | number, tabIndex?: number, options?: { skipFocus?: boolean, skipIfSame?: boolean } }) {
    if (tabIndex == -1) {
      if (tab) {
        tabIndex = this.tabs.indexOf(tab);
      }
      else if (tabPane) {
        tabIndex = this.tabPanes.indexOf(tabPane);
      }
      else if (target != undefined) {
        tabIndex = this.resolveIndex({ target: target });
      }
    }
    this.activate({ index: tabIndex, options: { ...options, programmatic: true } });
  }

  private showPane({ pane }: { pane: HTMLElement }) {
    const useFade = pane.classList.contains('fade');
    pane.classList.add('active');
    pane.removeAttribute('hidden');
    pane.setAttribute('aria-hidden', 'false');

    if (useFade) {
      pane.offsetWidth;
      pane.classList.add('show');
    }
  }

}

acRegisterCustomElement({tag:AC_TABS_TAG.tabs,type:AcTabs});
