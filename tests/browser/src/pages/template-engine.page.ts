import { AcElement } from "@autocode-ts/ac-runtime";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'template-engine-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcTemplateEngine Demo'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="card-title mb-4">Two-way Binding & Interpolation</h5>
            <div class="row align-items-center mb-3">
              <div class="col-md-6">
                <input type="text" class="form-control" [(acModel)]="title" placeholder="Type something..." />
              </div>
              <div class="col-md-6">
                <div class="p-3 bg-light rounded text-center fs-4 border">
                  {{title || 'Waiting for input...'}}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mb-4">
          <div class="col-md-6">
             <div class="card shadow-sm h-100">
                <div class="card-body">
                   <h5 class="card-title mb-3">Conditional Rendering (acIf)</h5>
                   <button class="btn btn-outline-primary mb-3" (click)="toggleShow()">
                      Toggle Visibility: <span class="badge bg-white text-primary border ms-2">{{show}}</span>
                   </button>
                   <div *if="show" class="alert alert-success animate__animated animate__fadeIn">
                      🎉 Hello! I'm visible because <code>show</code> is true.
                   </div>
                </div>
             </div>
          </div>

          <div class="col-md-6">
             <div class="card shadow-sm h-100">
                <div class="card-body">
                   <h5 class="card-title mb-3">List Rendering (acFor)</h5>
                   <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between align-items-center" *for="let item of items; index as i">
                         {{item}}
                         <span class="badge bg-secondary rounded-pill">#{{i + 1}}</span>
                      </li>
                   </ul>
                   <button class="btn btn-sm btn-link mt-2" (click)="addItem()">+ Add Item</button>
                </div>
             </div>
          </div>
        </div>

        <div class="card shadow-sm mb-4">
          <div class="card-body">
             <h5 class="card-title mb-4">Switch Case & Style Binding</h5>
             <div class="d-flex align-items-center gap-3 mb-4">
                <select class="form-select w-auto" [(acModel)]="status">
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                   <option value="pending">Pending</option>
                </select>

                <div [acSwitch]="status" class="flex-fill text-center p-2 rounded fw-bold text-white shadow-sm"
                     [acStyle]="{backgroundColor: status === 'active' ? '#198754' : (status === 'inactive' ? '#dc3545' : '#ffc107')}">
                   <span *switchCase="'active'">USER ACTIVE</span>
                   <span *switchCase="'inactive'">USER INACTIVE</span>
                   <span *switchDefault>STATUS UNKNOWN</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Templates Demo -->
        <div class="card shadow-sm">
           <div class="card-body">
              <h5 class="card-title mb-4">AcTemplate & AcContainer</h5>
              <ac-template #userTemplate let-user="user">
                 <div class="d-flex align-items-center p-2 border-bottom">
                    <div class="rounded-circle bg-info-subtle text-info p-2 me-3"><i class="fa-solid fa-user"></i></div>
                    <div>
                       <div class="fw-bold">{{user.name}}</div>
                       <div class="text-muted small">{{user.role}}</div>
                    </div>
                 </div>
              </ac-template>

              <div class="border rounded overflow-hidden">
                 <div *for="let user of users">
                    <ac-container [template]="userTemplate" [context]="{user: user}"></ac-container>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class TemplateEnginePage {
  title = 'Template Magic ✨';
  show = true;
  status = 'active';
  items = ['Componentization', 'Reactive State', 'Safe Templates'];
  users = [
    { name: 'Alice Smith', role: 'System Administrator' },
    { name: 'Bob Johnson', role: 'Full-stack Developer' },
    { name: 'Charlie Davis', role: 'UI/UX Designer' }
  ];

  dropdownItems: IAppMenuItem[] = [{ label: 'Engine Config', isHeader: true }];

  toggleShow() {
    this.show = !this.show;
  }

  addItem() {
    this.items.push(`Item ${this.items.length + 1}`);
  }
}
