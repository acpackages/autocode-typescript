/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Editor } from "grapesjs";
import { AcBuilderApi } from "./ac-builder-api";
import { AcBuilderEventsHandler } from "./ac-builder-events-handler";
import { AC_BUILDER_ELEMENT_ATTRIBUTE } from "../consts/ac-builder-element-attribute.const";
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { IAcComponentElement } from "../interfaces/ac-component-element.interface";
import { AcBuilderElementsManager } from "./ac-builder-elements-manager";
import { AcDelayedCallback } from "@autocode-ts/autocode";

export class AcGrapesJSEventsHandler {
  builderApi: AcBuilderApi;
  eventsHandler: AcBuilderEventsHandler;
  grapesJSApi: Editor;
  builderIframe?: HTMLIFrameElement;
  builderRoot?: HTMLElement;
  private delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  constructor({ builderApi }: { builderApi: AcBuilderApi }) {
    this.builderApi = builderApi;
    this.eventsHandler = builderApi.eventHandler;
    this.grapesJSApi = this.builderApi.builder.grapesJSApi;
    this.registerEventListeners();
  }

  getComponentElement({ component }: { component: any }): IAcComponentElement | undefined {
    let result;
    if (component && component.view && component.view.el && this.builderApi && this.builderApi.component && this.builderApi.component.elements) {
      const element: HTMLElement = component.view.el;
      if (element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)) {
        const instanceName: string = element.getAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)!;
        result = this.builderApi.component.elements[instanceName];
      }
    }
    return result;
  }

  makeElementInteractive({ element }: { element: HTMLElement }) {
    if (!element) return;
    if (!element.hasAttribute('ac-builder-interactive-set')) {
      const wrapper = this.grapesJSApi.getWrapper()!;
      let cmp: any = wrapper.find('*').filter(c => c.getEl() === element)[0];
      if (!cmp) {
        const createComponent = () => {
          if (element.parentNode) {
            cmp = this.grapesJSApi.addComponents(element.outerHTML);
            element.replaceWith(cmp[0].view.el);
            cmp[0].view.el.setAttribute('ac-builder-interactive-set', "true");
            cmp = wrapper.components().last();
            const setInteractive = (component: any) => {
              component.set({
                editable: true,
                draggable: true,
                removable: true,
                copyable: true,
                droppable: true
              });
              component.components().each((child: any) => setInteractive(child));
            };
            setInteractive(cmp);
          }
          else {
            this.delayedCallback.add({callback:() => {
              createComponent();
            }, duration:1});
          }
        }
        createComponent();
      }

    }

  }

  registerAttributesChangeListener() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type == 'attributes') {
          const element = mutation.target as HTMLElement;
          const attrName: string = mutation.attributeName!;
          if (attrName == AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInteractive) {
            this.makeElementInteractive({ element });
          }
        }
        else if (mutation.type == "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((element) => {
            if (element instanceof HTMLElement) {
              if (element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInteractive)) {
                this.makeElementInteractive({ element });
              }
            }
          });
        }
        else {
          //
        }
      });
    });
    observer.observe(this.builderRoot!, {
      attributes: true,
      childList: true,
      subtree: true
    });
    const interactiveElements = this.builderRoot?.querySelectorAll(`[${AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInteractive}]`);
    if (interactiveElements) {
      for (const element of Array.from(interactiveElements) as HTMLElement[]) {
        this.makeElementInteractive({ element });
      }
    }
  }

  registerBlockListeners() {
    const editor = this.grapesJSApi;
    editor.on('block:add', (args) => {
      this.delayedCallback.add({callback:() => {
        this.builderApi.builder.setFilterableElementsGroups();
      }, duration:1});
    });
    editor.on('block:remove', (args) => {
      //
    });
    editor.on('block:remove:before', (args) => {
      //
    });
    editor.on('block:update', (args) => {
      //
    });
    editor.on('block:drag:start', (args) => {
      //
    });
    editor.on('block:drag', (args) => {
      //
    });
    editor.on('block:drag:stop', (args) => {
      //
    });
    editor.on('block:category:update', (args) => {
      //
    });
    editor.on('block:category:add', (args) => {
      //
    });
    editor.on('block:custom', (args) => {
      //
    });
    editor.on('block', (args) => {
      //
    });
  }

  registerCommandListers() {
    const editor = this.grapesJSApi;
    editor.on('command:run', (args) => {
      //
    });
    editor.on('command:stop', (args) => {
      //
    });
  }

  registerElementListeners() {
    const editor = this.grapesJSApi;
    editor.on('component:add', (args) => {
      const handleFunction = () => {
        if (args && args.view && args.view.el) {
          this.eventsHandler.handleElementAdd({ element: args.view.el });
        }
        else {
          this.delayedCallback.add({callback:() => {
            handleFunction();
          }, duration:10});
        }
      }
      handleFunction();
    });
    editor.on('component:remove', (component) => {
      if (component && component.view && component.view.el) {
        this.eventsHandler.handleElementRemove({ element: component.view.el });
        const toolbarEl = this.grapesJSApi.Canvas.getToolbarEl();
        if (toolbarEl) {
          toolbarEl.style.display = 'none';
        }
      }
    });
    editor.on('component:selected', (args) => {
      this.renderElementToolbar(args);
      const handleFunction = () => {
        if (args && args.view && args.view.el) {
          this.eventsHandler.handleElementSelect({ element: args.view.el });
        }
      }
      handleFunction();
    });
    editor.on('component:deselected', (args) => {
      //
    });
    editor.on('component:update:attributes', (args) => {
      //
    });
  }

  registerEventListeners() {
    this.grapesJSApi.on('run:tlb-edit', () => false);
    this.registerBlockListeners();
    this.registerCommandListers();
    this.registerElementListeners();
    this.registerLayerListeners();
    this.registerModalListeners();
    this.registerPageListeners();
    this.registerSelectorListeners();
    this.registerStorageListeners();
    this.registerStyleListeners();
    this.registerTraitListeners();
    this.grapesJSApi.on('load', () => {
      this.builderIframe = this.grapesJSApi.Canvas.getFrameEl();
      const iframeDocument = this.builderIframe.contentDocument || this.builderIframe.contentWindow?.document;
      if (iframeDocument) {
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link: any) => {
          const newLink = iframeDocument.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = link.href;
          iframeDocument.head.appendChild(newLink);
        });
        document.querySelectorAll('script[src]').forEach((script: any) => {
          const newScript = iframeDocument.createElement('script');
          newScript.src = script.src;
          newScript.async = false;
          iframeDocument.body.appendChild(newScript);
        });
        this.builderRoot = iframeDocument.querySelector('body') as HTMLElement;
      }
      this.registerAttributesChangeListener();
    });
  }

  registerLayerListeners() {
    const editor = this.grapesJSApi;
    editor.on('layer:root', (args) => {
      //
    });
    editor.on('layer:Element', (args) => {
      //
    });
  }

  registerModalListeners() {
    const editor = this.grapesJSApi;
    editor.on('modal:open', (args) => {
      //
    });
    editor.on('modal:close', (args) => {
      //
    });
    editor.on('modal', (args) => {
      //
    });
  }

  registerPageListeners() {
    const editor = this.grapesJSApi;
    editor.on('page:add', (args) => {
      //
    });
    editor.on('page:remove', (args) => {
      //
    });
    editor.on('page:select', (args) => {
      //
    });
    editor.on('page:update', (args) => {
      //
    });
    editor.on('page', (args) => {
      //
    });
  }

  registerSelectorListeners() {
    const editor = this.grapesJSApi;
    editor.on('selector:add', (args) => {
      //
    });
    editor.on('selector:remove', (args) => {
      //
    });
    editor.on('selector:update', (args) => {
      //
    });
    editor.on('selector:state', (args) => {
      //
    });
    editor.on('selector', (args) => {
      //
    });
  }

  registerStorageListeners() {
    const editor = this.grapesJSApi;
    editor.on('storage:start', (args) => {
      //
    });
    editor.on('storage:start:store', (args) => {
      //
    });
    editor.on('storage:start:load', (args) => {
      //
    });
    editor.on('storage:load', (args) => {
      //
    });
    editor.on('storage:store', (args) => {
      //
    });
    editor.on('storage:after', (args) => {
      //
    });
    editor.on('storage:end', (args) => {
      //
    });
    editor.on('storage:end:store', (args) => {
      //
    });
    editor.on('storage:end:load', (args) => {
      //
    });
    editor.on('storage:error', (args) => {
      //
    });
    editor.on('storage:error:store', (args) => {
      //
    });
    editor.on('storage:error:load', (args) => {
      //
    });
  }

  registerStyleListeners() {
    const editor = this.grapesJSApi;
    editor.on('style:sector:add', (args) => {
      //
    });
    editor.on('style:sector:remove', (args) => {
      //
    });
    editor.on('style:sector:update', (args) => {
      //
    });
    editor.on('style:property:add', (args) => {
      //
    });
    editor.on('style:property:remove', (args) => {
      //
    });
    editor.on('style:property:update', (args) => {
      //
    });
    editor.on('style:target', (args) => {
      //
    });
  }

  registerTraitListeners() {
    const editor = this.grapesJSApi;
    editor.on('trait:select', (args) => {
      //
    });
    editor.on('trait:value', (args) => {
      //
    });
    editor.on('trait:category:update', (args) => {
      //
    });
    editor.on('trait:custom', (args) => {
      //
    });
    editor.on('trait', (args) => {
      //
    });
  }

  renderElementToolbar(comp: any) {
    const toolbarEl = this.grapesJSApi.Canvas.getToolbarEl();

    if (!toolbarEl) return;
    const componentElement = this.getComponentElement({ component: comp });
    const element = comp.view.el as HTMLElement;

    const getMenuElement = ({ icon, title, callback, color = 'white' }: { icon: string, title: string, callback: Function, color?: string }) => {
      const menuElement = document.createElement('button');
      menuElement.style.background = "transparent";
      menuElement.style.border = "none";
      menuElement.style.color = color;
      menuElement.style.height = '20px';
      menuElement.style.width = '30px';
      menuElement.innerHTML = `<ac-svg-icon class="ac-builder-toolbar-btn">${icon}</ac-svg-icon>`;
      menuElement.setAttribute('ac-tooltip', title);
      menuElement.addEventListener('click', () => { callback(menuElement) });
      return menuElement;
    };
    this.delayedCallback.add({callback:() => {
      toolbarEl.innerHTML = '';
      toolbarEl.style.background = '#303030ff';
      toolbarEl.style.color = '#fff';
      toolbarEl.style.borderRadius = '4px';
      toolbarEl.style.padding = '2px';
      toolbarEl.style.border = 'solid 1px #555'
      this.delayedCallback.add({callback:() => {

        if (componentElement && componentElement.instance) {
          const builderElement = AcBuilderElementsManager.getElement({ name: componentElement.name });
          if (builderElement?.commands) {
            for (const command of builderElement.commands) {
              toolbarEl.append(getMenuElement({
                title: command.title, icon: command.iconSvg ?? ACI_SVG_SOLID.command, callback: () => {
                  componentElement.instance.handleCommand({ command: command.name, args: {} });
                }
              }));
            }
          }
        }
        if (element.getAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml) == 'true') {
          toolbarEl.append(getMenuElement({
            title: 'Html will be exported! <br>Click to exclude html', icon: ACI_SVG_SOLID.code, callback: (menuElement: HTMLElement) => {
              element.setAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml, 'false');
              menuElement.blur();
              this.renderElementToolbar(comp);
            }
          }));
        }
        else {
          toolbarEl.append(getMenuElement({
            title: 'Html will not be exported! <br>Click to keep html', icon: ACI_SVG_SOLID.code, color: '#555', callback: (menuElement: HTMLElement) => {
              element.setAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml, 'true');
              menuElement.blur();
              this.renderElementToolbar(comp);
            }
          }));
        }

        toolbarEl.append(getMenuElement({
          title: 'Clone', icon: ACI_SVG_SOLID.clone, callback: () => {
            const cloned = comp.clone();
            comp.parent()?.append(cloned);
          }
        }));

        toolbarEl.append(getMenuElement({
          title: 'Remove', icon: ACI_SVG_SOLID.trash, callback: () => {
            comp.remove();
          }
        }));
      }, duration:1});
    }, duration:1});
  }

}
