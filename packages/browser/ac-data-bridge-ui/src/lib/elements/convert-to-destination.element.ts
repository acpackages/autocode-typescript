/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDataBridge, IAcDataBridgeEntity, IAcDataBridgeProcesedRow } from '@autocode-ts/ac-data-bridge';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcElement, AcEventEmitter, AcInput, AcOutput } from '@autocode-ts/ac-runtime';
@AcElement({
  selector: 'ac-data-bridge-convert-to-destination',
  template: `
  <!-- eslint-disable @angular-eslint/template/eqeqeq -->
  <ac-container ac:if="dataBridge && false">
    <div class="d-flex flex-fill flex-column">
      <div>
        <ac-container ac:template:outlet="progressTemplate; context: { progress: dataBridge.taskProgress }"></ac-container>
      </div>
      <div class="flex-fill">
        <ac-container ac:if="dataBridge.destinationEntities">
          <ac-container ac:for="let importDetails of (Object.values(dataBridge.destinationEntities))">
            <ac-data-bridge-convert-to-destination-sheet-details [details]="importDetails"></ac-data-bridge-convert-to-destination-sheet-details>
          </ac-container>
        </ac-container>
      </div>
      <div class="mb-4 d-flex gap-1">
        <button type="button" class="btn btn-dark" (click)="handleStartImporting()">Start Importing</button>
        <button type="button" class="btn btn-dark" (click)="handleDownloadFile('sql')">Download SQL</button>
        <button type="button" class="btn btn-dark" (click)="handleDownloadFile('xlsx')">Download XLSX</button>
        <button type="button" class="btn btn-dark" (click)="handleDownloadFile('json')">Download JSON</button>
      </div>
    </div>
    <ac-template let-progress="progress" #progressTemplate>
      <div class="card my-2">
        <div class="card-body p-2 progress-body">
          <h5 class="mb-0">{{progress.title}}</h5>
          <div>{{progress.description}}</div>
          <ac-container ac:if="progress.percentage<100">
            <div class="my-1">
              <div class="progress border-warning">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" ac:bind:style="'width: '+progress.percentage+'%;'"></div>
                <div class="progress-label">{{progress.percentage|number}}%</div>
              </div>
            </div>
          </ac-container>
          <p class="mb-1">{{progress.completedCount}} of {{progress.totalCount}}</p>
          <ac-container ac:if="progress.percentage >= 100">
            <span class="badge bg-success text-white mb-1"><ac-svg-icon
                ac:bind:svg-code="ACI_SVG_SOLID.check"></ac-svg-icon>
              Completed</span>
          </ac-container>
          <ac-container ac:if="progress.subTasksProgress">
            <ac-container ac:for="let item of Object.values(progress.subTasksProgress)">
              <ac-container ac:if="item && item['title']">
                <div class="ms-4 mt-4">
                  <ac-container
                    ac:template:outlet="progressTemplate; context: { $implicit: item, progress: item }"></ac-container>
                </div>
              </ac-container>
            </ac-container>
          </ac-container>
        </div>
      </div>
    </ac-template>
  </ac-container>
  <div class="mb-4 d-flex gap-1">
        <button type="button" class="btn btn-dark" (click)="handleStartImporting()">Start Importing</button>
        <button type="button" class="btn btn-dark" (click)="handleDownloadFile('sql')">Download SQL</button>
        <button type="button" class="btn btn-dark" (click)="handleDownloadFile('xlsx')">Download XLSX</button>
        <button type="button" class="btn btn-dark" (click)="handleDownloadFile('json')">Download JSON</button>
      </div>
  `,
  styles: `
  .import-rows-container{
    height:90vh;
  }
  .child-import-rows-container{
    height:70px;
  }
  .progress {
        border:solid 1px;
        background:transparent;
        flex-direction:column;
    }
    
        .progress-bar{
            height:100%;
        }
        .progress-label{
            margin-top: -16.5px;
            height:0px;
            text-align:center;
            width:100%;
        }
  `
})
export class ConvertToDestinationElement {
  @AcInput() dataBridge?: AcDataBridge;

  @AcOutput() convertedOutput: AcEventEmitter<any> = new AcEventEmitter<any>();
  @AcOutput() startImporting: AcEventEmitter<any> = new AcEventEmitter<any>();

  ACI_SVG_SOLID = ACI_SVG_SOLID;
  Object = Object;
  showRows: Record<string, boolean> = {};
  showAdditionalRows: Record<string, boolean> = {};

  getChildTemplateDetails(templateName: string, rowDetails: IAcDataBridgeProcesedRow, entityDetails: IAcDataBridgeEntity) {
    const destinationTemplate = this.dataBridge?.destinationEntities[templateName];
    const clonedTemplate = { ...destinationTemplate };
    clonedTemplate.completedCount = 0;
    clonedTemplate.rowsCount = 0;
    const processedRows: Record<string, IAcDataBridgeProcesedRow> = {};
    for (const row of Object.values(destinationTemplate!.processedRows!)) {
      if (row.parentRowId == rowDetails.rowId && row.parentTemplateName == entityDetails.templateName!) {
        processedRows[row.rowId] = row;
      }
    }
    clonedTemplate.processedRows = processedRows;
    return clonedTemplate;
  }

  handleDownloadFile(format:string){
     if (this.dataBridge) {
      if(format == 'xlsx'){
        this.dataBridge.generateXlsxFile();
      }
      else if(format == 'json'){
        this.dataBridge.generateJsonFile();
      }
      else if(format == 'sql'){
        this.dataBridge.generateSqlFile();
      }
    }
  }

  async handleStartImporting() {
    if (this.dataBridge) {
      const result = await this.dataBridge.getSqlStatements();
      this.startImporting.emit(result);
    }
  }
}
