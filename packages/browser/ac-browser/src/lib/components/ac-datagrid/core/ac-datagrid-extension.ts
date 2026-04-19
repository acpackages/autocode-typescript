import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AcDatagridApi } from "./ac-datagrid-api";

export abstract class AcDatagridExtension{
  datagridApi?:AcDatagridApi;
  hookId = '';

  destroy(){
    acNullifyInstanceProperties({instance:this});
  }

  init(){
    // Init implementation in child
  }

  getState():any{
    // Get state implementation
  }

  handleHook({hook,args}:{hook:string,args:any}){
    // Hooks implementation
  }

  setState({state}:{state:any}){
    // Set state implementation
  }
}
