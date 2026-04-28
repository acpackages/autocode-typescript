/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcElementBase, acGetParentElementWithTag } from "@autocode-ts/ac-browser";
import { AcDDEApi } from "../../core/ac-dde-api";
import { AcDataDictionaryEditorElement } from "./ac-data-dictionary-editor.element";
import { AC_DDE_TAG } from "../../_ac-data-dictionary-editor.export";

export class AcDDEElementBase extends AcElementBase{
  editorApi!: AcDDEApi;
  protected hookSubscriptionIds: string[] = [];

 private autoBindEditor() {
     if (this.isConnected) {
       const editor = acGetParentElementWithTag({ element: this, tag: AC_DDE_TAG.editor });
       if (editor) {
         this.editorApi = (editor as AcDataDictionaryEditorElement).editorApi!;
       }
     }
     else {
       this.delayedCallback.add({
         callback: () => {
           this.autoBindEditor();
         }, duration: 50, key: 'autoBindEditor'
       });
     }
   }

  override init(){
    super.init();
    this.autoBindEditor();
  }
}
