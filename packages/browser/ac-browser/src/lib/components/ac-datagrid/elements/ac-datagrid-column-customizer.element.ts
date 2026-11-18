/* eslint-disable @typescript-eslint/no-inferrable-types */
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
      dragHandle.innerHTML = '⋮⋮';
      dragHandle.style.cursor = 'grab';
      dragHandle.style.userSelect = 'none';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ac-column-customizer-checkbox';
      checkbox.checked = col.visible;
      checkbox.addEventListener('change', () => {
        col.columnDefinition.visible = checkbox.checked;
        col.visible = checkbox.checked;
        if (this.datagridApi.datagrid?.datagridHeader) {
          this.datagridApi.datagrid.datagridHeader.render();
        }
        if (this.datagridApi.datagrid?.datagridBody) {
          this.datagridApi.datagrid.datagridBody.setDisplayedRows();
        }
      });

      const label = document.createElement('span');
      label.className = 'ac-column-customizer-label';
      label.innerText = col.title || col.columnKey;

      item.append(dragHandle);
      item.append(checkbox);
      item.append(label);

      // Pointer-based drag and drop logic
      dragHandle.addEventListener('pointerdown', (e: PointerEvent) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        try {
          dragHandle.setPointerCapture(e.pointerId);
        } catch (_) {}
        item.style.opacity = '0.5';
        document.body.classList.add('ac-datagrid-dragging-active');
        const startY = e.clientY;
        const fromIdx = col.index;
        let targetIdx = fromIdx;
        let hasMoved = false;

        let indicator = list.querySelector('.ac-column-customizer-drop-indicator') as HTMLElement;
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.className = 'ac-column-customizer-drop-indicator';
          indicator.style.position = 'absolute';
          indicator.style.left = '8px';
          indicator.style.right = '8px';
          indicator.style.height = '3px';
          indicator.style.backgroundColor = '#2196f3';
          indicator.style.zIndex = '100';
          indicator.style.pointerEvents = 'none';
          indicator.style.borderRadius = '2px';
          list.style.position = 'relative';
          list.appendChild(indicator);
        }
        indicator.style.display = 'none';

        const onMove = (moveEvt: PointerEvent) => {
          if (!hasMoved && Math.abs(moveEvt.clientY - startY) > 4) {
            hasMoved = true;
          }
          if (hasMoved) {
            let underItem = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY)?.closest('.ac-column-customizer-item') as HTMLElement;
            if (!underItem && list) {
              const listRect = list.getBoundingClientRect();
              if (moveEvt.clientY >= listRect.top && moveEvt.clientY <= listRect.bottom) {
                const items = Array.from(list.querySelectorAll('.ac-column-customizer-item')) as HTMLElement[];
                underItem = items.find(it => {
                  const r = it.getBoundingClientRect();
                  return moveEvt.clientY >= r.top && moveEvt.clientY <= r.bottom;
                }) || null;
              }
            }
            if (underItem && underItem.dataset['index']) {
              const uIdx = parseInt(underItem.dataset['index'], 10);
              const targetColItem = columns[uIdx];
              if (!targetColItem) return;
              const rect = underItem.getBoundingClientRect();
              const listRect = list.getBoundingClientRect();
              const midY = rect.top + rect.height / 2;
              const isAboveMid = moveEvt.clientY < midY;
              const topPx = (isAboveMid ? rect.top : rect.bottom) - listRect.top + list.scrollTop;
              indicator.style.top = `${topPx}px`;
              indicator.style.display = 'block';

              const insertionPoint = isAboveMid ? targetColItem.index : targetColItem.index + 1;
              targetIdx = insertionPoint > fromIdx ? insertionPoint - 1 : insertionPoint;
            }
          }
        };

        const onUp = (upEvt: PointerEvent) => {
          try {
            dragHandle.releasePointerCapture(upEvt.pointerId);
          } catch (_) {}
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          document.body.classList.remove('ac-datagrid-dragging-active');
          item.style.opacity = '';
          indicator.remove();
          if (hasMoved && targetIdx !== undefined && targetIdx !== fromIdx && targetIdx >= 0) {
            this.datagridApi.moveColumn({ fromIndex: fromIdx, toIndex: targetIdx });
            this.render();
          }
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });

      list.append(item);
    });

    this.append(list);
  }
}

acRegisterCustomElement({ tag: 'ac-datagrid-column-customizer', type: AcDatagridColumnCustomizerElement });
