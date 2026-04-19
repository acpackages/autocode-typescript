import { AcDataBridge, IAcDataBridgeProgress } from '../../../ac-data-bridge/ac-data-bridge';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcElement, AcInput } from '../../../ac-runtime/src/ac-runtime';
@AcElement({
  selector: 'ac-data-bridge-data-processing',
  template: `
    <div class="flex-fill" ac:class:d-none="!taskProgress">
      <ac-data-bridge-progress
      [id]="taskProgress.id"
      [dataBridge]="dataBridge"
      ></ac-data-bridge-progress>
    </div>
  `,
  styles: `
  .progress{
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
export class DataProcessingElement {
  @AcInput() dataBridge?: AcDataBridge;

  ACI_SVG_SOLID = ACI_SVG_SOLID;
  Object = Object;
  taskProgress?:IAcDataBridgeProgress;

  acOnInit(){
    this.initProgress();
  }

  acOnPropertyChanges(changes:any){
    console.log(changes);
  }

  getPercentage(progress: IAcDataBridgeProgress): number {
    return Math.round((progress.completedCount / progress.totalCount) * 100);
  }

  initProgress(){
    if(this.dataBridge && this.dataBridge.currentStage == 'PROCESSING' && this.dataBridge.taskProgress){
      this.taskProgress = this.dataBridge.taskProgress;
    }
    else{
      setTimeout(() => {
        this.initProgress();
      }, 50);
    }
  }
}
