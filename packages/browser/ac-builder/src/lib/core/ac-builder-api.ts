/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcFilterableElementsAttributeName } from "@autocode-ts/ac-browser";
import { stringToCamelCase } from "@autocode-ts/ac-extensions";
import { AcDelayedCallback, AcEvents, AcHooks } from "@autocode-ts/autocode";
import { Editor } from "grapesjs";
import { AcBuilder } from "../elements/ac-builder.element";
import { AC_BUILDER_ELEMENT_ATTRIBUTE } from "../consts/ac-builder-element-attribute.const";
import { AcBuilderEventsHandler } from "./ac-builder-events-handler";
import { AcBuilderState } from "../models/ac-builder-state.model";
import { IAcBuilderState } from "../interfaces/ac-builder-state.interface";
import { AcBuilderScriptEditor } from "../elements/ac-builder-script-editor.element";
import { AcBuilderElementsManager } from "./ac-builder-elements-manager";
import { AcBuilderDevelopmentRuntime } from "../runtime/ac-builder-development-runtime";
import { AcEnumBuilderHook } from "../enums/ac-enum-builder-hook.enum";
import { IAcBuilderComponent } from "../interfaces/ac-component.interface";
import { IAcComponentElement } from "../interfaces/ac-component-element.interface";
import { AcBuilderComponent } from "./ac-builder-component";

export class AcBuilderApi {
  private _component!: IAcBuilderComponent;
  set component(value: IAcBuilderComponent) {
    this._component = value;
    this.hooks.execute({ hook: AcEnumBuilderHook.ActiveComponentChange, args: { component: value } });
  }
  get component(): IAcBuilderComponent {
    return this._component;
  }

  builder: AcBuilder;
  builderState: AcBuilderState;
  private delayedCallback:AcDelayedCallback = new AcDelayedCallback();
  eventHandler: AcBuilderEventsHandler;
  events: AcEvents = new AcEvents();
  extensions: any = {};
  grapesJSApi: Editor;
  hooks: AcHooks = new AcHooks();
  components: IAcBuilderComponent[] = [];
  scriptEditor!: AcBuilderScriptEditor;
  selectedElement?: IAcComponentElement;
  runtime?: AcBuilderDevelopmentRuntime;
  editorOpen: boolean = false;
  editorHtmlModified = false;
  refreshingEditorHtml = false;

  constructor({ builder }: { builder: AcBuilder }) {
    this.builder = builder;
    this.runtime = new AcBuilderDevelopmentRuntime({ builderApi: this });
    this.builderState = new AcBuilderState({ builderApi: this });
    this.eventHandler = new AcBuilderEventsHandler({ builderApi: this });
    this.grapesJSApi = builder.grapesJSApi;
    this.initScriptEditor();
    AcBuilderElementsManager.init();
    this.addElementsFromRegister();
    this.component = { name: 'default', elements: {} };
    this.hooks.subscribe({
      hook: AcEnumBuilderHook.EditorHtmlChange, callback: () => {
        this.editorHtmlModified = true;
      }
    })
  }

  private addElementsFromRegister() {
    for (const element of AcBuilderElementsManager.getElements()) {
      if (element.properties == undefined) {
        element.properties = [];
      }
      element.properties = [{
        category: 'General',
        name: 'instanceName',
        title: 'Instance Name',
        type: 'string'
      }, ...element.properties];
      const domc = this.grapesJSApi.DomComponents;
      const instance = this;
      domc.addType(element.name, {
        model: {
          defaults: {
            droppable: true,        // allows drops
            draggable: true,
            highlightable: true,
            tagName: element.tag,
          }
        },
        view: {
          init(args: any){
            let currentCount: number = 0;
            if (instance.component && instance.component.elements) {
              currentCount = Object.values(instance.component.elements).filter((el) => { return el.name == element.name }).length - 1;
            }
            currentCount++;
            let instanceName: string = stringToCamelCase(`${element.name.replaceAll(" ", "_")}`);
            if (currentCount > 0) {
              instanceName += currentCount;
            }
            const componentElement: IAcComponentElement = {
              instanceName: instanceName,
              name: element.name,
              events: {},
              properties: {
                instanceName: {
                  name: 'instanceName',
                  value: instanceName
                }
              }
            }
            instance.component.elements![instanceName] = componentElement;
            // this.delayedCallback.add({callback:() => {
            //   this.el.setAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementAdded, 'true');
            //   this.delayedCallback.add({callback:() => {
            //     this.el.removeAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementAdded);
            //   }, duration:1500});
            //   this.el.setAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName, instanceName);
            // }, duration:1});
          },

        },
      });
      this.grapesJSApi.BlockManager.add(element.name, {
        label: element.title,
        attributes: { [AcFilterableElementsAttributeName.acFilterValue]: element.title.toLowerCase() },
        content: {
          type: element.name,

        },
        category: element.category,
        media: element.mediaSvg,

      });
      this.scriptEditor.registerType({ type: element.instanceClass });
    }
    this.builder.setFilterableElementsGroups();
  }

