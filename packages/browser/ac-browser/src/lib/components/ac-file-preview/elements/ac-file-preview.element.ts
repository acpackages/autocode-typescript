/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { ACI_SVG_SOLID } from "@autocode-ts/ac-icons";
import { AcFileUtils } from "@autocode-ts/autocode";
import { AcElementBase } from "../../../core/ac-element-base";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";

export class AcFilePreview extends AcElementBase {
  static get observedAttributes() {
    return ['file-path'];
  }


  _file?: File;
  get file(): File | undefined {
    return this._file;
  }
  set file(value: File) {
    this._file = value;
  }

  get filePath(): string | null {
    return this.getAttribute('file-path');
  }
  set filePath(value: string) {
    this.setAttribute('file-path', value);
    this.setPreview();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    if (name == 'file-path') {
      this.filePath = newValue;
    }
  }

  override init(): void {
    super.init();
    this.style.display = "flex";
    this.style.flexDirection = "column";
    this.style.height = "100%";
    this.style.width = "100%";
    this.setPreview();
  }

  openFile() {
    if (this.filePath) {
      window.open(this.filePath, '_blank');
    }
  }

  setPreview() {
    try {
      let foundPreview: boolean = false;
      acClearElement({element:this});
      if (this.filePath) {
        const extension: string = this.filePath.split('.').pop()!;
        const fileDetails: { name: string, type: string } | undefined = AcFileUtils.detailsFromExtension({ extension: extension });
        if (fileDetails) {
          if (fileDetails.type == "image") {
            this.innerHTML = `<img src="${this.filePath}" style="height:100%;width:100%;object-fit:contain;"/>`
          }
          else {
            this.setExtensionPreview(extension);
          }
        }
        else {
          this.setExtensionPreview(extension);
        }
        foundPreview = true;
      }
      else if (this.file) {
        // this.logger.debug("Found file", this.file.name, this.file);
        // let extension = this.file.name.split('.').pop()!;
        // this.logger.debug("Found file extension is " + extension);
        // let fileDetails: any = FileExtensions[extension];
        // this.logger.debug("File Details from Extension ", fileDetails);
        // if (fileDetails) {
        //   if (fileDetails["type"] == "image") {
        //     this.logger.debug("Found image type from extension");
        //     this.previewMode = 'image';
        //     const reader = new FileReader();
        //     reader.onload = () => {
        //       this.previewSrc = reader.result;
        //     };
        //     reader.onerror = (error) => {
        //       console.error(error);
        //     };
        //     reader.readAsDataURL(this.file);
        //   }
        //   else {
        //     this.logger.debug("Not image so setting preview svg");
        //     this.setFileSvgPreview(extension);
        //   }
        // }
        // else {
        //   this.setFileSvgPreview(extension);
        //   this.logger.debug("Invalid file details");
        // }
        // foundPreview = true;
      }
      else
        if (!foundPreview) {
          this.setExtensionPreview("");
        }
    }
    catch (ex) {
      console.error(ex, this.file);
    }
  }

  setExtensionPreview(extension: string) {
    acClearElement({element:this});
    let svgName:string = 'file';
    const svgObject:any = ACI_SVG_SOLID;
    if(extension!=""){
      const fileDetails: { name: string, type: string, svg: string } | undefined = AcFileUtils.detailsFromExtension({ extension: extension });
      if(fileDetails){
        svgName = fileDetails.svg;
      }
    }
    this.innerHTML = `<ac-svg-icon style="margin:auto;height:50%;width:50%">${svgObject[svgName]}</ac-svg-icon>`;
    if (extension != "") {
      this.innerHTML += `<ac-file-preview-extension style="text-align:center;height:30%;font-weight:bold;font-size:20px;text-transform:uppercase;">${extension}</ac-file-preview-extension>`;
    }
  }

}

acRegisterCustomElement({ tag: 'ac-file-preview', type: AcFilePreview });
