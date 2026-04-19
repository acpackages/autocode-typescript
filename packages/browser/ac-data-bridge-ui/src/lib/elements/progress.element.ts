/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDataBridge, IAcDataBridgeEntity, IAcDataBridgeProcesedRow } from '../../../ac-data-bridge/ac-data-bridge';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcElement, AcEventEmitter, AcInput, AcOutput } from '../../../ac-runtime/src/ac-runtime';
import { IAcDataBridgeProgress } from '@autocode-ts/ac-data-bridge';
@AcElement({
  selector: 'ac-data-bridge-progress',
  template: `
      <div class="card my-2">
        <div class="card-body p-2 progress-body">
          <h5 class="mb-0" ac:class:d-none="!title">{{title}}</h5>
          <div ac:class:d-none="!description">{{description}}</div>
          <div class="my-1" ac:class:d-none="percentage>=100">
            <div class="progress border-warning">
              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" ac:bind:style="'width: '+percentage+'%;'"></div>
              <div class="progress-label">{{percentage|number}}%</div>
            </div>
          </div>
          <p class="mb-1" ac:class:d-none="completedCount==undefined || totalCount!=undefined">{{completedCount}} of {{totalCount}}</p>
          <span class="badge bg-success text-white mb-1" ac:class:d-none="!(percentage >= 100)"><ac-svg-icon
                ac:bind:svg-code="ACI_SVG_SOLID.check"></ac-svg-icon>
            Completed
          </span>
          <ac-container ac:if="subTasks && subTasks.length > 0">
            <ac-container ac:for="let item of subTasks">
              <ac-data-bridge-progress [id]="item.id" [dataBridge]="dataBridge"></ac-data-bridge-progress>
            </ac-container>
          </ac-container>
        </div>
      </div>
  `,
  styles: `
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
export class AcDataBridgeProgressElement {
  @AcInput() dataBridge?: AcDataBridge;
  @AcInput() id?: string;
  ACI_SVG_SOLID = ACI_SVG_SOLID;
  
  completedCount?:number;
  description?:string;
  percentage?:number;
  title?:string;
  totalCount?:number;
  subTasks:IAcDataBridgeProgress[] = [];

  acOnInit() {
    this.initProgress();
  }

  initProgress(){
    if(this.dataBridge){
      this.dataBridge.on({event:'taskProgress',callback:({progress,isRoot}:{progress:IAcDataBridgeProgress,isRoot:boolean})=>{
        if(this.id == progress.id){
          if(this.completedCount != progress.completedCount){
            this.completedCount = progress.completedCount;
          }
          if(this.description != progress.description){
            this.description = progress.description;
          }
          if(this.percentage != progress.percentage){
            this.percentage = progress.percentage;
          }
          if(this.title != progress.title){
            this.title = progress.title;
          }
          if(this.totalCount != progress.totalCount){
            this.totalCount = progress.totalCount;
          }
          if(progress.subTasksProgress && progress.subTasksProgress.length != this.subTasks.length){
            this.subTasks = progress.subTasksProgress;
          }
        }
      }});
    }
    else{
      setTimeout(() => {
        this.initProgress();
      }, 10);
    }
  }
}
