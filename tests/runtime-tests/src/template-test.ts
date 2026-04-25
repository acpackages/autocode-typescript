import { AcElement, AcViewChild } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'template-test',
  template: `
    <div class="test-section">
      <h3>ac-template / ac:template:outlet</h3>

      <div class="controls">
        <button (click)="activeTemplate = 'tpl1'">Use Template 1</button>
        <button (click)="activeTemplate = 'tpl2'">Use Template 2</button>
        <button (click)="toggleContext()">Toggle Context Values</button>
      </div>

      <ac-template #tpl1>
        <div class="tpl-card gold">
          <h4>Template One</h4>
          <p>This is a reusable template definition.</p>
          <p>Context Data: <b>{{ message }}</b></p>
        </div>
      </ac-template>

      <ac-template #tpl2>
        <div class="tpl-card blue">
          <h4>Template Two</h4>
          <p>Different structure, same outlet.</p>
          <div ac:if="isSpecial">🌟 Special Template Mode active!</div>
        </div>
      </ac-template>

      <div class="outlet-area">
        <h4>Rendered Outlet:</h4>
        <div ac:template:outlet="getSelectedTemplate(); context: getContext()"></div>
      </div>

      <div class="dynamic-list">
         <h4>Templates in Loops</h4>
         <div ac:for="let item of listItems">
            <div ac:template:outlet="tpl1; context: { message: item.text }"></div>
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
      .tpl-card { padding: 1rem; border-radius: 8px; margin-top: 1rem; }
      .gold { background: linear-gradient(135deg, #451a03 0%, #78350f 100%); border: 1px solid #b45309; }
      .blue { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); border: 1px solid #3b82f6; }
      .outlet-area {
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(0,0,0,0.2);
        border-radius: 8px;
      }
    </style>
  `
})
export class TemplateTest{
  @AcViewChild('#tpl1') tpl1: any;
  @AcViewChild('#tpl2') tpl2: any;

  activeTemplate = 'tpl1';
  message = "Default Message";
  isSpecial = false;

  listItems = [
    { text: 'Dynamic Row 1' },
    { text: 'Dynamic Row 2' }
  ];

  getSelectedTemplate() {
    return this.activeTemplate === 'tpl1' ? this.tpl1 : this.tpl2;
  }

  getContext() {
    return {
      message: this.message,
      isSpecial: this.isSpecial
    };
  }

  toggleContext() {
    this.message = "Updated at " + new Date().toLocaleTimeString();
    this.isSpecial = !this.isSpecial;
  }
}
