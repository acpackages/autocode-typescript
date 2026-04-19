import { AcDataBridge, IAcDataBridgeProgress } from '../../../ac-data-bridge/ac-data-bridge';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcElement, AcEventEmitter, AcInput, AcOutput, IAcOnPropertyChange } from '../../../ac-runtime/src/ac-runtime';
@AcElement({
  selector: 'ac-data-bridge-ui',
  template: `
  <!-- eslint-disable @angular-eslint/template/eqeqeq -->
  <ac-container ac:if="currentStage == 'COMPLETED'">
    <div class="completed-message">
      <div class="max-w-2xl mx-auto" style="cursor:pointer">

        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Data conversion completed!</h1>
          <p class="text-gray-600 mt-2">Data conversion process has been completed</p>
        </div>
        <div
          class="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 hover:border-gray-400">

          <label for="excel-input" class="cursor-pointer text-success">
            <ac-svg-icon style="height: 150px;width:auto;" ac:bind:svg-code="ACI_SVG_SOLID.checkToSlot"></ac-svg-icon>
          </label>
          <div class="mb-5">
            <!-- - or - -->
          </div>
          <div>
            <!-- <button type="button" class="btn btn-dark">Download JSON of SQL Operations</button> -->
          </div>
        </div>
      </div>
    </div>
  </ac-container>
  <ac-container>
    <div class="completed-message"  ac:if="['SETTING_DATA','GENERATING_FILE'].includes(currentStage)">
      <div class="max-w-2xl mx-auto" style="cursor:pointer">
        <div
          class="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 hover:border-gray-400">
          <label for="excel-input" class="cursor-pointer">
            <ac-svg-icon style="height: 150px;width:auto;animation-name: spin;
              animation-duration: 2000ms;
              animation-iteration-count: infinite;
              animation-timing-function: linear;" 
              ac:bind:svg-code="ACI_SVG_SOLID.loader"
              ></ac-svg-icon>
          </label>
          <div class="mb-5">
            <!-- - or - -->
          </div>
          <div>
            <!-- <button type="button" class="btn btn-dark">Download JSON of SQL Operations</button> -->
          </div>
        </div>
      </div>
    </div>
  </ac-container>
  <ac-container ac:if="currentStage == 'ERROR'">
    <div class="completed-message">
      <div class="max-w-2xl mx-auto" style="cursor:pointer">

        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Error converting data!</h1>
          <p class="text-gray-600 mt-2">There was error converting data! Please try again!</p>
        </div>
        <div
          class="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 hover:border-gray-400">

          <label for="excel-input" class="cursor-pointer text-danger">
            <ac-svg-icon style="height: 150px;width:auto;" ac:bind:svg-code="ACI_SVG_SOLID.triangleExclamation"></ac-svg-icon>
          </label>
          <div class="mb-5">
            <!-- - or - -->
          </div>
          <div>
            <!-- <button type="button" class="btn btn-dark">Download JSON of SQL Operations</button> -->
          </div>
        </div>
      </div>
    </div>
  </ac-container>
  <ac-container ac:if="currentStage == 'NONE'">
    <ac-data-bridge-ui-upload-file [dataBridge]="dataBridge" (downloadTemplate)="handleDownloadTemplate()"></ac-data-bridge-ui-upload-file>
  </ac-container>
  <ac-container ac:if="currentStage == 'DATA_SET'">
    <ac-data-bridge-source-destination-mapping [dataBridge]="dataBridge"></ac-data-bridge-source-destination-mapping>
  </ac-container>
  <ac-container ac:if="['PROCESSING','IMPORTING'].includes(currentStage)">
    <ac-data-bridge-progress [dataBridge]="dataBridge" [id]="currentTaskProgressId"></ac-data-bridge-progress>
  </ac-container>
  <ac-container ac:if="['READY_TO_CONVERT','CONVERTING'].includes(currentStage)">
    <ac-data-bridge-convert-to-destination [dataBridge]="dataBridge"
      (convertedOutput)="handleConvertedOutput($event)"
      (startImporting)="handleStartImporting($event)"
      ></ac-data-bridge-convert-to-destination>
  </ac-container>

  `,
  styles: `
  :host{
    height: 100%;
    display: block;
  }
  .completed-message{
    display: flex;
    height: 100%;
    align-items: center;
  }
  `
})
export class AcDataBridgeUIElement implements IAcOnPropertyChange {
  @AcInput() dataBridge?: AcDataBridge;
  @AcOutput() downloadTemplate: AcEventEmitter<any> = new AcEventEmitter();
  @AcOutput() convertedOutput: AcEventEmitter<any> = new AcEventEmitter();
  @AcOutput() startImporting: AcEventEmitter<any> = new AcEventEmitter();

  ACI_SVG_SOLID = ACI_SVG_SOLID;

  currentStage: string  = '';
  currentTaskProgressId?:string;

  acOnInit(){
    this.initDataBridge();
  }

  acOnPropertyChange(changes:any){
  }

  handleConvertedOutput(data: any) {
    this.convertedOutput.emit(data);
  }

  handleDownloadTemplate() {
    this.downloadTemplate.emit();
  }

  handleStartImporting(sqlStatements: any) {
    this.startImporting.emit(sqlStatements);
  }

  private initDataBridge(){
    if(this.dataBridge){
      this.currentStage = this.dataBridge!.currentStage;
      this.dataBridge.on({event:'currentStageChange',callback:()=>{
        this.currentStage = this.dataBridge!.currentStage;
      }});
      this.dataBridge.on({event:'taskProgress',callback:({progress,isRoot}:{progress:IAcDataBridgeProgress,isRoot:boolean})=>{
              if(this.currentTaskProgressId != progress.id && isRoot){
                this.currentTaskProgressId = progress.id;
              }
            }});
    }
    else{
      setTimeout(() => {
        this.initDataBridge();
      }, 50);
    }
  }
}
