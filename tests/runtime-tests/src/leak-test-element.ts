import { AcElement, acElementRegistry } from '@autocode-ts/ac-runtime';

@AcElement({
  selector: 'test-child-element',
  template: `
    <div class="child-node">
      <span class="id">ID: {{ data?.id }}</span>
      <span class="time">{{ data?.time }}</span>
      <div ac:if="data?.id % 2 === 0" class="detail">
        Reactivity Check: {{ counter }}
      </div>
    </div>
  `,
  styles: `
    .child-node { 
      padding: 8px; 
      margin: 4px 0;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 4px;
      font-size: 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .id { font-weight: bold; color: #60a5fa; }
    .time { color: #94a3b8; }
    .detail { color: #34d399; font-size: 0.75rem; }
  `
})
export class TestChildElement extends AcElement {
  data: any;
  counter = 0;
  interval: any;

  acOnInit() {
    this.interval = setInterval(() => {
      this.counter++;
    }, 100);
  }

  acOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

@AcElement({
  selector: 'leak-test',
  template: `
    <div class="test-section leak-test-card">
      <h3>Memory Leak Stress Test</h3>
      
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="label">Active Instances</div>
          <div class="value" [class:leak]="instanceCount > 10">{{ instanceCount }}</div>
          <div class="sub">Registered in acElementRegistry</div>
        </div>
        <div class="metric-box">
          <div class="label">Head Style Tags</div>
          <div class="value" [class:leak]="styleCount > 10">{{ styleCount }}</div>
          <div class="sub">ac-engine-style-for tags</div>
        </div>
        <div class="metric-box">
          <div class="label">Test Items</div>
          <div class="value">{{ testItems.length }}</div>
          <div class="sub">Currently rendered in loop</div>
        </div>
      </div>

      <div class="test-controls">
        <div class="group">
          <button (click)="runSingleCycle()" class="btn-primary">Run 1 Cycle</button>
          <button (click)="startAutoTest()" class="btn-warning" [disabled]="isRunning">Start Stress Test (Auto)</button>
          <button (click)="stopAutoTest()" class="btn-danger" [disabled]="!isRunning">Stop</button>
        </div>
        <div class="group">
          <button (click)="toggleTestArea()" class="btn-secondary">Toggle Area (ac:if)</button>
          <button (click)="clearAll()" class="btn-ghost">Clear All</button>
        </div>
      </div>

      <div class="test-area-container">
        <div class="area-status">Area Status: <span [style:color]="showTestArea ? '#34d399' : '#ef4444'">{{ showTestArea ? 'MOUNTED' : 'UNMOUNTED' }}</span></div>
        <div class="test-area-scroll" ac:if="showTestArea">
           <ac-container ac:for="let item of testItems">
              <test-child-element [data]="item"></test-child-element>
           </ac-container>
        </div>
      </div>
    </div>

    <style>
      .leak-test-card {
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1.5rem;
        border-radius: 12px;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .metric-box {
        background: rgba(0, 0, 0, 0.3);
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
      .value { font-size: 1.5rem; font-weight: bold; margin: 0.25rem 0; color: #f8fafc; }
      .leak { color: #ef4444 !important; }
      .sub { font-size: 0.65rem; color: #64748b; }

      .test-controls { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
      .group { display: flex; gap: 0.5rem; }
      
      button {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.85rem;
        transition: all 0.2s;
      }
      .btn-primary { background: #3b82f6; color: white; }
      .btn-warning { background: #f59e0b; color: white; }
      .btn-danger { background: #ef4444; color: white; }
      .btn-secondary { background: #64748b; color: white; }
      .btn-ghost { background: transparent; border: 1px solid #334155; color: #94a3b8; }
      button:disabled { opacity: 0.5; cursor: not-allowed; }

      .test-area-container {
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
      }
      .area-status { font-size: 0.75rem; font-weight: bold; margin-bottom: 0.5rem; }
      .test-area-scroll {
        max-height: 300px;
        overflow-y: auto;
        padding-right: 0.5rem;
      }
    </style>
  `
})
export class LeakTestElement extends AcElement {
  instanceCount = 0;
  styleCount = 0;
  testItems: any[] = [];
  showTestArea = true;
  isRunning = false;
  autoTestInterval: any;

  acOnInit() {
    this.updateMetrics();
    setInterval(() => this.updateMetrics(), 500);
  }

  updateMetrics() {
    // Access internal registry instances map via cast if needed, 
    // or just assume we can get it from the public registry if we add a helper
    // For now, let's try to get it from the internal state if possible or just use a proxy for testing
    this.instanceCount = (acElementRegistry as any).instances.size;
    this.styleCount = document.querySelectorAll('style[ac-engine-style-for]').length;
  }

  runSingleCycle() {
    this.showTestArea = false;
    this.testItems = [];
    
    setTimeout(() => {
      this.testItems = Array.from({ length: 20 }, (_, i) => ({
        id: Math.floor(Math.random() * 10000),
        time: new Date().toLocaleTimeString()
      }));
      this.showTestArea = true;
    }, 100);
  }

  startAutoTest() {
    this.isRunning = true;
    this.autoTestInterval = setInterval(() => {
      this.runSingleCycle();
    }, 1000);
  }

  stopAutoTest() {
    this.isRunning = false;
    if (this.autoTestInterval) {
      clearInterval(this.autoTestInterval);
    }
  }

  toggleTestArea() {
    this.showTestArea = !this.showTestArea;
  }

  clearAll() {
    this.testItems = [];
    this.showTestArea = false;
    this.stopAutoTest();
  }
}
