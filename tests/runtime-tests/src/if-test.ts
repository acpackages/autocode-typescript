import { AcElement } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'if-test',
  template: `
    <div class="test-section">
      <h3>ac:if / ac:else-if / ac:else</h3>

      <div class="controls">
        <button (click)="status = 'loading'">Set Loading</button>
        <button (click)="status = 'success'">Set Success</button>
        <button (click)="status = 'error'">Set Error</button>
        <button (click)="status = 'idle'">Set Idle</button>
      </div>

      <div class="display-box">
        <div ac:if="status === 'loading'" class="alert info">
          🌀 Processing... Please wait.
        </div>
        <div ac:else-if="status === 'success'" class="alert success">
          ✅ Operation completed successfully!
        </div>
        <div ac:else-if="status === 'error'" class="alert danger">
          ❌ An error occurred while processing.
        </div>
        <div ac:else class="alert idle">
          ⏸️ System is currently idle.
        </div>
      </div>

      <div class="nested-test">
        <label>
          <input type="checkbox" ac:model="showAdvanced"> Show Advanced Controls
        </label>

        <div ac:if="showAdvanced" class="advanced-panel">
          <h4>Advanced Panel</h4>
          <p>This panel is only visible when the checkbox is checked.</p>
          <div ac:if="status === 'success'">
            ⭐ Extra bonus for success!
          </div>
        </div>
      </div>
    </div>

    <style>
      .test-section {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .controls { margin-bottom: 1rem; display: flex; gap: 0.5rem; }
      .display-box { min-height: 60px; margin-bottom: 1rem; }
      .alert { padding: 1rem; border-radius: 6px; }
      .info { background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; }
      .success { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; }
      .danger { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; }
      .idle { background: rgba(148, 163, 184, 0.2); border: 1px solid #94a3b8; }
      .advanced-panel {
        margin-top: 1rem;
        padding: 1rem;
        background: rgba(167, 139, 250, 0.1);
        border: 1px dashed #a78bfa;
        border-radius: 6px;
      }
    </style>
  `
})
export class IfTest {
  status = 'idle';
  showAdvanced = false;
}
