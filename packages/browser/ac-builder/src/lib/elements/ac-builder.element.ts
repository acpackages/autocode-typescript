/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { grapesjs, Editor } from 'grapesjs';
import { acAddClassToElement, AcBrowser, AcDrawer, AcEnumDrawerEvent, AcFilterableElements, AcFilterableElementsAttributeName, acInit, acRemoveClassFromElement, AcTabs, AcTabsAttributeName } from '@autocode-ts/ac-browser';
import { ACI_SVG_BRANDS, ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcBuilderApi } from '../core/ac-builder-api';
import { AcGrapesJSEventsHandler } from '../core/ac-grapesjs-events-handler';
import { AcBuilderPropertiesPanel } from './ac-builder-properties-panel.element';
import { AcBuilderCssClassName } from '../consts/ac-builder-css-class-name.const';
import { AcBuilderEventsPanel } from './ac-builder-events-panel.element';
import { AcEnumBuilderHook } from '../enums/ac-enum-builder-hook.enum';
import { AcEnumBuilderEvent } from '../enums/ac-enum-builder-event.enum';
export class AcBuilder {
  element: HTMLElement = document.createElement('div');
  grapesJSElement!: HTMLElement;
  builderApi!: AcBuilderApi;
  grapesJSApi!: Editor;
  grapesJSEventsHandler?: AcGrapesJSEventsHandler;
  scriptEditorDrawer!: AcDrawer;
  propertiesPanel: AcBuilderPropertiesPanel;
  eventsPanel: AcBuilderEventsPanel;

  constructor() {
    this.setBuilderElement();
    this.initGrapesJS();
    this.builderApi = new AcBuilderApi({ builder: this });
    this.grapesJSEventsHandler = new AcGrapesJSEventsHandler({ builderApi: this.builderApi });
    this.propertiesPanel = new AcBuilderPropertiesPanel({ builderApi: this.builderApi });
    (this.element.querySelector('.ac-builder-properties-tab') as HTMLElement).append(this.propertiesPanel.element);
    this.eventsPanel = new AcBuilderEventsPanel({ builderApi: this.builderApi });
    (this.element.querySelector('.ac-builder-events-tab') as HTMLElement).append(this.eventsPanel.element);
    acInit({ element: this.element });
  }

  initGrapesJS() {
    this.grapesJSApi = grapesjs.init({
      height: '100%',
      avoidInlineStyle: false,
      showOffsets: true,
      noticeOnUnload: false,
      storageManager: false,
      selectorManager: {
        appendTo: this.element.querySelector('.ac-builder-class-panel') as HTMLElement,
      },
      container: this.element.querySelector('.ac-builder-canvas') as HTMLElement,
      fromElement: true,
      blockManager: {
        appendTo: this.element.querySelector('.ac-builder-elements-panel') as HTMLElement
      },
      layerManager: {
        appendTo: this.element.querySelector('.ac-builder-layers-panel') as HTMLElement
      },
      styleManager: {
        appendTo: this.element.querySelector('.ac-builder-styles-panel') as HTMLElement,
      },
    });
    this.setGrapesJSElementStyles();
    this.setDeviceButtons();
    this.initGrapesJSCommands();
  }

  private initGrapesJSCommands(): void {
    const btnPreview = this.element.querySelector('.btn-preview') as HTMLElement;
    btnPreview.addEventListener('click', () => {
      this.grapesJSApi.runCommand('preview');
    });

    const btnDownload = this.element.querySelector('.btn-download') as HTMLElement;
    btnDownload.addEventListener('click', () => {
      const jsonData = this.builderApi.toJson();
      AcBrowser.downloadJsonObjectAsFile({ data: jsonData, filename: 'builder-state.json' });
    });

    const btnOutline = this.element.querySelector('.btn-outline') as HTMLElement;
    btnOutline.addEventListener('click', () => {
      this.grapesJSApi.runCommand('open-layers');
    });

    const btnFullscreen = this.element.querySelector('.btn-fullscreen') as HTMLElement;
    btnFullscreen.addEventListener('click', () => {
      this.grapesJSApi.runCommand('fullscreen');
    });

    const btnClear = this.element.querySelector('.btn-clear-canvas') as HTMLElement;
    btnClear.addEventListener('click', () => {
      this.grapesJSApi.runCommand('core:canvas-clear');
    });

    const btnUndo = this.element.querySelector('.btn-undo') as HTMLElement;
    btnUndo.addEventListener('click', () => {
      this.grapesJSApi.runCommand('core:undo');
    });

    const btnRedo = this.element.querySelector('.btn-redo') as HTMLElement;
    btnRedo.addEventListener('click', () => {
      this.grapesJSApi.runCommand('core:redo');
    });
  }

