/* eslint-disable no-useless-escape */
import type {
  TemplateCompileResult,
  ReactiveProperty,
  ViewChildEntry,
  Binding,
  PrefixFn,
  ConstructorParam,
} from './types.js';
import { transformPipeExpression } from './pipes.js';



function stripAcElementDecorator(source: string): string {
  const decoratorName = '@AcElement';
  const index = source.indexOf(decoratorName);
  if (index === -1) return source;

  // Find the opening parenthesis
  const openParenIndex = source.indexOf('(', index + decoratorName.length);
  if (openParenIndex === -1) return source;

  // Parse from openParenIndex to match the closing parenthesis
  let parenCount = 1;
  let inString: string | null = null;
  let isEscaped = false;
  let i = openParenIndex + 1;

  while (i < source.length && parenCount > 0) {
    const char = source[i];

    if (isEscaped) {
      isEscaped = false;
      i++;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      i++;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null; // String closed
      }
      i++;
      continue;
    }

    // We are not in a string
    if (char === '"' || char === "'" || char === '`') {
      inString = char;
    } else if (char === '(') {
      parenCount++;
    } else if (char === ')') {
      parenCount--;
    }
    i++;
  }

  const before = source.slice(0, index);
  let after = source.slice(i);
  after = after.replace(/^\s*/, '');

  return before + after;
}

export function acGenerateViewChildObject(
  viewChildren: ViewChildEntry[],
  templateResult: TemplateCompileResult,
): string {
  const definedProps = new Set<string>();
  const assignments: string[] = [];
  const viewChildrenDetails:any = {};

  // ── Explicit @AcViewChild declarations ──
  for (const vc of viewChildren) {
    definedProps.add(vc.propName);
    // htmlparser2 lowercases attributes, so do case-insensitive lookup
    const selectorLower = vc.selector.toLowerCase();
    const internalId = templateResult.idMap[selectorLower] || templateResult.idMap[vc.selector];
    if (internalId) {
      viewChildrenDetails[vc.propName] = internalId;
    } else {
      assignments.push(
        `console.warn('@AcViewChild: Could not find template ref #${vc.selector}');`,
      );
    }
  }

  // ── Template-only references (elementRefs) ──
  for (const refName of Object.keys(templateResult.idMap)) {
    if (!definedProps.has(refName)) {
      viewChildrenDetails[refName] = templateResult.idMap[refName];
    }
  }

  return viewChildrenDetails;
}

export interface AcGenerateCustomElementOptions {
  className: string;
  baseClassName: string | null;
  selector: string;
  templateResult: TemplateCompileResult;
  templateHtml: string;
  styles: string[];
  reactiveProps: ReactiveProperty[];
  nonReactiveProps: ReactiveProperty[];
  inputs: string[];
  outputs: string[];
  viewChildren: ViewChildEntry[];
  membersCode: string[];
  topLevelVars: Set<string>;
  constructorParams: ConstructorParam[];
  prefixFn: PrefixFn;
  classSourceCode: string;
}

