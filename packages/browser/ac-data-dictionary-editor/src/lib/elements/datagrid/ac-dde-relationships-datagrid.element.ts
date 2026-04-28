/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AC_DATAGRID_EVENT, IAcDatagridCellRendererElementInitEvent, IAcDatagridColumnDefinition, IAcDatagridRowEvent, IAcDatagridCell, IAcDatagridRow, IAcDatagridColumn, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import { AcDDEDatagridSelectTableInput } from "../cell-editors/ac-dde-datagrid-select-table-input.element";
import { AcDDEDatagridSelectTableColumnInput } from "../cell-editors/ac-dde-datagrid-select-table-column-input.element";
import { AcDDEDatagridYesNoInput } from "../cell-editors/ac-dde-datagrid-yes-no-input.element";
import { AcDDEDatagridElement } from "./ac-dde-datagrid.element";
import { AcDDEDatagridRowAction } from "../shared/ac-dde-datagrid-row-action.element";
import { arrayRemoveByKey } from "@autocode-ts/ac-extensions";
import { IAcDDEDatagridBeforeColumnsSetInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-before-columns-set-hook-args.interface";
import { IAcDDERelationship } from "../../interfaces/ac-dde-relationship.inteface";
import { AcEnumDDERelationship } from "../../enums/ac-enum-dde-storage-keys.enum";
import { AcEnumDDEHook } from "../../enums/ac-enum-dde-hooks.enum";
import { IAcDDETableColumn } from "../../interfaces/ac-dde-table-column.inteface";
import { IAcDDEDatagridCellInitHookArgs } from "../../interfaces/hook-args/ac-dde-datagrid-cell-init-hook-args.interface";
import { AcEnumDDEEntity } from "../../enums/ac-enum-dde-entity.enum";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { AC_DATA_MANAGER_EVENT, IAcContextEvent } from "@autocode-ts/autocode";
import { AcDDETableRenderer } from "../cell-renderers/ac-dde-table-renderer";
import { AcDDETableColumnRenderer } from "../cell-renderers/ac-dde-table-column-renderer";
import { AC_DDE_TAG } from "../../consts/ac-dde-tag.const";

export class AcDDERelationshipsDatagridElement extends AcDDEDatagridElement{
  data: any[] = [];
  filterFunction: Function | undefined;

  applyFilter() {
    let data = this.data;
    if (this.filterFunction != undefined) {
      data = data.filter((item: IAcDDERelationship) => this.filterFunction!(item));
    }
    this.datagridApi.data = data;
  }

   override initDatagrid() {
    super.initDatagrid();

    const columnDefinitions: IAcDatagridColumnDefinition[] = [
      {
        'field': 'action', 'title': '', cellRendererElement: AcDDEDatagridRowAction, cellRendererElementParams: {
          editorApi: this.editorApi
        }, width: 35, allowEdit:false,allowFocus:false,allowFilter:false,allowSort:false
      },
      {
        'field': AcEnumDDERelationship.DestinationTableId, 'title': 'Foreign Key Table',
        cellEditorElement: AcDDEDatagridSelectTableInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, cellRendererElement:AcDDETableRenderer,cellRendererElementParams: {
          editorApi: this.editorApi
        },allowFilter:true
      },
      {
        'field': AcEnumDDERelationship.DestinationColumnId, 'title': 'Foreign Key Column',
        cellEditorElement: AcDDEDatagridSelectTableColumnInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, cellRendererElement:AcDDETableColumnRenderer,cellRendererElementParams: {
          editorApi: this.editorApi
        },allowFilter:true
      },
      {
        'field': AcEnumDDERelationship.SourceTableId, 'title': 'Primary Key Table',
        cellEditorElement: AcDDEDatagridSelectTableInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, cellRendererElement:AcDDETableRenderer,cellRendererElementParams: {
          editorApi: this.editorApi
        },allowFilter:true
      },
      {
        'field': AcEnumDDERelationship.SourceColumnId, 'title': 'Primary Key Column',
        cellEditorElement: AcDDEDatagridSelectTableColumnInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, cellRendererElement:AcDDETableColumnRenderer,cellRendererElementParams: {
          editorApi: this.editorApi
        },allowFilter:true
      },
      {
        'field': AcEnumDDERelationship.CascadeDeleteSource, 'title': 'Cascade Delete Source',
        cellEditorElement: AcDDEDatagridYesNoInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true,allowFilter:true
      },
      {
        'field': AcEnumDDERelationship.CascadeDeleteDestination, 'title': 'Cascade Delete Destination',
        cellEditorElement: AcDDEDatagridYesNoInput, cellEditorElementParams: {
          editorApi: this.editorApi
        }, useCellEditorForRenderer: true,allowFilter:true
      }
    ];
    const colSetHookArgs: IAcDDEDatagridBeforeColumnsSetInitHookArgs = {
      datagridApi: this.datagridApi,
      editorApi: this.editorApi,
      columnDefinitions: columnDefinitions,
      instance: this
    };
    this.editorApi.hooks.execute({ hook: AcEnumDDEHook.RelationshipDatagridBeforeColumnsSet, args: colSetHookArgs });
    this.datagridApi.columnDefinitions = columnDefinitions;

    this.datagridApi.on({
      event: AC_DATA_MANAGER_EVENT.BeforeRowAdd, callback: (args: any) => {
        const row = this.editorApi.dataStorage.addRelationship({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId, ...args.data });
        args.data = row;
        this.data.push(row);
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.RowDelete, callback: (args: IAcDatagridRowEvent) => {
        this.editorApi.dataStorage.deleteRelationship({ relationshipId: args.datagridRow.data[AcEnumDDERelationship.RelationshipId] });
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditorElementInit, callback: (args: any) => {
        console.log(args);
        const editor = args.editor;
        const datagridCell:IAcDatagridCell = editor.datagridCell;
        const datagridRow:IAcDatagridRow = datagridCell.datagridRow;
        const datagridColumn:IAcDatagridColumn = datagridCell.datagridColumn;
        if (datagridColumn.columnKey == AcEnumDDERelationship.DestinationColumnId) {
          const selectColumnInput: AcDDEDatagridSelectTableColumnInput = editor.editor;
          selectColumnInput.filter = (row: IAcDDETableColumn) => {
            return row.tableId == datagridRow.data[AcEnumDDERelationship.DestinationTableId];
          };
          selectColumnInput.setOptions();
        }
        else if (datagridColumn.columnKey == AcEnumDDERelationship.SourceColumnId) {
          const selectColumnInput: AcDDEDatagridSelectTableColumnInput = editor.editor as AcDDEDatagridSelectTableColumnInput;
          selectColumnInput.selectInput.name = AcEnumDDERelationship.SourceColumnId;
          selectColumnInput.filter = (row: IAcDDETableColumn) => {
            return row.tableId == datagridRow.data[AcEnumDDERelationship.SourceTableId];
          };
          selectColumnInput.setOptions();
        }
        else if (datagridColumn.columnKey == AcEnumDDERelationship.SourceTableId) {
          const selectTableInput: AcDDEDatagridSelectTableInput = editor.editor as AcDDEDatagridSelectTableInput;
          console.log(selectTableInput);
          // args.datagridCell.on({
          //   event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: any) => {
          //     const sourceColumnCell = datagridRow.datagridCells.find((cell) => {
          //       return cell.datagridColumn.columnKey == AcEnumDDERelationship.SourceColumnId;
          //     });
          //     if (sourceColumnCell && sourceColumnCell.element && sourceColumnCell.element.cellEditor) {
          //       const selectColumnInput: AcDDEDatagridSelectTableColumnInput = sourceColumnCell.element.cellEditor as any;
          //       selectColumnInput.setOptions();
          //     }
          //   }
          // });
        }
        else if (datagridColumn.columnKey == AcEnumDDERelationship.DestinationTableId) {
          const selectTableInput: AcDDEDatagridSelectTableInput = editor.editor as AcDDEDatagridSelectTableInput;
          // args.datagridCell.on({
          //   event: AC_DATAGRID_EVENT.CellValueChange, callback: (args: any) => {
          //     const destinationColumnCell = datagridRow.datagridCells.find((cell) => {
          //       return cell.datagridColumn.columnKey == AcEnumDDERelationship.DestinationColumnId;
          //     });
          //     if (destinationColumnCell && destinationColumnCell.element && destinationColumnCell.element.cellEditor) {
          //       const selectColumnInput: AcDDEDatagridSelectTableColumnInput = destinationColumnCell.element.cellEditor as any;
          //       selectColumnInput.setOptions();
          //     }
          //   }
          // });
        }
        const hookArgs: IAcDDEDatagridCellInitHookArgs = {
          datagridApi: this.datagridApi,
          editorApi: this.editorApi,
          datagridCell: args.datagridCell,
          eventArgs: args,
          instance: this
        };
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.RelationshipDatagridCellEditorInit, args: hookArgs });
      }
    });
    this.datagridApi.on({
      event: AC_DATAGRID_EVENT.CellEditorElementInit, callback: (args: IAcDatagridCellRendererElementInitEvent) => {
        const hookArgs: IAcDDEDatagridCellInitHookArgs = {
          datagridApi: this.datagridApi,
          editorApi: this.editorApi,
          datagridCell: args.datagridCell,
          eventArgs: args,
          instance: this
        };
        this.editorApi.hooks.execute({ hook: AcEnumDDEHook.RelationshipDatagridCellRendererInit, args: hookArgs });
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.DataDictionarySet, callback: () => {
        this.setRelationshipsData();
      }
    });
    this.editorApi.dataStorage.on('change', AcEnumDDEEntity.Relationship, (args: IAcContextEvent) => {
      if (args.event == 'delete') {
        arrayRemoveByKey(this.data, AcEnumDDERelationship.RelationshipId, args.oldValue[AcEnumDDERelationship.RelationshipId]);
      }
    });

    this.editorApi.hooks.subscribe({
      hook: AcEnumDDEHook.ActiveDataDictionaryChange, callback: (args: IAcDDEActiveDataDictionaryChangeHookArgs) => {
        this.setRelationshipsData();
      }
    });

    this.setRelationshipsData();
  }

  setRelationshipsData() {
    this.data = Object.values(this.editorApi.dataStorage.getRelationships({ dataDictionaryId: this.editorApi.activeDataDictionary?.dataDictionaryId }));
    this.applyFilter();
  }
}

acRegisterCustomElement({ tag: AC_DDE_TAG.relationshipsDatagrid, type: AcDDERelationshipsDatagridElement });
