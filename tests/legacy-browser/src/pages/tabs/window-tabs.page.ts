/* eslint-disable @nx/enforce-module-boundaries */
import { AcWindowTabs } from '@autocode-ts/ac-browser';
// import './../../../../../packages/browser/ac-browser/src/lib/components/ac-tabs/css/ac-vs-code-window-tabs.css';
// import './../../../../../packages/browser/ac-browser/src/lib/components/ac-tabs/css/ac-chrome-window-tabs.css';

export class WindowTabsPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .surface {
          padding: 16px;
          background-color: #252526;
          color: #d4d4d4;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        h2 {
          margin-bottom: 16px;
          color: #ffffff;
        }
        .buttons {
          margin-top: 12px;
          display: flex;
          gap: 10px;
        }
        button {
          padding: 8px 12px;
          background-color: #007acc;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        button:hover {
          background-color: #005f99;
        }
      </style>

      <div class="surface">
        <h2>AcWindowTabs Demo</h2>
        <ac-window-tabs id="tabs"></ac-window-tabs>

        <div class="buttons">
          <button data-add-tab>Add Tab</button>
          <button data-set-active-tab-title>Update Active Tab Tile</button>
          <button data-remove-tab>Remove Active Tab</button>
          <button data-select-first>Select First Tab</button>
        </div>
      </div>
    `;

    const tabsEl = this.querySelector('#tabs') as AcWindowTabs;

    // Preload some tabs
    tabsEl.setTabs({tabs:[
      { id: 't1', title: 'Welcome',  icon: '📘' },
      { id: 't2', title: 'Home.ts', closeable: true, icon: '📄' },
      { id: 't3', title: 'About.ts', closeable: false, icon: '📄' },
    ]});

    // Listen to events
    tabsEl.addEventListener('tab-change', (e: any) =>
      console.log('Active tab changed', e.detail.id)
    );
    tabsEl.addEventListener('tabs-reordered', (e: any) =>
      console.log('Tabs reordered', e.detail.tabs)
    );

    // Button event handlers
    this.querySelector('button[data-set-active-tab-title]')?.addEventListener('click', () => {
      const id = 't' + Math.random().toString(36).slice(2, 6);
      const activeTab = tabsEl.activeTab;
      if(activeTab){
        activeTab.title = id;
      }
    });


    this.querySelector('button[data-add-tab]')?.addEventListener('click', () => {
      const id = 't' + Math.random().toString(36).slice(2, 6);
      tabsEl.addTab({tab:{ id, title: 'New Tab', closeable: true, icon: '✨' }});
    });

    this.querySelector('button[data-remove-tab]')?.addEventListener('click', () => {
      const activeId = tabsEl.activeIdGetter;
      if (activeId) tabsEl.removeTab({id:activeId});
    });

    this.querySelector('button[data-select-first]')?.addEventListener('click', () => {
      const first = tabsEl.getTabs()[0];
      if (first) tabsEl.selectTab({id:first.id});
    });
  }
}


