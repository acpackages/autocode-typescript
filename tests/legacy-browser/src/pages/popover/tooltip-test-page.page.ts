import { AcTooltip, AcTooltipOptions } from '@autocode-ts/ac-browser';

export class TooltipTestPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .container { padding: 20px; font-family: Arial, sans-serif; }
        h2 { margin-bottom: 1rem; }
        .btn {
          margin: 0.5rem;
          padding: 0.5rem 1rem;
          background: #28a745;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 4px;
          user-select: none;
          position: relative;
        }
        .btn:hover { background: #1e7e34; }

        /* Default tooltip styling */
        .ac-tooltip {
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.4;
          max-width: 200px;
          text-align: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .ac-tooltip[style*="display: block"] {
          opacity: 1;
        }
      </style>

      <div class="container">
        <h2>AcTooltip Test Page</h2>
        <p>Hover the buttons to see tooltips.</p>

        <h3>Fixed Position Tooltips</h3>
        <button class="btn" id="tooltip-top">Tooltip - Top</button>
        <button class="btn" id="tooltip-bottom">Tooltip - Bottom</button>
        <button class="btn" id="tooltip-left">Tooltip - Left</button>
        <button class="btn" id="tooltip-right">Tooltip - Right</button>

        <h3>Auto Position Tooltip</h3>
        <button class="btn" id="tooltip-auto">Tooltip - Auto</button>
      </div>
    `;

    this.initTooltips();
  }

  private initTooltips() {
    const tooltips: { id: string; position: AcTooltipOptions['position'] }[] = [
      { id: 'tooltip-top', position: 'top' },
      { id: 'tooltip-bottom', position: 'bottom' },
      { id: 'tooltip-left', position: 'left' },
      { id: 'tooltip-right', position: 'right' },
      { id: 'tooltip-auto', position: 'auto' }
    ];

    tooltips.forEach(({ id, position }) => {
      const btn = this.querySelector<HTMLButtonElement>(`#${id}`);
      if (btn) {
        btn.setAttribute("title",`Tooltip at <b>${position}</b>`)
        new AcTooltip({element:btn});
      }
    });
  }
}
