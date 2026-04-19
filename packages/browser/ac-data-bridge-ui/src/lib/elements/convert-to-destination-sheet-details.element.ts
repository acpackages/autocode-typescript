/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcDataBridge, IAcDataBridgeEntity, IAcDataBridgeProcesedRow } from '../../../ac-data-bridge/ac-data-bridge';
import { ACI_SVG_SOLID } from '@autocode-ts/ac-icons';
import { AcElement, AcEventEmitter, AcInput, AcOutput, AcViewChild } from '../../../ac-runtime/src/ac-runtime';
import { AcScrollable } from '@autocode-ts/ac-browser';
@AcElement({
  selector: 'ac-data-bridge-convert-to-destination-sheet-details',
  template: `
    <div class="card my-4">
      <div class="card-header p-2">
        <div>
          <ac-svg-icon ac:bind:svg-code="isExpanded?ACI_SVG_SOLID.chevronDown:ACI_SVG_SOLID.chevronRight"
          class="me-2 toggle-icon" (click)="isExpanded = !isExpanded"></ac-svg-icon><b>{{details.templateName}}</b>
        </div>
        <div class="import-table-progress" ac:if="details.rowsCount > 0">
          <ac-data-bridge-progress 
            [title]="details.completedCount+' of '+details.rowsCount"
            [description]="details.errorCount+' Errors'"
            [completedCount]="details.completedCount"
            [totalCount]="details.rowsCount"
            [percentage]="details.percentage"
          ></ac-data-bridge-progress>
        </div>
      </div>
    </div>
  
  `,
  styles: `
  .import-rows-container{
    height:90vh;
  }
  .child-import-rows-container{
    height:70px;
  }
  `
})
export class ConvertToDestinationSheetDetailsElement {
  @AcViewChild('rowsContainer') rowsContainer!:HTMLElement;
  @AcInput() dataBridge?: AcDataBridge;
  @AcInput() details?: any;

  @AcOutput() convertedOutput: AcEventEmitter<any> = new AcEventEmitter<any>();

  ACI_SVG_SOLID = ACI_SVG_SOLID;
  Object = Object;
  showAdditionalRows: Record<string, boolean> = {};
  isExpanded:boolean = false;
  acScrollable?:AcScrollable;

  acOnInit(){
    this.initRowsScrollable();
  }

  initRowsScrollable(){
    
    if(this.rowsContainer && this.details){
      console.log(this.details);
      this.acScrollable = new AcScrollable({
      element: this.rowsContainer,
      options: {
        bufferCount: 5,
        itemTemplate: (row: any, index: number) => {
          const el = document.createElement('tr');
          el.className = 'item';
          el.style.height = `${row.height}px`;
          const statusTd = document.createElement('td');
          if(row.operation!='SKIP'){
            if(row.status=='PENDING'||row.status == undefined){
              statusTd.innerHTML = `<span class="badge text-white bg-primary">Pending</span>`;
            }
            else if(row.status=='UPLOADED'){
              statusTd.innerHTML = `<span class="badge text-white bg-success">Imported</span>`;
            }
            else if(row.status=='STARTED'){
              statusTd.innerHTML = `<span class="badge text-white bg-info">Importing</span>`;
            }
            else if(row.status=='ERROR'){
              statusTd.innerHTML = `<span class="badge text-white bg-danger">Error</span>`;
            }
          }
          else{
            statusTd.innerHTML = `<span class="badge text-white bg-secondary">Skipping</span>`;
          }
          el.append(statusTd);
          for(let field of this.details.fields ){
            const cell = document.createElement('td');
            cell.innerHTML = row.data[field.destinationFieldName] ?? '';
            el.append(statusTd);
          }
          return el;
        }
      }
    });
    // this.acScrollable.setItems(items);
    }
    else{
      setTimeout(() => {
        this.initRowsScrollable();
      }, 150);
    }
  }
}
