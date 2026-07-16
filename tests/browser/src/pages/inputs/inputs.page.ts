import { AcElement } from "@autocode-ts/ac-runtime";
import { AcContext } from "@autocode-ts/autocode";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'inputs-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'Inputs Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <ac-form #form>
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <ac-text-input name="full_name" [acContext]="context" acContextKey="full_name" class="form-control"></ac-text-input>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <ac-text-input type="email" name="email" [acContext]="context" acContextKey="personal_email" class="form-control"></ac-text-input>
                </div>
                <div class="col-md-12">
                  <label class="form-label">Bio (Textarea)</label>
                  <ac-textarea-input name="bio" [acContext]="context" acContextKey="about_me" class="form-control"></ac-textarea-input>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Favorite Color</label>
                  <ac-text-input type="color" name="color" [acContext]="context" acContextKey="favorite_color" class="form-control form-control-color w-100"></ac-text-input>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Birth Date</label>
                  <ac-text-input type="date" name="birth_date" [acContext]="context" acContextKey="birth_date" class="form-control"></ac-text-input>
                </div>
                <div class="col-md-6">
                   <label class="form-label">Preferred Framework</label>
                   <ac-select-input name="framework" [acContext]="context" acContextKey="preferred_framework" [options]="frameworks" class="form-select"></ac-select-input>
                </div>
                <div class="col-md-6">
                   <label class="form-label">Range Test</label>
                   <ac-text-input type="range" name="strength" [acContext]="context" acContextKey="profile_strength" class="form-range"></ac-text-input>
                </div>
              </div>

              <div class="mt-4">
                <button type="submit" class="btn btn-primary px-4">Submit Form</button>
                <button type="button" class="btn btn-outline-secondary ms-2" (click)="logValues()">Log Values</button>
              </div>
            </div>
          </div>
        </ac-form>
      </div>
    </div>
  `
})
export class InputsPage {
  context: AcContext = new AcContext({
    value: {
      full_name: 'John Doe',
      personal_email: 'john@example.com',
      about_me: 'A developer from workspace.',
      favorite_color: '#3c4b64',
      birth_date: '1990-01-01',
      preferred_framework: 'Angular',
      profile_strength: 75
    },
    name: 'user_profile'
  });

  frameworks = ['Angular', 'React', 'Vue.js', 'Svelte'];

  dropdownItems: IAppMenuItem[] = [
    { label: 'Form Actions', isHeader: true },
    { label: 'Reset Context', callback: () => this.resetContext() }
  ];

  logValues() {
    console.log('Current Values:', this.context.value);
  }

  resetContext() {
    this.context.value = {
      full_name: '',
      personal_email: '',
      about_me: '',
      favorite_color: '#000000',
      birth_date: '',
      preferred_framework: 'React',
      profile_strength: 50
    };
  }
}
