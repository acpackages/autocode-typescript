import { AcElement } from '../core/element.base';

@AcElement({
  selector: '#test-scenarios',
  template: `
    <div class="test-container">
      <h2>Advanced Scenarios: ac:else & select</h2>
      
      <div class="form-group">
        <label>Show Content?</label>
        <input type="checkbox" ac:model="showContent">
      </div>

      <div class="display-area">
        <div ac:if="showContent">
          <p class="success-msg">Content is VISIBLE!</p>
        </div>
        <div ac:else>
          <p class="warning-msg">Content is HIDDEN (Else Block Active)</p>
        </div>
      </div>

      <hr>

      <div class="form-group">
        <label>Select Your Status:</label>
        <select ac:model="userStatus">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="busy">Busy</option>
        </select>
      </div>

      <div class="status-result">
        <p>Selected Status: <strong>{{ userStatus }}</strong></p>
        
        <div ac:if="userStatus === 'online'">
          <span class="dot online"></span> User is currently Active.
        </div>
        <div ac:else-if="userStatus === 'busy'">
           <span class="dot busy"></span> User is occupied. Do not disturb.
        </div>
        <div ac:else-if="userStatus === 'offline'">
           <span class="dot offline"></span> User is currently disconnected.
        </div>
        <div ac:else>
           <p>Status is unknown.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container { border: 2px dashed #ccc; padding: 20px; border-radius: 8px; margin-top: 20px; background-color: #f9f9f9; }
    .success-msg { color: #2ecc71; font-weight: bold; }
    .warning-msg { color: #e67e22; font-style: italic; }
    .dot { height: 12px; width: 12px; border-radius: 50%; display: inline-block; margin-right: 8px; }
    .online { background-color: #2ecc71; box-shadow: 0 0 5px #2ecc71; }
    .busy { background-color: #f1c40f; box-shadow: 0 0 5px #f1c40f; }
    .offline { background-color: #95a5a6; box-shadow: 0 0 5px #95a5a6; }
    .form-group { margin-bottom: 15px; }
    label { font-weight: bold; margin-right: 10px; }
    select { padding: 5px; border-radius: 4px; }
  `]
})
export class TestScenariosElement {
  public showContent = true;
  public userStatus = 'online';

  onInit() {
    console.log('TestScenariosElement initialized');
  }
}
