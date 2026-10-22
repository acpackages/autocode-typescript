/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { CommonModule } from '@angular/common';
import { createNgModule, ApplicationRef, ChangeDetectorRef, Component, ComponentRef, ElementRef, EventEmitter, Injectable, Input, Injector, NgModuleRef, Output, StaticProvider, Type, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import * as ts from 'typescript';

@Injectable({ providedIn: 'root' })
export class AcRuntimeComponentBaseClass {
  elementRef: ElementRef | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class AcRuntimeService {
  static componentRegistry: { [name: string]: Type<any> } = {};
  private loadedModules = new Map<Type<any>, NgModuleRef<any>>();

  static registerComponentType(componentType: Type<any>, name: string = ""): void {
    if (name == "") {
      // ANG-9: Safely strip leading $ prefix (generated class names begin with $$$ClassName)
      const rawName = componentType.prototype.constructor.name;
      name = rawName.replace(/^\$+/, "") || rawName;
    }
    AcRuntimeService.componentRegistry[name] = componentType;
  }

  /** ANG-9: Clear component registry (for HMR/hot module replacement). */
  static clearRegistry(): void {
    AcRuntimeService.componentRegistry = {};
  }

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,) { }

  createComponent(nameOrType: string | Type<any>, data?: any): ComponentRef<any> | null {
    const componentType = typeof nameOrType === 'string' ? AcRuntimeService.componentRegistry[nameOrType] : nameOrType;
    if (componentType) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      const componentRef = componentFactory.create(this.injector);
      this.appRef.attachView(componentRef.hostView);
      if (data) {
        Object.keys(data).forEach((key) => {
          componentRef.instance[key] = data[key];
        });
      }
      return componentRef;
    } else {
      console.error(`Component with name or type ${nameOrType} not registered.`);
      return null;
    }
  }

  destroyComponent(componentRef: ComponentRef<any>): void {
    componentRef.destroy();
  }

  getComponentDetails(component: Type<any>): any {
    const cmpMetadata = (component as any).ɵcmp;
    if (!cmpMetadata) {
      throw new Error(`Component metadata not found for ${component.name}`);
    }
    const inputData:any = cmpMetadata.inputs;
    let className:string = "",filePath:string = "";
    if (cmpMetadata.debugInfo) {
      className = cmpMetadata.debugInfo?.className || component.name;
      if (cmpMetadata.debugInfo.filePath) {
        filePath = cmpMetadata.debugInfo.filePath;
      }
    }
    let selectors: string[] = [];
    if (cmpMetadata.selectors) {
      selectors = cmpMetadata.selectors[0];
    }
    const inputs: any = {};
    if (cmpMetadata.inputs) {
      for (const inputName of Object.keys(cmpMetadata.inputs)) {
        inputs[inputName] = { 'input_name': inputName };
      }
    }
    const outputs: any = {};
    if (cmpMetadata.outputs) {
      for (const outputName of Object.keys(cmpMetadata.outputs)) {
        outputs[outputName] = { 'output_name': outputName };
      }
    }
    const inputNames:string[] = Object.keys(inputs);
    if(inputNames.length > 0){
      const componentRef = this.createComponent(component);
      const componentInstance = componentRef!.instance;
      for(const inputName of inputNames){
        const value:any = componentInstance[inputName];
        const type:string = typeof value;
        if(type == "object"){
          //
        }
      }
      // ANG-5: Destroy the temp component to avoid memory leak
      this.appRef.detachView(componentRef!.hostView);
      componentRef!.destroy();
    }
    return {
      className:className,
      filePath:filePath,
      inputs: inputs,
      outputs: outputs,
      selectors: selectors,
    };
  }

  getComponentRef(nameOrType:string | Type<any>){
    return typeof nameOrType === 'string' ? AcRuntimeService.componentRegistry[nameOrType] : nameOrType;
  }

  async loadModule<T>(moduleType: Type<T>, providers: StaticProvider[] = []): Promise<NgModuleRef<T>> {
    if (this.loadedModules.has(moduleType)) {
      return this.loadedModules.get(moduleType)!;
    }
    const moduleInjector = Injector.create({ providers, parent: this.injector });
    const moduleRef = createNgModule<T>(moduleType, moduleInjector);
    this.loadedModules.set(moduleType, moduleRef);
    return moduleRef;
  }

  // /* Runtime Modules and Components */

  /* OPTION 01 START*/

  async createRuntimeComponent(
    viewContainer: ViewContainerRef,
    componentDefinition: {
      html: string;
      tsCode: string;
      styles?: string;
      imports?: any[];
      inputs?: { [key: string]: any };
      outputs?: { [key: string]: (data: any) => void };
    }
  ): Promise<ComponentRef<any>> {
    const componentClass = this.createRuntimeComponentClass(
      componentDefinition.tsCode,
      componentDefinition.inputs,
      componentDefinition.outputs
    );
    const componentImports: any[] = [];
    const decoratedComponent = this.createRuntimeStandaloneComponent(
      componentClass,
      componentDefinition.html,
      componentDefinition.styles,
      componentDefinition.imports ?? []
    );

    // Directly create component (No need for compilation)
    const componentRef: any = viewContainer.createComponent(decoratedComponent, {
      injector: this.injector,
    });
    const instance: any = componentRef.instance;
    // instance.simplify = this.simplify;
    // instance.changeDetectorRef = componentRef.changeDetectorRef;

    // Assign inputs
    if (componentDefinition.inputs) {
      Object.assign(componentRef.instance, componentDefinition.inputs);
    }

    // Assign outputs
    if (componentDefinition.outputs) {
      for (const outputName in componentDefinition.outputs) {
        if (componentDefinition.outputs.hasOwnProperty(outputName)) {
          componentRef.instance[outputName].subscribe(componentDefinition.outputs[outputName]);
        }
      }
    }


    componentRef.changeDetectorRef.detectChanges();
    return componentRef;
  }

  private compileTypeScriptCode(tsCode: string): string | null {
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2015, // or ES5, ES2015, etc.
      module: ts.ModuleKind.CommonJS, // or ESNext, etc.
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      downlevelIteration: true,
      strict: false
    };

    const compiled = ts.transpileModule(tsCode, { compilerOptions: options });

    if (compiled.diagnostics && compiled.diagnostics.length > 0) {
      console.error('TypeScript compilation errors:', compiled.diagnostics);
      return null;
    }

    return compiled.outputText;
  }

  private createRuntimeStandaloneComponent(
    componentClass: any,
    html: string,
    styles?: string,
    imports: any[] = []
  ): any {
    return Component({
      selector: `dynamic-component-${Date.now()}`,
      template: html,
      styles: styles ? [styles] : [],
      standalone: true, // ✅ This makes it work in Angular 17+
      imports: [CommonModule, ...imports],
    })(componentClass);
  }

  private createRuntimeComponentClass(
    tsCode: string,
    inputs?: { [key: string]: any },
    outputs?: { [key: string]: (data: any) => void },
  ): any {
    const transpiledCode: any = this.compileTypeScriptCode(tsCode);
    const componentClass = new Function(
      'ChangeDetectorRef',
      'ElementRef',
      'EventEmitter',
      'Input',
      'Output',
      'AutocodeService',
      'SimpleRuntimeComponentBaseClass',
      `return (${transpiledCode})`
    )(ChangeDetectorRef, ElementRef, EventEmitter, Input, Output, AcRuntimeComponentBaseClass);
    // const componentClass = new Function(transpiledCode)()
    if (inputs) {
      for (const inputName in inputs) {
        if (inputs.hasOwnProperty(inputName)) {
          Object.defineProperty(componentClass.prototype, inputName, {
            get: function () {
              return this['_' + inputName];
            },
            set: function (value) {
              this['_' + inputName] = value;
              // this.simplifychangeDetectorRef.markForCheck();  // Trigger UI update
            },
            enumerable: true,
            configurable: true,
          });
        }
      }
    }

    if (outputs) {
      for (const outputName in outputs) {
        if (outputs.hasOwnProperty(outputName)) {
          Object.defineProperty(componentClass.prototype, outputName, {
            value: new EventEmitter(),
            writable: true,
          });
        }
      }
    }

    return componentClass;
  }


}


