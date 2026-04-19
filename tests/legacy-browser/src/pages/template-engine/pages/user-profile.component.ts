import { AcElement } from '../core/element.base';

@AcElement({
  selector: '#user-app',
  styles: [`
    .user-profile {
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 4px;
    }
    .status-active { color: green; font-weight: bold; }
    .status-inactive { color: red; }
    .profile-card p { margin: 5px 0; }
  `],
  template: `
    <div class="user-profile">
      <h2>User Profile</h2>
      <div class="profile-card">
        <p><strong>Name:</strong> {{ name | uppercase }}</p>
        <p><strong>Role:</strong> {{ role | lowercase }}</p>
        <p><strong>Last Login:</strong> {{ lastLogin }}</p>
        <p><strong>Status:</strong> 
          <span ac:class="isActive ? 'status-active' : 'status-inactive'">
            {{ isActive ? 'Active' : 'Inactive' }}
          </span>
        </p>
      </div>
      
      <div class="actions">
        <button ac:on:click="toggleActive()">Toggle Status</button>
        <button ac:on:click="updateName()">Change Name</button>
      </div>

      <div class="debug">
        <h3>Raw Data (JSON Pipe)</h3>
        <pre>{{ $data | json }}</pre>
      </div>
    </div>
  `
})
export class UserProfileComponent {
  public name = 'John Doe';
  public role = 'ADMINISTRATOR';
  public lastLogin = new Date().toLocaleString();
  public isActive = true;

  // Helper to show all data
  get $data() { return this; }

  toggleActive() {
    this.isActive = !this.isActive;
  }

  updateName() {
    const names = ['Alice Smith', 'Bob Johnson', 'Charlie Brown'];
    this.name = names[Math.floor(Math.random() * names.length)];
  }

  onInit() {
    console.log('UserProfileComponent initialized');
  }
}
