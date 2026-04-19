import { AcTabs, AcTabsAttributeName, AcTabsCssClassName, IAcTabsOptions } from "@autocode-ts/ac-browser";


export class TabsTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container py-4">
        <h2 class="mb-4">AcTabs Test Page</h2>
        <p>This page demonstrates <code>AcTabs</code> behaviors: basic usage, disabled tabs, keyboard nav, hash updates, and programmatic controls.</p>

        ${this.renderBlock({
          title: 'Basic Tabs',
          key: 'basic',
          description: 'Standard horizontal tabs with fade panes.',
          options: { loop: true, updateHash: false, preventScrollOnHash: true }
        })}

        ${this.renderBlock({
          title: 'With Disabled Tab',
          key: 'disabled',
          description: 'Second tab disabled initially; use controls to enable it.',
          options: { loop: true }
        })}

        ${this.renderBlock({
          title: 'Hash Update',
          key: 'hash',
          description: 'Updates location hash on activation; reload keeps last active pane.',
          options: { updateHash: false, preventScrollOnHash: true }
        })}

        ${this.renderBlock({
          title: 'No Loop Navigation',
          key: 'noloop',
          description: 'Arrow/Home/End navigation without circular wrap.',
          options: { loop: false }
        })}

        <hr class="my-5">
        <p class="text-muted"><small>Tip: Use Arrow keys, Home/End on a focused tab; Enter/Space to activate.</small></p>
      </div>
    `;

    // Instantiate AcTabs for each demo block
    this.querySelectorAll<HTMLElement>('[data-actabs-block]').forEach(block => {
      const tablist = block.querySelector<HTMLElement>('[data-actabs-tablist]');
      const optsRaw = block.getAttribute('data-actabs-options');
      const options: IAcTabsOptions = optsRaw ? JSON.parse(optsRaw) : {};
      if (!tablist) return;

      // Create instance and stash it on the block element
      const instance = block.querySelector('ac-tabs') as AcTabs;
      (block as any).__acTabs = instance;

      // Hook up control buttons
      block.querySelectorAll<HTMLButtonElement>('[data-actabs-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-actabs-action');
          const target = btn.getAttribute('data-actabs-target');
          switch (action) {
            case 'next':
              instance.next();
              break;
            case 'prev':
              instance.prev();
              break;
            case 'show':
              if (target) instance.show({ target, options: { skipFocus: false } });
              break;
            case 'enable':
              if (target) instance.enable({target, enable:true});
              break;
            case 'disable':
              if (target) instance.enable({target, enable:false});
              break;
          }
        });
      });
    });
  }

  private renderBlock(params: {
    title: string;
    key: string;
    description: string;
    options?: IAcTabsOptions;
  }): string {
    const { title, key, description, options = {} } = params;

    // IDs for panes
    const idA = `${key}-pane-a`;
    const idB = `${key}-pane-b`;
    const idC = `${key}-pane-c`;

    // Serialize options on container for easy retrieval
    const optionsAttr = JSON.stringify(options);

    return `
      <div class="mb-5 border rounded p-3 bg-light" data-actabs-block data-actabs-options='${optionsAttr}'>
        <h5 class="mb-2">${title}</h5>
        <p class="text-muted mb-3"><small>${description}</small></p>

        <ac-tabs>
        <!-- TABLIST -->
        <div class="nav nav-tabs" role="tablist" data-actabs-tablist>
          <button class="nav-link" type="button" role="tab"
                  aria-selected="true" ac-tab
                  ac-tab-target="#${idA}">
            Tab A
          </button>
          <button class="nav-link ${key === 'disabled' ? 'disabled' : ''}" type="button" role="tab"
                  aria-selected="false" ac-tab
                  ${key === 'disabled' ? 'aria-disabled="true" disabled' : ''}
                  ac-tab-target="#${idB}">
            Tab B ${key === 'disabled' ? '(disabled)' : ''}
          </button>
          <button class="nav-link" type="button" role="tab"
                  aria-selected="false" ac-tab
                  ac-tab-target="#${idC}">
            Tab C
          </button>
        </div>

        <!-- PANES -->
        <div class="tab-content border border-top-0 p-3 bg-white">
          <div id="${idA}" class="${AcTabsCssClassName.acTabPane}" ${AcTabsAttributeName.acTabPane} role="tabpanel" aria-labelledby="">
            <p>Content for <strong>${title}</strong> — Pane A.</p>
            <p class="mb-0">Uses class <code>.${AcTabsCssClassName.acTabPane}</code> and attribute <code>${AcTabsAttributeName.acTabPane}</code>.</p>
          </div>
          <div id="${idB}" class="${AcTabsCssClassName.acTabPane}" ${AcTabsAttributeName.acTabPane} role="tabpanel" aria-labelledby="">
            <p>Content for <strong>${title}</strong> — Pane B.</p>
          </div>
          <div id="${idC}" class="${AcTabsCssClassName.acTabPane}" ${AcTabsAttributeName.acTabPane} role="tabpanel" aria-labelledby="">
            <p>Content for <strong>${title}</strong> — Pane C.</p>
          </div>
        </div>

          </ac-tabs>
        <!-- CONTROLS -->
        <div class="d-flex gap-2 mt-3 flex-wrap">
          <button type="button" class="btn btn-outline-primary btn-sm" data-actabs-action="prev">Prev</button>
          <button type="button" class="btn btn-outline-primary btn-sm" data-actabs-action="next">Next</button>
          <button type="button" class="btn btn-outline-secondary btn-sm" data-actabs-action="show" data-actabs-target="#${idA}">Show A</button>
          <button type="button" class="btn btn-outline-secondary btn-sm" data-actabs-action="show" data-actabs-target="#${idB}">Show B</button>
          <button type="button" class="btn btn-outline-secondary btn-sm" data-actabs-action="show" data-actabs-target="#${idC}">Show C</button>

          <span class="vr mx-1"></span>

          <button type="button" class="btn btn-outline-danger btn-sm" data-actabs-action="disable" data-actabs-target=".nav-link:nth-child(2)">Disable B</button>
          <button type="button" class="btn btn-outline-success btn-sm" data-actabs-action="enable" data-actabs-target=".nav-link:nth-child(2)">Enable B</button>
        </div>
      </div>
    `;
  }
}