  exposeTypesToEditor({ types }: { types: any[] }) {
    this.initScriptEditor();
    for (const type of types) {
      this.scriptEditor.registerType({ type });
    }
  }

  fromJson(json: IAcBuilderState) {
    this.builderState.fromJson(json);
  }

  getHtml() {
    const container = document.createElement("div");
    const builderIframe = this.grapesJSApi.Canvas.getFrameEl();
    if (builderIframe) {
      const iframeDocument = builderIframe.contentDocument || builderIframe.contentWindow?.document;
      if (iframeDocument) {
        const iframeBody = (iframeDocument.querySelector('body') as HTMLElement).cloneNode(true) as HTMLElement;
        for (const styleEl of Array.from(iframeBody.querySelectorAll('style'))) {
          styleEl.remove();
        }
        for (const scriptEl of Array.from(iframeBody.querySelectorAll('script'))) {
          scriptEl.remove();
        }
        container.innerHTML = iframeBody.innerHTML;
      }
      const el = container.querySelector('.gjs-css-rules') as HTMLElement | undefined;
      if (el) {
        el.remove();
      }
      const el1 = container.querySelector('.gjs-js-cont') as HTMLElement | undefined;
      if (el1) {
        el1.remove();
      }
    }

    function clean(node: any) {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as HTMLElement;
      for (const attribute of element.getAttributeNames()) {
        if (attribute.startsWith("data-gjs-") ||
          attribute === "draggable" ||
          attribute === "contenteditable" ||
          attribute === "spellcheck") {
          element.removeAttribute(attribute);
        }
      }
      if (node.id && /^i\w{2,}$/.test(node.id)) {
        node.removeAttribute("id");
      }
      for (const className of Array.from(element.classList)) {
        if (className.startsWith("gjs-")) {
          (node as HTMLElement).classList.remove(className);
        }
      }
      if (element.hasAttribute('class')) {
        if (element.classList.length == 0) {
          element.removeAttribute('class');
        }
      }
      if (element.hasAttribute('style')) {
        const attrValue = element.getAttribute('style');
        if (!attrValue || attrValue.trim().length > 0) {
          element.removeAttribute('style');
        }
      }
      let includeHtml: boolean = true;
      if (element.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml)) {
        includeHtml = element.getAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderKeepHtml) != 'false';
      }
      if (!includeHtml) {
        const children = Array.from(element.children);
        if (children.length > 0) {
          for (const child of children) {
            if (!child.hasAttribute(AC_BUILDER_ELEMENT_ATTRIBUTE.acBuilderElementInstanceName)) {
              child.remove();
            }
          }
        }
        else {
          element.innerHTML = "";
        }

      }
      node.childNodes.forEach(clean);
    }
    container.childNodes.forEach(clean);
    const result = container.innerHTML;
    return result;
  }

  initScriptEditor() {
    if (this.scriptEditor == undefined) {
      this.scriptEditor = new AcBuilderScriptEditor({ builderApi: this });
      this.scriptEditor.registerType({ type: AcBuilderComponent });
      if (this.component && this.component.script) {
        this.scriptEditor.setTsCode({ code: this.component.script });
      }
      (this.builder.element.querySelector('.ac-builder-script-container') as HTMLElement).append(this.scriptEditor.element);
      this.scriptEditor.on({
        event: 'close', callback: () => {
          this.builder.scriptEditorDrawer.close();
        }
      });
      this.builder.scriptEditorDrawer.on({
        event: 'close', callback: () => {
          this.editorOpen = false;
          if (this.editorHtmlModified) {
            this.refreshingEditorHtml = true;
            this.setHtml({ html: this.scriptEditor.getHtmlCode() })
            this.refreshingEditorHtml = false;
          }
        }
      });
      this.builder.scriptEditorDrawer.on({
        event: 'open', callback: () => {
          this.editorOpen = true;
          this.editorHtmlModified = false;
        }
      });
    }
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

  setActiveComponent({ component }: { component: IAcBuilderComponent }) {
    this.component = component;
    if (this.component.html) {
      this.grapesJSApi.setComponents(this.component.html);
    }
    if (this.component.script) {
      this.scriptEditor.setTsCode({ code: this.component.script });
    }
  }

  setHtml({ html }: { html: string }) {
    this.grapesJSApi.setComponents(html);
  }

  toggleScriptEditor() {
    this.initScriptEditor();
    this.builder.scriptEditorDrawer.toggle();

  }

  toJson(): IAcBuilderState {
    return this.builderState.toJson();
  }
}