  private setBuilderElement() {
    this.element.style.width = '100%';
    this.element.style.height = '100%';
    this.element.style.display = 'flex';
    this.element.style.flexDirection = 'column';
    this.element.innerHTML = `
    <div class="ac-builder-body">
      <ac-tabs>
      <div class="ac-builder-sidebar ac-builder-left-sidebar ">
        <div class="nav nav-tabs ac-sidebar-tabs" role="tablist">
          <button class="nav-link" type="button" role="tab" aria-selected="true" ${AcTabsAttributeName.acTab} ${AcTabsAttributeName.acTabTarget}=".ac-builder-elements-tab" ac-tooltip="Elements">
            <ac-svg-icon>${ACI_SVG_SOLID.puzzlePiece}</ac-svg-icon>
          </button>
          <button class="nav-link" type="button" role="tab" aria-selected="true" ${AcTabsAttributeName.acTab} ${AcTabsAttributeName.acTabTarget}=".ac-builder-layers-panel" ac-tooltip="Layers">
          <ac-svg-icon>${ACI_SVG_SOLID.layerGroup}</ac-svg-icon>
          </button>
          <button class="nav-link d-none" type="button" role="tab" aria-selected="true" ${AcTabsAttributeName.acTab} ${AcTabsAttributeName.acTabTarget}=".ac-builder-components-tab" ac-tooltip="Components">
            <ac-svg-icon>${ACI_SVG_SOLID.folderTree}</ac-svg-icon>
          </button>
        </div>
        <div class="tab-content">

          <div class="ac-builder-elements-tab" ${AcTabsAttributeName.acTabPane} role="tabpanel" aria-labelledby="">
            <div class="ac-builder-elements-tab-container">
              <div class="p-2">
                <input type="text" class="${AcBuilderCssClassName.acBuilderSidebarInput} ac-elements-filter-input" placeholder="Search..." ac-filter-input>
              </div>
              <div class="ac-builder-elements-panel ac-builder-scrollable-element" >
              </div>
            </div>
          </div>
          <div class="ac-builder-layers-panel"  ${AcTabsAttributeName.acTabPane} role="tabpanel" aria-labelledby=""></div>
          <div class="ac-builder-components-tab d-none"  ${AcTabsAttributeName.acTabPane} role="tabpanel" aria-labelledby=""></div>
        </div>
      </div>
        </ac-tabs>
      <div class="ac-builder-center-container">
        <div class="ac-builder-topbar">
          <div class="ac-builder-topbar-left">
          </div>
          <div class="ac-builder-topbar-center">
            <div class="btn-group btn-action-grp" role="group">
              <button type="button" class="btn btn-action btn-device btn-desktop text-white p-0" ac-tooltip="Desktop">
                <ac-svg-icon>${ACI_SVG_SOLID.desktop}</ac-svg-icon>
                </button>
              <button type="button" class="btn btn-action btn-device btn-tablet text-secondary p-0" ac-tooltip="Tablet">
                <ac-svg-icon>${ACI_SVG_SOLID.tabletScreenButton}</ac-svg-icon>
              </button>
              <button type="button" class="btn btn-action btn-device btn-mobilePortrait text-secondary p-0" ac-tooltip="Mobile">
                <ac-svg-icon>${ACI_SVG_SOLID.mobileScreenButton}</ac-svg-icon>
                </button>
            </div>
          </div>
          <div class="ac-builder-topbar-right">
            <div class="ac-builder-topbar-right-container me-2">
              <button type="button" class="btn btn-action btn-preview d-none" ac-tooltip="Preview">
                <ac-svg-icon>${ACI_SVG_SOLID.eye}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-outline text-secondary" ac-tooltip="Component Outline">
                <ac-svg-icon>${ACI_SVG_SOLID.expand}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-fullscreen text-secondary" ac-tooltip="Fullscreen">
                <ac-svg-icon>${ACI_SVG_SOLID.maximize}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-script-code text-secondary" ac-tooltip="Script">
                <ac-svg-icon>${ACI_SVG_SOLID.code}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-clear-canvas text-secondary" ac-tooltip="Clear Content">
                <ac-svg-icon>${ACI_SVG_SOLID.eraser}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-download text-secondary" ac-tooltip="Download">
                <ac-svg-icon>${ACI_SVG_SOLID.download}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-undo text-secondary" ac-tooltip="Undo">
                <ac-svg-icon>${ACI_SVG_SOLID.rotateLeft}</ac-svg-icon>
                </button>
                <button type="button" class="btn btn-action btn-redo text-secondary" ac-tooltip="Redo">
                <ac-svg-icon>${ACI_SVG_SOLID.rotateRight}</ac-svg-icon>
                </button>
                </div>
                </div>
                </div>
                <div class="ac-builder-canvas">
                </div>
                </div>

              <ac-tabs>
                <div class="ac-builder-sidebar ac-builder-right-sidebar">
                <div class="nav nav-tabs ac-sidebar-tabs" role="tablist" data-actabs-tablist>
                <button class="nav-link" type="button" role="tab" aria-selected="true" ${AcTabsAttributeName.acTab} ${AcTabsAttributeName.acTabTarget}=".ac-builder-styles-tab" ac-tooltip="Style">
                <ac-svg-icon>${ACI_SVG_BRANDS.css3}</ac-svg-icon>
                </button>
                <button class="nav-link" type="button" role="tab" aria-selected="true" ${AcTabsAttributeName.acTab} ${AcTabsAttributeName.acTabTarget}=".ac-builder-properties-tab" ac-tooltip="Properties">
                <ac-svg-icon>${ACI_SVG_SOLID.penToSquare}</ac-svg-icon>
          </button>
          <button class="nav-link" type="button" role="tab" aria-selected="true" ${AcTabsAttributeName.acTab} ${AcTabsAttributeName.acTabTarget}=".ac-builder-events-tab" ac-tooltip="Events">
            <ac-svg-icon>${ACI_SVG_SOLID.bolt}</ac-svg-icon>
          </button>
        </div>
        <div class="tab-content">
          <div class="ac-builder-styles-tab ac-builder-scrollable-element" ${AcTabsAttributeName.acTabPane}>
          <div class="ac-builder-class-panel"></div>
          <div class="ac-builder-styles-panel"></div>
          </div>
          <div class="ac-builder-properties-tab" ${AcTabsAttributeName.acTabPane}></div>
          <div class="ac-builder-events-tab" ${AcTabsAttributeName.acTabPane}></div>
        </div>
      </div>
      </ac-tabs>
    </div>
    <ac-drawer placement="right">
      <div class="ac-builder-script-container"></div>
    </ac-drawer>
    `;
    this.setTabs();
    this.setDrawers();
    const elementsPanel = this.element.querySelector('.ac-builder-elements-tab') as HTMLElement;
    new AcFilterableElements({ element: elementsPanel });
    this.setFilterableElementsGroups();
  }

