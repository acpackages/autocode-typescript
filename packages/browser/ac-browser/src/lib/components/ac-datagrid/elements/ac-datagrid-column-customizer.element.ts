import { AcElementBase } from "../../../core/ac-element-base";
import { AcDatagridApi } from "../core/ac-datagrid-api";
import { IAcDatagridColumn } from "../interfaces/ac-datagrid-column.interface";
import { acClearElement, acRegisterCustomElement } from "../../../utils/ac-element-functions";
import { AC_DATAGRID_TAG } from "../_ac-datagrid.export";

export class AcDatagridColumnCustomizerElement extends AcElementBase {
  private datagridApi!: AcDatagridApi;
  private draggingIndex: number = -1;

  bindDatagridApi({ datagridApi }: { datagridApi: AcDatagridApi }) {
    this.datagridApi = datagridApi;
    this.render();
  }

  override init() {
    super.init();
    this.classList.add('ac-datagrid-column-customizer');
  }

  render() {
    acClearElement({ element: this });
    if (!this.datagridApi) return;

    const columns = [...this.datagridApi.datagridColumns].sort((a, b) => {
        const aIdx = a.columnDefinition.index ?? 0;
        const bIdx = b.columnDefinition.index ?? 0;
        return aIdx - bIdx;
    });

    const header = document.createElement('div');
    header.className = 'ac-column-customizer-header';
    header.innerHTML = `
      <span class="ac-column-customizer-title">Customize Columns</span>
      <button class="ac-column-customizer-close">&times;</button>
    `;
    this.append(header);

    header.querySelector('.ac-column-customizer-close')?.addEventListener('click', () => {
      this.style.display = 'none';
    });

    const list = document.createElement('div');
    list.className = 'ac-column-customizer-list';

    columns.forEach((col, idx) => {
      const item = document.createElement('div');
      item.className = 'ac-column-customizer-item';
      item.draggable = true;
      item.dataset.index = idx.toString();

      const dragHandle = document.createElement('span');
      dragHandle.className = 'ac-column-customizer-drag-handle';
      dragHandle.innerHTML = '&#9776;'; // Hamburger icon

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ac-column-customizer-checkbox';
      checkbox.checked = col.visible;
      checkbox.addEventListener('change', () => {
        col.columnDefinition.visible = checkbox.checked;
        col.visible = checkbox.checked;
        this.datagridApi.columnDefinitions = [...this.datagridApi.columnDefinitions];
      });

      const label = document.createElement('span');
      label.className = 'ac-column-customizer-label';
      label.innerText = col.title || col.columnKey;

      item.append(dragHandle);
      item.append(checkbox);
      item.append(label);

      // Drag and drop logic
      item.addEventListener('dragstart', (e) => {
        this.draggingIndex = idx;
        item.classList.add('dragging');
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
        }
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        this.draggingIndex = -1;
        this.render();
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = this.querySelector('.dragging') as HTMLElement;
        if (draggingItem && draggingItem !== item) {
            const bounding = item.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            if (offset > bounding.height / 2) {
                item.after(draggingItem);
            } else {
                item.before(draggingItem);
            }
        }
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        this.applyNewOrder();
      });

      list.append(item);
    });

    this.append(list);
  }

  private applyNewOrder() {
    const items = Array.from(this.querySelectorAll('.ac-column-customizer-item')) as HTMLElement[];
    const newOrderKeys = items.map(item => {
        const label = item.querySelector('.ac-column-customizer-label') as HTMLElement;
        return label.innerText;
    });

    const colDefs = [...this.datagridApi.columnDefinitions];
    colDefs.forEach(cd => {
        const title = cd.title || cd.field;
        const newIdx = newOrderKeys.indexOf(title);
        if (newIdx !== -1) {
            cd.index = newIdx;
        }
    });

    this.datagridApi.columnDefinitions = colDefs;
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-column-customizer', type: AcDatagridColumnCustomizerElement });
