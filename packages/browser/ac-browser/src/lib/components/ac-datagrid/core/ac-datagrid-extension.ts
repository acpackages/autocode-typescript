import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AcDatagridApi } from "./ac-datagrid-api";
import { AcDatagridState } from "../models/ac-datagrid-state.model";

export abstract class AcDatagridExtension{
  datagridApi?:AcDatagridApi;
  hookId = '';

  destroy(){
    acNullifyInstanceProperties({instance:this});
  }

  init(){
    // Init implementation in child
  }

  getState({state}:{state:AcDatagridState}):any{
    // Get state implementation
  }

  handleHook({hook,args}:{hook:string,args:any}){
    // Hooks implementation
  }

  setState({extensionState,state}:{extensionState?:any,state:AcDatagridState}){
    // Set state implementation
  }
}
