import { acNullifyInstanceProperties } from "@autocode-ts/autocode";
import { AcRepeaterApi } from "./ac-repeater-api";

export abstract class AcRepeaterExtension{
  repeaterApi!:AcRepeaterApi;
  hookId = '';

  init(){
    // Init implementation in child
  }

  destroy(){
    acNullifyInstanceProperties({instance:this});
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
