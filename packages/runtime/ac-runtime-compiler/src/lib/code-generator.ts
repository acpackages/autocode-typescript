/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-useless-escape */
import type {
  TemplateCompileResult,
  ReactiveProperty,
  ViewChildEntry,
  Binding,
  PrefixFn,
  ConstructorParam,
} from './types.js';


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
  const viewChildrenDetails: any = {};

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
  prefixFn: PrefixFn,
  templateResult: TemplateCompileResult
): string {
  let childClasses = '';
  let rootViewChildCode = '';
  let propertiesCode = '';
  let cachingCode = '';
  let viewChildCode = '';
  const elementTargetIds: string[] = [];

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
        prefixFn,
        templateResult
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
        prefixFn,
        templateResult
      );
    } else if (binding.type === 'template') {
      // Generate a renderer sub-class for the template's inner content
      childClasses += generateBlockRenderers(
        className,
        binding.childBindings || [],
        binding.template || '',
        binding.bindingId,
        'Template',
        localVars,
        topLevelVars,
        prefixFn,
        templateResult
      );
    }
    else if (binding.type === 'viewChildren') {
      // Generate a renderer sub-class for the template's inner content
      rootViewChildCode += `if((this.${getElementPropertyName({ targetId: binding.targetId })} as any).acRuntimeInstance){
              (this.rootElement as any).acRuntimeInstance['${binding.expression}'] = (this.${getElementPropertyName({ targetId: binding.targetId })} as any).acRuntimeInstance;
              this.rootElement.viewChildren['${binding.expression}'] = (this.${getElementPropertyName({ targetId: binding.targetId })} as any).acRuntimeInstance;
            }
            else{
              (this.rootElement as any).acRuntimeInstance['${binding.expression}'] = this.${getElementPropertyName({ targetId: binding.targetId })};
              this.rootElement.viewChildren['${binding.expression}'] = (this.${getElementPropertyName({ targetId: binding.targetId })} as any);
            }`;
    }
    if (!['for', 'if'].includes(binding.type)) {
      if (!elementTargetIds.includes(binding.targetId)) {
        propertiesCode += ` private ${getElementPropertyName({ targetId: binding.targetId })}?: HTMLElement;\n`;
        cachingCode += `this.${getElementPropertyName({ targetId: binding.targetId })} = fragment.querySelector('[ac-ref="${binding.targetId}"]') as HTMLElement;\n`;
        for (const viewChild of templateResult.viewChildren) {
          if (viewChild.elementRefId == binding.targetId) {
            viewChildCode += `
          if(this.${getElementPropertyName({ targetId: binding.targetId })}){
            if((this.${getElementPropertyName({ targetId: binding.targetId })} as any).acRuntimeInstance){
              (this.rootElement as any).acRuntimeInstance['${viewChild.propName}'] = (this.${getElementPropertyName({ targetId: binding.targetId })} as any).acRuntimeInstance;
            }
            else{
              (this.rootElement as any).acRuntimeInstance['${viewChild.propName}'] = this.${getElementPropertyName({ targetId: binding.targetId })};
            }
          }
          `
          }
        }
        elementTargetIds.push(binding.targetId);
      }
    }
  }

  let eventRegistrationCode = '';
  let updaterMethods = '';
  let subscriptionCode = '';
  for (const binding of bindings) {
    const hasPipe = binding.expression.replaceAll('||', '').includes('|');
    let expression = binding.expression;
    if (hasPipe) {
      expression = `await this.evaluateExpression({expression:\`${expression}\`,context:{ctx:acRuntimeInstance}});`;
    }
    else {
      expression = prefixFn(expression, localVars, topLevelVars).replace(/\bthis\b/g, 'acRuntimeInstance');
    }
    const targetId = binding.targetId;

    let updateStatement = '';
    switch (binding.type) {
      case 'text':
        updateStatement = `if(this.${getElementPropertyName({ targetId })}){\n
          this.${getElementPropertyName({ targetId })}.textContent = String(newValue ?? '');\n
        }\n`;
        break;
      case 'property':
        updateStatement = `if(this.${getElementPropertyName({ targetId })}){\n
          if((this.${getElementPropertyName({ targetId })} as any).acRuntimeInstance){\n
            (this.${getElementPropertyName({ targetId })} as any).acRuntimeInstance['${binding.target}'] = newValue;\n
          }\n
          else{
            (this.${getElementPropertyName({ targetId })} as any)['${binding.target}'] = newValue;
          }\n
        }\n`;
        break;
      case 'class':
        updateStatement = `if(this.${getElementPropertyName({ targetId })}){\n
          if(newValue){\n
            this.${getElementPropertyName({ targetId })}.classList.add('${binding.target}');\n
          }
          else{\n
            this.${getElementPropertyName({ targetId })}.classList.remove('${binding.target}');\n
          }\n
        }\n`;
        break;
      case 'style':
        updateStatement = `if(this.${getElementPropertyName({ targetId })}){\n
          this.${getElementPropertyName({ targetId })}.style['${binding.target}'] = newValue;\n
        }\n`;
        break;
      case 'attribute':
        updateStatement = `if(this.${getElementPropertyName({ targetId })}){\n
        `;
        if (binding.target.toLowerCase() == 'innerhtml') {
          updateStatement += `
          if(newValue === null || newValue === undefined || (newValue as any) === false){\n
            this.${getElementPropertyName({ targetId })}.innerHTML = ''\n;
          }\n
          else{\n
            this.${getElementPropertyName({ targetId })}.innerHTML = String(newValue);\n
          }\n`;
        }
        else {
          updateStatement += `
            if(newValue === null || newValue === undefined || (newValue as any) === false){\n
              this.${getElementPropertyName({ targetId })}.removeAttribute('${binding.target}')\n;
            }\n
            else{\n
              this.${getElementPropertyName({ targetId })}.setAttribute('${binding.target}', String(newValue));\n
            }\n`;
        }
        updateStatement += `}\n`;
        break;
      case 'if':

        updateStatement = `
        this.destroyChildRenderer('${binding.targetId}');
        this.removeNodesBetweenComments({startComment:'${binding.targetId}-start',endComment:'${binding.targetId}-end'});\n
        if(newValue){\n
          const childRenderer = new ${getRendererClassName({ className, suffix: `If$${binding.bindingId}` })}({\n
            targetId: '${binding.targetId}',\n
            rootElement: this.rootElement,\n
            context: this.context,\n
            startComment: '${binding.targetId}-start',\n
            endComment: '${binding.targetId}-end'\n,
            parentRenderer:this\n
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
          this.childRenderers['${binding.bindingId}'] = new AcElementArrayRenderer({
            targetId: '${binding.targetId}',
            startComment: '${binding.targetId}-start',
            endComment: '${binding.targetId}-end',
            parentRenderer: this,
            context: { ...this.context },
            rootElement: this.rootElement,
            childRendererClass: ${getRendererClassName({ className, suffix: `ForItem$${binding.bindingId}` })}
          });
          (this.childRenderers['${binding.bindingId}'] as any).ownedTargetIds = ${JSON.stringify(binding.ownedElementIds || [])};
          (this.childRenderers['${binding.bindingId}'] as any).initLoop({itemVar:'${binding.itemVar}',indexVar:'${binding.indexVar || '__index'}',expression:'${binding.expression}',bindingId:'${binding.bindingId}',items:newValue});
        } else {
          (this.childRenderers['${binding.bindingId}'] as any).refreshLoop({items:newValue});
        }\n
        `;
        break;
      case 'event': {
        // Compile event handler expression to direct code at build time
        const eventLocalVars = new Set(localVars);
        eventLocalVars.add('$event');
        const eventExpr = prefixFn(binding.expression, eventLocalVars, topLevelVars).replace(/\bthis\b/g, 'acRuntimeInstance');
        eventRegistrationCode += `
        if (this.${getElementPropertyName({ targetId })} && !this.${getElementPropertyName({ targetId })}.hasAttribute('ac-event-${binding.bindingId}')) {\n
      this.${getElementPropertyName({ targetId })}.addEventListener('${binding.target?.toLowerCase()}', (event: any) => {\n
        const acRuntimeInstance = this.rootElement.acRuntimeInstance;\n
        ${localVars.size > 0 ? `const { ${[...localVars].join(', ')} } = this.context || {};` : ''}
        const $event = event instanceof AcRuntimeElementEvent ? event.args : event;\n
        ${eventExpr};\n
      });\n

      this.${getElementPropertyName({ targetId })}.setAttribute('ac-event-${binding.bindingId}', 'true');\n
    }\n
        `;
        break;
      }
      case 'model': {
        // Compile model write-back to direct assignment at build time
        const modelPrefixed = prefixFn(binding.expression, localVars, topLevelVars).replace(/\bthis\b/g, 'acRuntimeInstance');
        updateStatement = `if (this.${getElementPropertyName({ targetId })}) (this.${getElementPropertyName({ targetId })} as any).value = newValue;\n`;
        eventRegistrationCode += `
    if (this.${getElementPropertyName({ targetId })} && !this.${getElementPropertyName({ targetId })}.hasAttribute('ac-event-${binding.bindingId}')) {\n
      const acRuntimeInstance = this.rootElement.acRuntimeInstance;\n
      ${localVars.size > 0 ? `const { ${[...localVars].join(', ')} } = this.context || {};` : ''}
      const el = this.${getElementPropertyName({ targetId })} as any;\n
      const __modelUpdate = () => { ${modelPrefixed} = el.value; };\n
      el.addEventListener('input', __modelUpdate);\n
      el.addEventListener('change', __modelUpdate);\n
      el.setAttribute('ac-event-${binding.bindingId}', 'true');\n
    }\n
            `;
        break;
      }
      case 'template': {
        // No updateStatement needed — templates register themselves during initial state
        break;
      }
      case 'template-outlet': {
        const outletTargetId = binding.targetId;
        updateStatement = `
        {
          let templateDef = this.rootElement.templates[newValue];
          if (!templateDef && newValue && typeof newValue === 'object' && newValue.rendererClass) {
            templateDef = newValue;
          }
          this.destroyChildRenderer('${outletTargetId}');
          this.removeNodesBetweenComments({ startComment: '${outletTargetId}-start', endComment: '${outletTargetId}-end' });
          if (templateDef) {
            this.createChildRenderer({
              targetId: '${outletTargetId}',
              startComment: '${outletTargetId}-start',
              endComment: '${outletTargetId}-end',
              context: {},
              rootElement: templateDef.rootElement,
              ownedTargetIds: templateDef.ownedElementIds || [],
              childRendererClass: templateDef.rendererClass
            });
          }
        }
        `;
        break;
      }
    }

    if (updateStatement) {
      const updaterName = `update$${binding.bindingId}`;
      updaterMethods += `
  private async ${updaterName}(force = false): Promise<void> {
    const acRuntimeInstance = this.rootElement.acRuntimeInstance;
    ${localVars.size > 0 ? `const { ${[...localVars].join(', ')} } = this.context || {};` : ''}
    const newValue = ${expression};
    const oldValue = this.currentBindingValues['${binding.bindingId}'];
    if (oldValue !== newValue || force || (newValue !== null && typeof newValue === 'object')) {
      this.currentBindingValues['${binding.bindingId}'] = newValue;
      ${updateStatement}
    }
  }
      `;

      subscriptionCode += `this.${updaterName}(true);\n `;
      // initialStateCode += `this.executeChangeListener({targetId:'${tid}',force:true,isFirst:true});\n`;
      for (const property of binding.properties || []) {
        subscriptionCode += ` this.subscribe('${property}', () => this.${updaterName}());\n`;
      }
      for (const property of binding.arrayItemProperties || []) {
        subscriptionCode += ` this.subscribeArrayItem('${property}', () => this.${updaterName}());\n`;
      }
    }
  }


  const suffix = type === 'root' ? 'Root' : `${type}$${blockId}`;
  const classNameSub = getRendererClassName({ className, suffix });

  let classCode: string = `
class ${classNameSub} extends AcElementRenderer {
  private static templateFragment: DocumentFragment | null = null;
  ${propertiesCode}
  ${updaterMethods}

  override createRendererNodes(): void {
    if (!${classNameSub}.templateFragment) {
      const template = document.createElement('template');
      template.innerHTML = \`<!--\${this.rendererStartCommentText}--> ${html} <!--\${this.rendererEndCommentText}-->\`;
      ${classNameSub}.templateFragment = template.content;
    }
    const fragment = ${classNameSub}.templateFragment.cloneNode(true) as DocumentFragment;
    this.nodes = Array.from(fragment.childNodes);
    ${cachingCode}
  } `;

  if (eventRegistrationCode != '') {
    classCode += `
    override registerElementEvents(){
      ${eventRegistrationCode}
    }`;
  }

  if (subscriptionCode != '') {
    classCode += `
    override setInitialState(){
      ${subscriptionCode}
    }`;
  }

  if (viewChildCode != '' || rootViewChildCode != '') {
    classCode += `

    override setViewChildRefs(){
      ${rootViewChildCode}
      ${viewChildCode}
    }`;
  }

  // Generate resolveTemplateOutlets override for template-outlet bindings
  const templateOutletBindings = bindings.filter(b => b.type === 'template-outlet');
  const templateBindings = bindings.filter(b => b.type === 'template');
  let templateOutletCode = '';

  // Register template definitions on the root element
  for (const tb of templateBindings) {
    const templateRefName = tb.expression;
    const templateRendererClass = getRendererClassName({ className, suffix: `Template$${tb.bindingId}` });
    templateOutletCode += `
    this.rootElement.templates['${templateRefName}'] = {
      html: \`${tb.template || ''}\`,
      ownedElementIds: ${JSON.stringify(tb.ownedElementIds || [])},
      rootElement: this.rootElement,
      rendererClass: ${templateRendererClass}
    };
    if (this.rootElement.acRuntimeInstance) {
      this.rootElement.acRuntimeInstance['${templateRefName}'] = this.rootElement.templates['${templateRefName}'];
    }\n`;
  }

  // Resolve template outlets by creating child renderers
  for (const ob of templateOutletBindings) {
    const outletTargetId = ob.targetId;
    templateOutletCode += `
    {
      let templateDef = this.rootElement.templates['${ob.expression}'];
      if (!templateDef && this.rootElement.acRuntimeInstance) {
        const val = this.rootElement.acRuntimeInstance['${ob.expression}'];
        if (val) {
          if (typeof val === 'string') {
            templateDef = this.rootElement.templates[val];
          } else if (typeof val === 'object' && val.rendererClass) {
            templateDef = val;
          }
        }
      }
      if (templateDef) {
        this.createChildRenderer({
          targetId: '${outletTargetId}',
          startComment: '${outletTargetId}-start',
          endComment: '${outletTargetId}-end',
          context: {},
          rootElement: templateDef.rootElement,
          ownedTargetIds: templateDef.ownedElementIds || [],
          childRendererClass: templateDef.rendererClass
        });

      }
    }\n`;
  }

  if (templateOutletCode) {
    classCode += `
    override resolveTemplateOutlets(){
      ${templateOutletCode}
    }`;
  }

  classCode += `}`;

  return childClasses + classCode;
}

