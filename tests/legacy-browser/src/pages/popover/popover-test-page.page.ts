import { AcPopover, AcPopoverOptions } from '@autocode-ts/ac-browser';

export class PopoverTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        h2 { margin-bottom: 1rem; }
        .btn {
          margin: 0.5rem;
          padding: 0.5rem 1rem;
          background: #007bff;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 4px;
          user-select: none;
        }
        .btn:hover { background: #0056b3; }
      </style>

      <div class="container">
        <h2>AcPopover Test Page</h2>
        <p>Click or hover the buttons to see popovers.</p>

        <h3>Click Trigger Popovers</h3>
        <button class="btn" id="click-bottom">Click - Bottom</button>
        <button class="btn" id="click-top">Click - Top</button>
        <button class="btn" id="click-left">Click - Left</button>
        <button class="btn" id="click-right">Click - Right</button>

        <h3>Hover Trigger Popovers</h3>
        <button class="btn" id="hover-bottom">Hover - Bottom</button>
        <button class="btn" id="hover-top">Hover - Top</button>
        <button class="btn" id="hover-left">Hover - Left</button>
        <button class="btn" id="hover-right">Hover - Right</button>
      </div>
    `;

    this.initPopovers();
  }

  private initPopovers() {
    const positions: AcPopoverOptions['position'][] = ['bottom', 'top', 'left', 'right'];

    // Click trigger popovers
    positions.forEach(pos => {
      const btn = this.querySelector<HTMLButtonElement>(`#click-${pos}`);
      if (btn) {
        new AcPopover(btn, {
          trigger: 'click',
          position: pos,
          content: `Popover at <b>${pos}</b> (click trigger)`,
          className: 'popover-click'
        });
      }
    });

    // Hover trigger popovers
    positions.forEach(pos => {
      const btn = this.querySelector<HTMLButtonElement>(`#hover-${pos}`);
      if (btn) {
        new AcPopover(btn, {
          trigger: 'hover',
          position: pos,
          content: `Popover at <b>${pos}</b> (hover trigger)`,
          className: 'popover-hover'
        });
      }
    });
  }
}
