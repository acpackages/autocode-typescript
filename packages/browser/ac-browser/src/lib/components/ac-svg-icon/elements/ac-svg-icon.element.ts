/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementBase } from "../../../core/ac-element-base";
import { acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_SVG_ICON_TAG } from "../_ac-svg-icon.element";

export class AcSvgIcon extends AcElementBase {
  private slotEl!: HTMLSlotElement;

  static get observedAttributes(): string[] {
    return ['color', 'size', 'src', 'aria-label', 'spin', 'svg-code'];
  }

  private _svgCode:string = '';
  get svgCode():string{
    return this._svgCode;
  }
  set svgCode(value:string){
    this._svgCode = value;
    this.innerHTML = value;
  }

  override init(): void {
    super.init();
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' });

      shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 1em;
          height: 1em;
          line-height: 0;
          vertical-align: -0.125em;
          color: inherit;
          font-size: inherit;
        }
        :host([hidden]) { display: none !important; }
        svg {
          width: 100%;
          height: 100%;
          display: block;
          fill: currentColor;
          stroke: none;
        }
        :host([spin]) svg {
          animation: ac-icon-spin 1s linear infinite;
        }
        @keyframes ac-icon-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
      <slot id="slot"></slot>
    `;
      this.slotEl = shadow.querySelector('#slot') as HTMLSlotElement;
    }



    const src = this.getAttribute('src');
    if (src) this.loadFromSrc(src);

    this.applyColor(this.getAttribute('color'));
    this.applySize(this.getAttribute('size'));

    // Accessibility defaults
    if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
    if (!this.hasAttribute('aria-hidden') && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-hidden', 'true');
    }

    this.ensureSlotSvgStyle();
    this.slotEl.addEventListener('slotchange', () => this.ensureSlotSvgStyle());
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'color':
        this.applyColor(newValue);
        break;
      case 'size':
        this.applySize(newValue);
        break;
      case 'src':
        if (newValue) this.loadFromSrc(newValue);
        break;
      case 'svg-code':
        this.svgCode = newValue ?? '';
        break;
      case 'aria-label':
        if (newValue) this.removeAttribute('aria-hidden');
        else if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true');
        break;
      case 'spin':
        break; // handled via CSS
    }
  }

  private applyColor(color: string | null): void {
    if (!color) this.style.removeProperty('color');
    else this.style.setProperty('color', color);
  }

  private applySize(size: string | null): void {
    if (!size) this.style.removeProperty('font-size');
    else this.style.setProperty('font-size', size);
  }

  private ensureSlotSvgStyle(): void {
    const assigned = this.slotEl.assignedElements ? this.slotEl.assignedElements() : Array.from(this.children);
    assigned.forEach(el => this.applyToSvg(el as SVGElement));
  }

  private applyToSvg(svg: SVGElement): void {
    if (!svg || svg.tagName.toLowerCase() !== 'svg') return;

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    if (!svg.hasAttribute('fill')) svg.setAttribute('fill', 'currentColor');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';
  }

  override destroy(): void {
    this.innerHTML = '';
    super.destroy();
  }

  private async loadFromSrc(url: string): Promise<void> {
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`SVG fetch failed: ${res.status}`);
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svg = doc.querySelector('svg');
      if (!svg) throw new Error('No <svg> found in resource');

      this.clearLightDomSvg();
      const imported = document.importNode(svg, true) as SVGElement;
      this.appendChild(imported);
      this.ensureSlotSvgStyle();
    } catch (err) {
      console.warn('AcIcon: failed to load SVG from', url, err);
    }
  }

  private clearLightDomSvg(): void {
    Array.from(this.children)
      .filter(c => c.tagName.toLowerCase() === 'svg')
      .forEach(c => c.remove());
  }
}

acRegisterCustomElement({ tag: AC_SVG_ICON_TAG.svgIcon, type: AcSvgIcon });