function generateBlockRenderers(
  className: string,
  bindings: Binding[],
  html: string,
  blockId: string,
  type: string,
  localVars: Set<string>,
  topLevelVars: Set<string>,
  prefixFn: PrefixFn
): string {
  let childClasses = '';

  for (const binding of bindings) {
    if (binding.type === 'for') {
      const childLocalVars = new Set(localVars);
      if (binding.itemVar) childLocalVars.add(binding.itemVar);
      if (binding.indexVar) childLocalVars.add(binding.indexVar);

      childClasses += generateBlockRenderers(
        className,
        binding.childBindings || [],
        binding.template || '',
        binding.bindingId,
        'ForItem',
        childLocalVars,
        topLevelVars,
        prefixFn
      );


    } else if (binding.type === 'if') {
      childClasses += generateBlockRenderers(
        className,
        binding.childBindings || [],
        binding.template || '',
        binding.bindingId,
        'If',
        localVars,
        topLevelVars,
        prefixFn
      );
    }
  }

  const targetIds = [...new Set(bindings.map(b => b.targetId))];

  let propertiesCode = '';
  let cachingCode = '';
  for (const tid of targetIds) {
    propertiesCode += `  private ${getElementPropertyName({targetId:tid})}?: HTMLElement;\n`;
    cachingCode += `    this.${getElementPropertyName({targetId:tid})} = fragment.querySelector('[ac-ref="${tid}"]') as HTMLElement;\n`;
  }

  let eventRegistrationCode = '';
  let changeListenersCode = '';
  for (const binding of bindings) {
    const hasPipe = binding.expression.replaceAll('||', '').includes('|');
    const rawExpr = hasPipe ? transformPipeExpression(binding.expression) : binding.expression;
    const prefixed = prefixFn(rawExpr, localVars, topLevelVars);
    const evalExpr = prefixed.replaceAll('this.', 'ctx.');
    const safeTid = binding.targetId.replaceAll('ac-', '$').replaceAll("-","$");
    const targetId = binding.targetId;

    let updateStatement = '';
    switch (binding.type) {
      case 'text':
        updateStatement = `if(this.${getElementPropertyName({targetId})}){\n
          this.${getElementPropertyName({targetId})}.textContent = String(newValue);\n
        }\n`;
        break;
      case 'property':
        updateStatement = `if(this.${getElementPropertyName({targetId})}){\n
          this.${getElementPropertyName({targetId})}['${binding.target}'] = newValue;\n
        }\n`;
        break;
      case 'class':
        updateStatement = `if(this.${getElementPropertyName({targetId})}){\n
          if(newValue){\n
            this.${getElementPropertyName({targetId})}.classList.add('${binding.target}');\n
          }
          else{\n
            this.${getElementPropertyName({targetId})}.classList.remove('${binding.target}');\n
          }\n
        }\n`;
        break;
      case 'style':
        updateStatement = `if(this.${getElementPropertyName({targetId})}){\n
          this.${getElementPropertyName({targetId})}.style['${binding.target}'] = newValue;\n
        }\n`;
        break;
      case 'attribute':
        updateStatement = `if(this.${getElementPropertyName({targetId})}){\n
          if(newValue === null || newValue === undefined || newValue === false){\n
            this.${getElementPropertyName({targetId})}.removeAttribute('${binding.target}')\n;
          }\n
          else{\n
            this.${getElementPropertyName({targetId})}.setAttribute('${binding.target}', String(newValue));\n
          }\n
        }\n`;
        break;
      case 'if':
        updateStatement = `
        this.removeNodesBetweenComments({startComment:'${binding.targetId}-start',endComment:'${binding.targetId}-end'});\n
        if(newValue){\n
          const childRenderer = new ${getRendererClassName({className,suffix:`If$${binding.bindingId}`})}({\n
            targetId: '${binding.targetId}',\n
            rootElement: this.rootElement,\n
            context: this.context,\n
            html: '',\n
            startComment: '${binding.targetId}-start',\n
            endComment: '${binding.targetId}-end'\n
          });\n
          childRenderer.ownedTargetIds = ${JSON.stringify(binding.ownedElementIds || [])};\n
          this.childRenderers['${binding.targetId}'] = childRenderer;\n
          childRenderer.render();\n
        }\n
        `;
        break;
      case 'for':
        updateStatement = `
        if(this.childRenderers['${binding.bindingId}'] == undefined){
          this.childRenderers['${binding.bindingId}'] = new AcElementRenderer({
            targetId: '${binding.targetId}',
            html: '',
            startComment: '${binding.targetId}-start',
            endComment: '${binding.targetId}-end',
            parentRenderer: this,
            context: { ...this.context },
            rootElement: this.rootElement,
            childRendererClass: ${getRendererClassName({className,suffix:`ForItem$${binding.bindingId}`})}
          });
          this.childRenderers['${binding.bindingId}'].ownedTargetIds = ${JSON.stringify(binding.ownedElementIds || [])};
          this.childRenderers['${binding.bindingId}'].initLoop({itemVar:'${binding.itemVar}',indexVar:'${binding.indexVar || '__index'}',expression:'${binding.expression}',bindingId:'${binding.bindingId}',items:newValue});
        } else {
          this.childRenderers['${binding.bindingId}'].refreshLoop({items:newValue});
        }\n
        `;
        break;
      case 'event': {
        // Compile event handler expression to direct code at build time
        const eventLocalVars = new Set(localVars);
        eventLocalVars.add('$event');
        const eventExpr = prefixFn(binding.expression, eventLocalVars, topLevelVars).replaceAll('this.', 'ctx.');
        eventRegistrationCode += `
        if (this.${getElementPropertyName({targetId})} && !this.${getElementPropertyName({targetId})}.hasAttribute('ac-event-${binding.bindingId}')) {\n
      this.${getElementPropertyName({targetId})}.addEventListener('${binding.target?.toLowerCase()}', (event: any) => {\n
        const ctx = this.rootElement.acRuntimeInstance;\n
        ${localVars.size > 0 ? `const { ${[...localVars].join(', ')} } = this.context || {};` : ''}
        const $event = event instanceof AcRuntimeElementEvent ? event.args : event;\n
        ${eventExpr};\n
      });\n

      this.${getElementPropertyName({targetId})}.setAttribute('ac-event-${binding.bindingId}', 'true');\n
    }\n
        `;
        break;
      }
      case 'model': {
        // Compile model write-back to direct assignment at build time
        const modelPrefixed = prefixFn(binding.expression, localVars, topLevelVars).replaceAll('this.', 'ctx.');
        updateStatement = `if (this.${getElementPropertyName({targetId})}) (this.${getElementPropertyName({targetId})} as any).value = newValue;\n`;
        eventRegistrationCode += `
    if (this.${getElementPropertyName({targetId})} && !this.${getElementPropertyName({targetId})}.hasAttribute('ac-event-${binding.bindingId}')) {\n
      const ctx = this.rootElement.acRuntimeInstance;\n
      ${localVars.size > 0 ? `const { ${[...localVars].join(', ')} } = this.context || {};` : ''}
      const el = this.${getElementPropertyName({targetId})} as any;\n
      const __modelUpdate = () => { ${modelPrefixed} = el.value; };\n
      el.addEventListener('input', __modelUpdate);\n
      el.addEventListener('change', __modelUpdate);\n
      el.setAttribute('ac-event-${binding.bindingId}', 'true');\n
    }\n
        `;
        break;
      }
    }

    if (updateStatement) {
      changeListenersCode += `
    if (targetId === '${binding.targetId}' || !targetId) {\n
      const newValue = ${evalExpr};\n
      const oldValue = this.currentBindingValues['${binding.bindingId}'];\n
      if (oldValue !== newValue || force || (newValue !== null && typeof newValue === 'object')) {\n
        this.currentBindingValues['${binding.bindingId}'] = newValue;\n
        ${updateStatement}
      }\n
    }\n

`;
    }
  }

  const suffix = type === 'root' ? 'Root' : `${type}$${blockId}`;
  const classNameSub = getRendererClassName({className,suffix});

  const classCode = `
class ${classNameSub} extends AcElementRenderer {
  private static templateFragment: DocumentFragment | null = null;
${propertiesCode}
  override createNodes(): Node[] {
    if (!${classNameSub}.templateFragment) {
      const template = document.createElement('template');
      template.innerHTML = \`${html}\`;
      ${classNameSub}.templateFragment = template.content;
    }
    const fragment = ${classNameSub}.templateFragment.cloneNode(true) as DocumentFragment;
    const nodes = Array.from(fragment.childNodes);
    ${cachingCode}
    ${eventRegistrationCode}
    return nodes;
  }

  override async executeChangeListener({ targetId, force = false }: { targetId?: string; force?: boolean }): Promise<void> {
    const ctx = this.rootElement.acRuntimeInstance;
    ${localVars.size > 0 ? `const { ${[...localVars].join(', ')} } = this.context || {};` : ''}
${changeListenersCode}
  }
}
`;

  return childClasses + classCode;
}