function getRendererClassName({ className, suffix }: { className: string, suffix: string }) {
  return `$$$${className}$${suffix}`;
}

function getElementPropertyName({ targetId }: { targetId: string }) {
  return `el$${targetId.replaceAll('ac-if-', 'AcIf$').replaceAll('ac-for-', 'AcFor$').replaceAll('ac-template-outlet-', 'AcOutlet$')}`;
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
  const changeListenerProperties: string[] = [...new Set(
    [
      ...(options.templateResult.inputs || []),
      ...(options.templateResult.listenChanges || []),
      ...(reactiveProps || []).map(p => p.name),

    ])
  ];

  for (const changeDetails of templateResult.subscribeChanges || []) {
    for(const key of changeDetails.keys){
      changeListenerProperties.push(key);
    }
  }

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

  const stylesScript = styles.join('\n').replaceAll(':host', '&').trim();
  const cleanClassSourceCode = stripAcElementDecorator(classSourceCode || '').replace(/\bexport\s+(?:default\s+)?class\s+/, 'class ');
  let code = `
  /** Generated by AC Runtime Compiler */
  export const ${className} = (function() {`;

  code += `\n\n\tconst templateResult = ${JSON.stringify(templateResult)};\n`;

  if (stylesScript != '') {
    code += `\nconst __styles = \`${selector} {\n ${stylesScript} \n}\`;
  let __styleRefCount = 0;`;
  }

  code += `

  // Original class declaration copied as is (stripped of AcElement decorator and export keyword)
  ${cleanClassSourceCode}

  ${generateBlockRenderers(className, templateResult.bindings, templateResult.html, 'root', 'root', new Set(), new Set(), prefixFn, templateResult)}

  class ${htmlElementClassName} extends AcRuntimeElement {

    static get observedAttributes() {
      return ${JSON.stringify((options.templateResult.inputs || []).map(i => i.toLowerCase()))};
    }

    constructor() {
      super();
      this.propertyToListenForChanges = ${JSON.stringify(changeListenerProperties)};
      this.acRuntimeInstance = this.makeReactive(new ${className}(${constructorArgs}));
      this.elementRenderer = new ${getRendererClassName({ className, suffix: 'Root' })}({ targetId: 'root', rootElement: this, context: {} });
      this.instanceInputs = ${JSON.stringify(options.templateResult.inputs)};
      this.instanceOutputs = ${JSON.stringify(options.templateResult.outputs)};

      `;
  for (const changeDetails of templateResult.subscribeChanges || []) {
    code += `this.registerChangeSubscriptionMethodCallback({callback:async ({key,oldValue,newValue}:{key:string,oldValue:any,newValue:any})=>{
          this.acRuntimeInstance.${changeDetails.methodName}({key,oldValue,newValue});
        },keys:${JSON.stringify(changeDetails.keys)}});\n`;
  }
  code += `
    }

    `;

  if (stylesScript != '') {
    code += `override connectedCallback() {
      super.connectedCallback();
      if (__styles) {
        if (__styleRefCount === 0) {
          const styleEl = document.createElement('style');
          styleEl.setAttribute('ac-element-style', '${selector}');
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
          const styleEl = document.head.querySelector(\`style[ac-element-style="${selector}"]\`);
          styleEl?.remove();
        }
      }
    }

    `;
  }
  code += `
  }
  if (!customElements.get('${selector}')) customElements.define('${selector}', ${htmlElementClassName});
  return ${className};

})();`;
  return code;
}