  private setDeviceButtons() {
    const setActiveDevice: Function = (device: string) => {
      for (const el of Array.from(this.element.querySelectorAll('.btn-device'))) {
        const btnElement = el as HTMLElement;
        acAddClassToElement({ class_: 'text-secondary', element: btnElement });
        acRemoveClassFromElement({ class_: 'text-white', element: btnElement });
      }
      const btnElement = (this.element.querySelector(`.btn-${device}`) as HTMLElement);
      acAddClassToElement({ class_: 'text-white', element: btnElement });
      acRemoveClassFromElement({ class_: 'text-secondary', element: btnElement });
      this.grapesJSApi.setDevice(device);

    };
    const btnDesktop = this.element.querySelector('.btn-desktop') as HTMLElement;
    btnDesktop.addEventListener('click', () => {
      setActiveDevice('desktop');
    });

    const btnTablet = this.element.querySelector('.btn-tablet') as HTMLElement;
    btnTablet.addEventListener('click', () => {
      setActiveDevice('tablet');
    });

    const btnMobile = this.element.querySelector('.btn-mobilePortrait') as HTMLElement;
    btnMobile.addEventListener('click', () => {
      setActiveDevice('mobilePortrait');
    });
  }

  private setDrawers() {
    this.scriptEditorDrawer = this.element.querySelector('ac-drawer') as AcDrawer;
    this.scriptEditorDrawer.on({
      event: AcEnumDrawerEvent.Close, callback: () => {
        this.builderApi.hooks.execute({ hook: AcEnumBuilderHook.EditorClose });
        this.builderApi.events.execute({ event: AcEnumBuilderEvent.EditorClose });
      }
    });
    this.scriptEditorDrawer.on({
      event: AcEnumDrawerEvent.Open, callback: () => {
        this.builderApi.hooks.execute({ hook: AcEnumBuilderHook.EditorOpen });
        this.builderApi.events.execute({ event: AcEnumBuilderEvent.EditorOpen });
      }
    });
    const btnCode = this.element.querySelector('.btn-script-code') as HTMLElement;
    btnCode.addEventListener('click', () => {
      this.builderApi.toggleScriptEditor();
      this.builderApi.scriptEditor.refreshHtmlCode();
    });
  }

  setFilterableElementsGroups() {
    const elementsPanel = this.element.querySelector('.ac-builder-elements-tab') as HTMLElement;
    const categoryBlocks = Array.from(elementsPanel.querySelectorAll('.gjs-block-category')) as HTMLElement[];
    for (const category of categoryBlocks) {
      category.setAttribute(AcFilterableElementsAttributeName.acFilterElementGroup, "true");
    }
  }

  private setGrapesJSElementStyles() {
    const grapesJSElement = this.element.querySelector('.gjs-editor') as HTMLElement;
    grapesJSElement.style.height = "100%";
    grapesJSElement.style.width = "100%";
    const canvasElement = this.element.querySelector('.gjs-cv-canvas') as HTMLElement;
    canvasElement.style.height = "100%";
    canvasElement.style.width = "100%";
    canvasElement.style.top = "0px";
    const panelsElement = this.element.querySelector('.gjs-pn-panels') as HTMLElement;
    panelsElement.style.display = 'none';

  }

  private setTabs() {
    // const leftSidebarTabs = new AcTabs({ element: this.element.querySelector('.ac-builder-left-sidebar') as HTMLElement });
    // leftSidebarTabs.show({ tabIndex: 0 });
    // const rightSidebarTabs = new AcTabs({ element: this.element.querySelector('.ac-builder-right-sidebar') as HTMLElement });
    // rightSidebarTabs.show({ tabIndex: 0 });
  }
}
