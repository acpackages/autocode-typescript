/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcDataBridge } from '@autocode-ts/ac-data-bridge';
import { AcElement, AcInput } from '@autocode-ts/ac-runtime';
import { AcDelayedCallback } from '@autocode-ts/autocode';
@AcElement({
  selector: 'ac-data-bridge-source-destination-mapping',
  template: `
  <ac-container ac:if="isDetailSet">
    <p>Following worksheets has been extracted from the uploaded sheet and each sheet and its columns has been
      mapped. Check and verify the mapping to continue import process.</p>
    <div class="flex-fill">
      <div class="sheet-data">
        <ac-container ac:for="let entity of dataBridge.sourceEntities">
          <ac-container ac:if="entity.fields.length > 0">
            <div class="card mb-4">
              <div class="card-header px-2 py-1">
                <div class="d-inline-block">
                  <b>{{ entity.sourceName }} ({{ entity.fields.length }} columns, {{ entity.rowsCount }}
                    rows)</b>
                  sheet will be
                  imported into
                </div>
                <div class="d-inline-block ms-2">
                  <select class="form-select py-1 fw-bold" ac:bind:name="entity.sourceName"
                    ac:model="entity.templateName">
                    <option value="" readonly>Select table</option>
                    <ac-container ac:for="let item of templatesList">
                      <option ac:bind:value="item.value" ac:bind:selected="entity.templateName == item.value">{{item.label}}</option>
                    </ac-container>
                  </select>
                </div>
              </div>
              <div class="card-body p-0">
                <table class="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th style="width:500px;">
                        Sheet column
                      </th>
                      <th>
                        Mapped to column
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr ac:for="let col of entity.fields">
                      <td class="pe-4 pt-2">{{col.sourceFieldName}}</td>
                      <td>
                        <div class="d-inline-block ms-0">
                          <select class="form-select py-1" ac:bind:name="col.sourceName+'_'+col.sourceFieldName"
                            ac:model="col.templateFieldName">
                            <ac-container
                              ac:for="let tableCol of getColumnsForTemplate({templateName:entity.templateName})">
                              <option ac:bind:value="tableCol.vaue" ac:bind:selected="col.templateFieldName == tableCol.value">{{tableCol.label}}</option>
                            </ac-container>
                          </select>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ac-container>
        </ac-container>
      </div>
    </div>
    <div class="pt-3">
      <button type="button" class="btn btn-dark" (click)="handleConvertData()">Confirm and Start Converting data</button>
    </div>
  </ac-container>
  `,
  styles: `
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1 1 auto;
  }
  .flex-fill {
    flex: 1 1 auto !important;
    overflow: auto;
  }
  `
})
export class SourceDestinationElement {
  @AcInput() dataBridge?: AcDataBridge;
  delayedCallback: AcDelayedCallback = new AcDelayedCallback();
  templateFieldsList: any = {};
  templatesList: { label: string, value: string }[] = [];
  isDetailSet: boolean = false;

  acOnInit() {
    this.setDestinationDetails();
  }

  async setDestinationDetails() {
    if (this.dataBridge) {
      this.templatesList = await this.dataBridge.getTemplatesList();
      for (const source of this.templatesList) {
        this.templateFieldsList[source.value] = await this.dataBridge.getTemplateFieldsList({ templateName: source.value });
      }
      this.isDetailSet = true;
    }
    else {
      this.delayedCallback.add({
        callback: () => {
          this.setDestinationDetails();
        }, duration: 50
      });
    }
  }

  handleConvertData() {
    this.dataBridge?.startProcessingEntities();
  }

  getColumnsForTemplate({ templateName }: { templateName: string }): any[] {
    let result: any[] = this.templateFieldsList[templateName];
    if (!this.templateFieldsList[templateName]) {
      result = [];
    }
    return result;
  }
}
