/**
 * @module types
 *
 * Central type definitions shared across all compiler modules.
 *
 * All interfaces are defined here to:
 * 1. Avoid circular dependencies between modules.
 * 2. Provide a single source of truth for data shapes.
 * 3. Make the codebase easier to navigate — look here first
 *    to understand what data flows through the compiler.
 */

// ─── Template Compiler Types ─────────────────────────────────────────────────

/**
 * Describes a single reactive binding extracted from an HTML template.
 *
 * When the template compiler finds something like `[class.active]="isActive"`,
 * it creates a Binding object that tells the code generator:
 * - What TYPE of binding it is (class toggle, property set, event listener, etc.)
 * - What EXPRESSION to evaluate (`isActive`)
 * - Which DOM ELEMENT to target (via the `targetId` — a unique `ac-ref` attribute)
 *
 * The code generator then turns each Binding into a `createEffect()` call
 * that keeps the DOM in sync with the component's reactive state.
 */
export interface Binding {
  /**
   * The kind of binding. Each type generates different runtime code:
   *
   * | Type              | Generated Code Pattern                                |
   * |-------------------|-------------------------------------------------------|
   * | `'text'`          | `el.textContent = String(expr)`                       |
   * | `'property'`      | `el[prop] = expr`                                     |
   * | `'event'`         | `el.addEventListener(event, handler)`                 |
   * | `'class'`         | `el.classList.add/remove(name)`                       |
   * | `'style'`         | `el.style[prop] = expr`                               |
   * | `'model'`         | Two-way: sets value + listens for input                |
   * | `'attribute'`     | `el.setAttribute/removeAttribute(name, expr)`         |
   * | `'if'`            | Conditional DOM insertion/removal                     |
   * | `'for'`           | Repeated DOM rendering for each list item             |
   * | `'template-outlet'`| Injects a template's innerHTML into a target element |
   */
  type:
    | 'text'
    | 'property'
    | 'event'
    | 'if'
    | 'for'
    | 'class'
    | 'model'
    | 'style'
    | 'attribute'
    | 'template-outlet'
    | 'template';

  /** The raw expression string from the template (e.g., `'count > 5'`). */
  expression: string;

  /** Array of property names that can update this binding. */
  properties?: string[];

  /**
   * The target name — its meaning depends on the binding type:
   * - `'event'`:     The event name (e.g., `'click'`)
   * - `'class'`:     The CSS class name (e.g., `'active'`)
   * - `'style'`:     The CSS property name (e.g., `'color'`)
   * - `'property'`:  The DOM property path (e.g., `'value'` or `'config.theme'`)
   * - `'model'`:     Combined `prop:event` string (e.g., `'value:input'`)
   * - `'attribute'`: The HTML attribute name (e.g., `'title'`)
   */
  target?: string;

  /**
   * A unique identifier (e.g., `'ac-3f8a1b2c'`) injected as an `ac-ref`
   * attribute on the target DOM element. The generated code uses
   * `querySelector('[ac-ref="..."]')` to find the element at runtime.
   */
  targetId: string;

  /** For structural directives (`ac:if`, `ac:for`): the inner HTML template string. */
  template?: string;

  /** For structural directives: recursively extracted child bindings. */
  childBindings?: Binding[];

  /** For `ac:for`: the loop item variable name (e.g., `'item'` in `item of items`). */
  itemVar?: string;

  /** For `ac:for`: the loop index variable name (e.g., `'i'` in `let i = index`). */
  indexVar?: string;

  /** For `ac:template:outlet`: optional context expression (e.g., `{ item: x }`). */
  contextExpression?: string;

  /** Root element IDs (reserved for future multi-root support). */
  rootIds: string[];

  bindingId: string;
}

/**
 * The output of template compilation.
 *
 * Contains everything the code generator needs to produce
 * the component's `render()` method and reactive effects.
 */
export interface TemplateCompileResult {
  /**
   * The cleaned HTML string. All dynamic attributes (`[prop]`, `(event)`, etc.)
   * have been removed and replaced with `ac-ref` ID attributes.
   *
   * This HTML is set via `innerHTML` at runtime, then bindings attach
   * effects to the elements identified by their `ac-ref` IDs.
   */
  html: string;

  /** Flat array of binding descriptors (including nested structural ones). */
  bindings: Binding[];

  /**
   * Maps template ref names (`#refName`) to their generated `ac-ref` IDs.
   *
   * Example: If the template has `<div #myDiv>`, this map will contain
   * `{ myDiv: 'ac-3f8a1b2c' }`. The component compiler uses this to
   * wire up `@AcViewChild('myDiv')` properties.
   */
  idMap: Record<string, string>;

