import { AcElement } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'container-test',
  template: `
    <div class="test-section">
      <h3>ac-container</h3>
      <p>ac-container is a transparent wrapper that doesn't render in the DOM.</p>

      <div class="controls">
        <button (click)="visible = !visible">Toggle Container Content</button>
      </div>

      <div class="border-box">
        <ac-container ac:if="visible">
          <div class="inside">I am inside an ac-container</div>
          <div class="inside">I am also inside</div>
          <span>Wait, where is the container? Check DevTools!</span>
        </ac-container>
      </div>

      <div class="loop-container">
        <h4>ac-container with ac:for</h4>
        <ac-container ac:for="let group of groups">
          <div class="group-header">{{ group.title }}</div>
          <div class="group-body">
             <div ac:for="let item of group.items" class="sub-item">{{ item }}</div>
          </div>
        </ac-container>
      </div>
    </div>

    <style>
      .test-section {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .border-box {
        border: 2px solid #3b82f6;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
      }
      .inside {
        padding: 0.5rem;
        background: rgba(59, 130, 246, 0.1);
        margin-bottom: 0.5rem;
        border-left: 3px solid #3b82f6;
      }
      .group-header {
        font-weight: bold;
        color: #60a5fa;
        margin-top: 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .sub-item {
        padding-left: 1rem;
        font-size: 0.9rem;
        color: #94a3b8;
      }
    </style>
  `
})
export class ContainerTest {
  visible = true;
  groups = [
    { title: 'Fruits', items: ['Apple', 'Orange'] },
    { title: 'Vegetables', items: ['Carrot', 'Potato'] }
  ];
}
