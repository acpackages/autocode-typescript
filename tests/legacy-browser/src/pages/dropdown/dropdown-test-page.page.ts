/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDropdown } from '@autocode-ts/ac-browser';

export class DropdownTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcDropdown Test Page</h2>
        <p>This page demonstrates <code>AcDropdown</code> behavior for:</p>
        <ul>
          <li>All 4 placements</li>
          <li>Keyboard navigation</li>
          <li>Hover trigger</li>
          <li>ARIA attributes</li>
          <li>Auto-flip positioning</li>
        </ul>

        ${this.renderTestBlock('Bottom Dropdown', 'bottom', false,'menu-bottom', ['Action 1', 'Action 2', 'Action 3'])}
        ${this.renderTestBlock('Top Dropdown', 'top', false,'menu-top', ['Item A', 'Item B', 'Item C'])}
        ${this.renderTestBlock('Left Dropdown', 'left', false,'menu-left', ['Option X', 'Option Y', 'Option Z'])}
        ${this.renderTestBlock('Right Dropdown', 'right', false,'menu-right', ['Alpha', 'Beta', 'Gamma'])}
        ${this.renderTestBlock('Hover Dropdown (bottom)', 'hover-bottom', true,'menu-hover-bottom', ['Hover A', 'Hover B', 'Hover C'])}
        <div style="position:fixed;top:0px;right:0px">
        <ac-dropdown>
        <button type="button" class="btn btn-primary"  ac-dropdown-trigger>
          Dropdown
        </button>
        <div class="dropdown-menu-test" role="menu" ac-dropdown-target>
        <ul class="list-unstyled m-0 p-2">
          <li>Item 01</li>
          <li>Item 02</li>
          <li>Item 03</li>
        </ul>
      </div>
        </ac-dropdown>
        </div>

      </div>
        <hr class="my-5">
        <p class="text-muted"><small>All dropdowns above are positioned using JavaScript and <code>AcDropdown</code> internal logic with extra Bootstrap-like behavior.</small></p>
      </div>
    `;

    // CSS styling for demo
    const style = document.createElement('style');
    style.textContent = `
      .dropdown-menu-test {
        background: white;
        border: 1px solid #ccc;
        min-width: 150px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
      .dropdown-menu-test a {
        display: block;
        padding: 5px 10px;
        color: #333;
        text-decoration: none;
      }
      .dropdown-menu-test a:hover,
      .dropdown-menu-test a:focus {
        background-color: #f0f0f0;
        outline: none;
      }
    `;
    document.head.appendChild(style);

    // Initialize dropdowns
    // const dropdowns: Record<string, AcDropdown> = {
    //   bottom: new AcDropdown({element:this.querySelector('#dropdowm')?.parentElement as HTMLElement, options:{
    //     menu: this.querySelector('#menu-bottom') as HTMLElement,
    //     position: 'bottom',
    //   }}),
    //   top: new AcDropdown({element:this.querySelector('[data-trigger="top"]')?.parentElement as HTMLElement,options: {
    //     menu: this.querySelector('#menu-top') as HTMLElement,
    //     position: 'top',
    //   }}),
    //   left: new AcDropdown({element:this.querySelector('[data-trigger="left"]')?.parentElement as HTMLElement,options:{
    //     menu: this.querySelector('#menu-left') as HTMLElement,
    //     position: 'left',
    //   }}),
    //   right: new AcDropdown({element:this.querySelector('[data-trigger="right"]')?.parentElement as HTMLElement, options:{
    //     menu: this.querySelector('#menu-right') as HTMLElement,
    //     position: 'right',
    //   }}),
    //   hoverBottom: new AcDropdown({element:this.querySelector('[data-trigger="hover-bottom"]')?.parentElement as HTMLElement,options: {
    //     menu: this.querySelector('#menu-hover-bottom') as HTMLElement,
    //     position: 'bottom',
    //     triggerAction: 'hover'
    //   }}),
    // };

    // console.log('Dropdowns initialized:', dropdowns);
  }

  private renderTestBlock(title: string, placement: string, hover: boolean = false,id: string, items: string[]): string {
    return `
      <div class="mb-4">
        <h5>${title}</h5>

    <ac-dropdown placement="${placement}" id="dropdown${placement}${hover}" trigger="${hover?'hover':'click'}">
        <button type="button" class="btn btn-primary" data-trigger="${placement}" ac-dropdown-trigger>
          ${hover ? 'Hover ' : 'Toggle '} ${title}
        </button>
        ${this.renderMenu(id,items)}
        </ac-dropdown>
      </div>
    `;
  }

  private renderMenu(id: string, items: string[]): string {
    return `
      <div id="${id}" class="dropdown-menu-test" role="menu" ac-dropdown-target>
        <ul class="list-unstyled m-0 p-2">
          ${items.map(text => `<li ac-dropdown-item><a href="#" role="menuitem" tabindex="-1">${text}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }
}
