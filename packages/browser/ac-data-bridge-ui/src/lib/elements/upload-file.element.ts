import { AcElement, AcEventEmitter, AcInput, AcOutput } from '@autocode-ts/ac-runtime';
import { AcDataBridge }  from '@autocode-ts/ac-data-bridge';
import { ACI_SVG_SOLID }  from '@autocode-ts/ac-icons';

@AcElement({
  selector: 'ac-data-bridge-ui-upload-file',
  template: `
  <div class="max-w-2xl mx-auto" style="cursor:pointer">

    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Import data</h1>
      <p class="text-gray-600 mt-2">Drop your Excel file to see all sheets and columns and import data into the
        system
      </p>
    </div>

    <div (drop)="handleDrop($event)" (dragover)="handleDragOver($event)" (dragleave)="handleDragLeave($event)"
      ac:class.border-blue-500="isDragging()" ac:class.bg-blue-50="isDragging()"
      class="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 hover:border-gray-400">

      <input type="file" accept=".xlsx,.xls" (change)="handleFileSelected($event)" class="d-none" id="excel-input">

      <label for="excel-input" class="cursor-pointer">
        <ac-svg-icon style="height: 150px;width:auto;" ac:bind:svg-code="ACI_SVG_SOLID.filePlus"></ac-svg-icon>
        <p class="mt-4 text-xl font-medium text-gray-700">
          Drop your Excel file here
        </p>
        <p class="mt-2 text-sm text-gray-500">
          or click to browse (.xlsx, .xls)
        </p>
      </label>
      <div class="mb-5">
        <!-- - or - -->
      </div>
      <div>
        <button type="button" class="btn btn-dark" (click)="handleDownloadXlsxTemplate()">Download XLSX
          template</button>
      </div>
    </div>
  </div>

  `,
  styles: `
  :host{
    display: flex;
    height: 100%;
    align-items: center;
  }
  `
})
export class UploadFileElement {
  @AcInput() dataBridge?: AcDataBridge;

  @AcOutput() downloadTemplate: AcEventEmitter<any> = new AcEventEmitter();

  ACI_SVG_SOLID = ACI_SVG_SOLID;
  isDragging = false;

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  handleFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  handleDownloadXlsxTemplate() {
    this.downloadTemplate.emit()
  }

  private async processFile(file: File) {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      // AcMessage.error({ message: 'Please upload a valid Excel file (.xlsx or .xls)' });
      return;
    }
    try {
      // Read to transferable buffer in main thread
      const buffer = await file.arrayBuffer();
      const sheets = await this.dataBridge?.setData({ buffer });
      // this.sheets = sheets;
    } catch (error) {
      // AcMessage.error({ message: 'Error processing file: ' + (error as Error).message });
    }
    // App.showLoader = false;
  }
}