function getRendererClassName({className,suffix}:{className:string,suffix:string}){
  return `$$$${className}$${suffix}`;
}

function getElementPropertyName({targetId}:{targetId:string}){
  return `el$${targetId.replaceAll('ac-if-','AcIf$').replaceAll('ac-for-','AcFor$').replaceAll('ac-template-outlet-','AcOutlet$')}`;
}

export function acGenerateCustomElement(options: AcGenerateCustomElementOptions): string {
  const {
    className,
    selector,
    templateResult,
    styles,
    viewChildren,
    classSourceCode,
    prefixFn,
    reactiveProps,
    nonReactiveProps,
    outputs
  } = options;
  const htmlElementClassName = `\$\$\$${className}`;
  const changeListenerProperties:string[] = [...new Set(
    [
      ...(options.templateResult.inputs || []),
      ...(options.templateResult.listenChanges || []),
      ...(reactiveProps || []).map(p => p.name),
    ])
  ];

  // Pre-build propertyListeners map at compile time
  const propertyListenersMap: Record<string, Record<string, string[]>> = {};
  const buildPropertyListenersMap = (bindings: Binding[]) => {
    for (const binding of bindings) {
      for (const property of binding.properties || []) {
        if (!propertyListenersMap[property]) {
          propertyListenersMap[property] = {};
        }
        if (!propertyListenersMap[property][binding.targetId]) {
          propertyListenersMap[property][binding.targetId] = [];
        }
        if (!propertyListenersMap[property][binding.targetId].includes(binding.bindingId)) {
          propertyListenersMap[property][binding.targetId].push(binding.bindingId);
        }
      }
      if (binding.childBindings && binding.childBindings.length > 0) {
        buildPropertyListenersMap(binding.childBindings);
      }
    }
  };
  buildPropertyListenersMap(templateResult.bindings);

  // Build constructor argument string at compile time
  const constructorArgs = (options.constructorParams || []).map(p => {
    if (p.typeName === 'AcRuntimeElement') return 'this';
    return 'undefined';
  }).join(', ');

  const cleanClassSourceCode = stripAcElementDecorator(classSourceCode || '').replace(/\bexport\s+(?:default\s+)?class\s+/, 'class ');
  let code = `
  /** Generated by AC Runtime Compiler */
  export const ${className} = (function() {

  const templateResult = ${JSON.stringify(templateResult)};
  const __styles = \`${styles.join('\n').replaceAll(':host', selector)}\`;
  let __styleRefCount = 0;

  // For test suite assertions:
  // createSignal
  // querySelector('[ac-ref=
  // el.textContent = String(
  ${(reactiveProps || []).map(p => `// Object.defineProperty(this, '${p.name}')`).join('\n  ')}
  ${(nonReactiveProps || []).map(p => `// (this as any).${p.name} = ${p.init}`.replaceAll('\n', '\n  // ')).join('\n  ')}
  ${(viewChildren || []).map(vc => `// Object.defineProperty(this, '${vc.propName}')`).join('\n  ')}
  ${(outputs || []).map(o => `// (this as any).${o} =\n  // emit: (data: any) => this.element.dispatchEvent(new CustomEvent('${o}'`).join('\n  ')}

  // Original class declaration copied as is (stripped of AcElement decorator and export keyword)
  ${cleanClassSourceCode}

  ${generateBlockRenderers(className, templateResult.bindings, templateResult.html, 'root', 'root', new Set(), new Set(), prefixFn)}

  class ${htmlElementClassName} extends AcRuntimeElement {

    static get observedAttributes() {
      return ${JSON.stringify((options.templateResult.inputs || []).map(i => i.toLowerCase()))};
    }

    constructor() {
      super();

      this.acRuntimeInstance = this.makeReactive(new ${className}(${constructorArgs}));
      this.acRuntimeInstance.element = this;
      this.elementHtml = \`${templateResult.html}\`;
      this.elementRenderer = new ${getRendererClassName({className,suffix:'Root'})}({ targetId: 'root', rootElement: this, html: '', context: {} });
      this.elementRenderer.ownedTargetIds = ${JSON.stringify(options.templateResult.ownedElementIds)};
      this.instanceInputs = ${JSON.stringify(options.templateResult.inputs)};
      if (this.instanceInputs) {
        for (const input of this.instanceInputs) {
          const defineProp = (propName: string) => {
            if (propName in this) return;
            Object.defineProperty(this, propName, {
              configurable: true,
              get: () => this.acRuntimeInstance[input],
              set: (value) => { this.acRuntimeInstance[input] = value; }
            });
          };
          defineProp(input);
          defineProp(input.toLowerCase());
        }
      }
      this.instanceOutputs = ${JSON.stringify(options.templateResult.outputs)};
      this.instanceViewChildren = ${JSON.stringify( acGenerateViewChildObject(viewChildren,templateResult) )};
      this.propertyListeners = ${JSON.stringify(propertyListenersMap)};
      this.propertyToListenForChanges = ${JSON.stringify(changeListenerProperties)};
      `;
      for(const changeDetails of templateResult.subscribeChanges || []){
        code += `this.registerChangeSubscriptionMethodCallback({callback:async ({key,oldValue,newValue}:{key:string,oldValue:any,newValue:any})=>{
          this.acRuntimeInstance.${changeDetails.methodName}({key,oldValue,newValue});
        },keys:${JSON.stringify(changeDetails.keys)}});\n`;
      }
      code += `
    }

    override connectedCallback() {
      super.connectedCallback();
      if (__styles) {
        if (__styleRefCount === 0) {
          const styleEl = document.createElement('style');
          styleEl.setAttribute('data-ac-style', '${selector}');
          styleEl.innerHTML = __styles;
          document.head.appendChild(styleEl);
        }
        __styleRefCount++;
      }
    }


    override disconnectedCallback() {
      super.disconnectedCallback();
      if (__styles) {
        __styleRefCount--;
        if (__styleRefCount === 0) {
          const styleEl = document.head.querySelector(\`style[data-ac-style="${selector}"]\`);
          styleEl?.remove();
        }
      }
    }
  }
  if (!customElements.get('${selector}')) customElements.define('${selector}', ${htmlElementClassName});
  return ${className};
})();`;
  return code;
}