  /**
   * Maps reactive property names to the elements reactive to them,
   * along with the type of reactivity (e.g. 'value', 'class', 'model', 'bind', 'if', 'for', 'style', etc.).
   */
  reactiveProperties: Record<string, ReactivePropertyDef[]>;

  /** @AcInput() property names extracted from the class definition. */
  inputs?: string[];

  /** @AcOutput() property names extracted from the class definition. */
  outputs?: string[];

  /** @AcViewChild() entries extracted from the class definition. */
  viewChildren?: ViewChildEntry[];
}

export interface ReactivePropertyDef {
  targetId: string;
  type: string;
  expression: string;
  property?:string;
  targetElementHtmle?: string;
}

// ─── Component Compiler Types ────────────────────────────────────────────────

/**
 * Parsed metadata extracted from the `@AcElement()` decorator.
 *
 * When the compiler encounters:
 * ```ts
 * @AcElement({
 *   selector: 'app-header',
 *   template: '<div>Hello</div>',
 *   styles: ':host { color: red; }'
 * })
 * ```
 *
 * It creates a ComponentMetadata object with those values.
 */
export interface ComponentMetadata {
  /** Custom element tag name (e.g., `'app-header'`). Must contain a hyphen per spec. */
  selector: string;

  /** Inline template string (from `template:` property). */
  template?: string;

  /** Relative path to external template file (from `templateUrl:`). */
  templateUrl?: string;

  /** Inline styles — single string or array (from `styles:`). */
  styles?: string | string[];

  /** Relative paths to external style files (from `styleUrls:`). */
  styleUrls?: string | string[];
}

/**
 * Describes a class property that will be backed by a reactive signal.
 *
 * Properties become reactive (signal-backed) if they are:
 * 1. Referenced in the component's template expressions, OR
 * 2. Decorated with `@AcInput()`.
 *
 * Signal-backed means: reading the property triggers dependency tracking,
 * and writing to it automatically re-runs any effects that read it.
 */
export interface ReactiveProperty {
  /** The property name as declared in the source class. */
  name: string;

  /**
   * The property's initializer expression as a string.
   * Examples: `"'World'"`, `"0"`, `"undefined"`, `"[1, 2, 3]"`.
   */
  init: string;

  /** Original declaration order index, used to preserve initialization order. */
  sourceIndex: number;
}

/** Maps a class property to its `#ref` template reference. */
export interface ViewChildEntry {
  /** The class property name decorated with `@AcViewChild`. */
  propName: string;

  /** The template reference name (value of `#name` in the template). */
  selector: string;
}

/** Output of compiling a single component. */
export interface CompileResult {
  /** The custom element selector, or `null` for non-component files. */
  selector: string | null;

  /** The complete generated TypeScript code (imports + IIFE). */
  code: string;

  /** Properties/methods decorated with @AcSubscribeChange() */
  subscribeChanges?: { propName: string; keys: string[] }[];

  /** Properties/methods decorated with @AcListenChanges() */
  listenChanges?: { propName: string; keys: string[] }[];
}

/** Intermediate pairing of a class AST node with its extracted metadata. */
export interface ComponentInfo {
  /** The TypeScript class declaration AST node. */
  node: import('typescript').ClassDeclaration;

  /** Metadata extracted from the `@AcElement()` decorator. */
  metadata: ComponentMetadata;
}

// ─── Binding Generator Types ─────────────────────────────────────────────────

/**
 * Function signature for the expression prefixer.
 *
 * Takes a raw template expression like `count > 5` and rewrites bare
 * identifiers to `this.count > 5` so the generated code accesses the
 * component instance's signal-backed properties.
 *
 * @param expression   - The raw expression string from the template.
 * @param localVars    - Variables in local scope (e.g., `item` from `ac:for`).
 * @param topLevelVars - Top-level file-scope identifiers (imports, consts).
 * @returns The rewritten expression string.
 */
export type PrefixFn = (
  expression: string,
  localVars: Set<string>,
  topLevelVars: Set<string>,
) => string;

/**
 * Function signature for the recursive binding generator.
 *
 * Used by structural directives (`ac:if`, `ac:for`) to generate code
 * for their nested child bindings.
 */
export type GenerateBindingsFn = (
  bindings: Binding[],
  localVars: Set<string>,
  rootContainer: string,
) => string[];
