/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AcEvents, AcHooks } from "@autocode-ts/autocode";
import { AcDDTableColumn, AcDDTable, AcDataDictionary, AcDDView, AcDDViewColumn, AcDDTrigger, AcDDRelationship, AcDDFunction, AcDDStoredProcedure, AcEnumDDColumnType, AcEnumDDTableProperty, AcDDTableProperty } from "@autocode-ts/ac-data-dictionary";
import { IAcDDEMenuGroup } from "../interfaces/ac-dde-menu-group.interface";
import { AcDDEExtension } from "./ac-dde-extension";
import { IAcDDEMenuGroupAddHookArgs } from "../interfaces/hook-args/ac-dde-menu-group-add-hook-args.interface";
import { AcEnumDDEHook } from "../enums/ac-enum-dde-hooks.enum";
import { AcDDEExtensionManager } from "./ac-dde-extension-manager";
import { IAcDDEExtensionEnabledHookArgs } from "../interfaces/hook-args/ac-dde-extension-enabled-hook-args.interface";
import { AcDataDictionaryEditor } from "../elements/core/ac-data-dictionary-editor.element";
import { IAcDDEActiveDataDictionaryChangeHookArgs } from "../interfaces/hook-args/ac-dde-active-data-dictionary-change-hook-args.interface";
import { IAcDDEState } from "../interfaces/ac-dde-state.interface";
import { AcDDEState } from "./ac-dde-state";
import { AcDDEDataStorage } from "./ac-dde-data-storage";
import { IAcDDEDataDictionary } from "../interfaces/ac-dde-data-dictionary.inteface";
import { AcEnumDDETab } from "../enums/ac-enum-dde-tab.enum";
import { IAcDDEHookArgs } from "../interfaces/hook-args/ac-dde-hook-args.interface";
import { AcDDEEventHandler } from "./ac-dde-event-handler";
import { AcSqlParser } from "@autocode-ts/ac-sql-parser";

export class AcDDEApi {
  private _activeDataDictionary?: IAcDDEDataDictionary;
  get activeDataDictionary(): IAcDDEDataDictionary | undefined {
    return this._activeDataDictionary;
  }
  set activeDataDictionary(value: IAcDDEDataDictionary) {
    const oldActiveDataDictionary = this._activeDataDictionary;
    this._activeDataDictionary = value;
    const hookArgs: IAcDDEActiveDataDictionaryChangeHookArgs = {
      activeDataDictionary: value,
      editorApi: this,
      oldActiveDataDictionary: oldActiveDataDictionary,
    };
    this.hooks.execute({ hook: AcEnumDDEHook.ActiveDataDictionaryChange, args: hookArgs });
  }

  private _activeEditorTab: AcEnumDDETab = AcEnumDDETab.TableEditor;
  get activeEditorTab(): AcEnumDDETab {
    return this._activeEditorTab;
  }
  set activeEditorTab(value: AcEnumDDETab) {
    this._activeEditorTab = value;
    const hookArgs: IAcDDEHookArgs = {
      editorApi: this,
      value: value,
    };
    this.hooks.execute({ hook: AcEnumDDEHook.EditorTabChange, args: hookArgs });
  }

  dataStorage: AcDDEDataStorage;
  editor: AcDataDictionaryEditor;
  editorState: AcDDEState;
  events: AcEvents = new AcEvents();
  eventHandler: AcDDEEventHandler;
  extensions: Record<string, AcDDEExtension> = {};
  hooks: AcHooks = new AcHooks();
  menus: IAcDDEMenuGroup[] = [];
  sqlParser: AcSqlParser = new AcSqlParser();

  constructor({ editor }: { editor: AcDataDictionaryEditor }) {
    this.editor = editor;
    this.eventHandler = new AcDDEEventHandler({ editorApi: this });
    this.dataStorage = new AcDDEDataStorage({ editorApi: this });
    this.editorState = new AcDDEState({ editorApi: this });
    this.sqlParser.columnsGetterFun = ({entityName}:{entityName: string}) => {
      const columns = [];
      if(this.dataStorage.hasTable({tableName:entityName,dataDictionaryId:this.activeDataDictionary?.dataDictionaryId})){
        const tableColumns = this.dataStorage.getTableColumns({ tableName: entityName ,dataDictionaryId:this.activeDataDictionary?.dataDictionaryId});
        for (const col of tableColumns) {
          columns.push(col.columnName);
        }
      }
      else if(this.dataStorage.hasView({viewName:entityName,dataDictionaryId:this.activeDataDictionary?.dataDictionaryId})){
        const viewColumns = this.dataStorage.getViewColumns({ viewName: entityName,dataDictionaryId:this.activeDataDictionary?.dataDictionaryId });
        for (const col of viewColumns) {
          columns.push(col.columnName);
        }
      }
      return columns;
    }
    AcDDEExtensionManager.registerBuiltInExtensions();
  }

  addMenuGroup({ menuGroup }: { menuGroup: IAcDDEMenuGroup }) {
    this.menus.push(menuGroup);
    const hookArgs: IAcDDEMenuGroupAddHookArgs = {
      editorApi: this,
      menuGroup: menuGroup
    };
    this.hooks.execute({ hook: AcEnumDDEHook.MenuGroupAdd, args: hookArgs });
  }

  enableExtension({ extensionName }: { extensionName: string }): AcDDEExtension | null {
    if (AcDDEExtensionManager.hasExtension({ extensionName: extensionName })) {
      const extensionInstance = AcDDEExtensionManager.createInstance({ extensionName: extensionName });
      if (extensionInstance) {
        extensionInstance.editorApi = this;
        const hookId: string = this.hooks.subscribeAllHooks({
          callback: (hook: string, args: any) => {
            extensionInstance.handleHook({ hook: hook, args: args });
          }
        });
        extensionInstance.hookId = hookId;
        extensionInstance.init();
        this.extensions[extensionName] = extensionInstance;
        const hookArgs: IAcDDEExtensionEnabledHookArgs = {
          extensionName: extensionName,
          editorApi: this,
        };
        this.hooks.execute({ hook: AcEnumDDEHook.ExtensionEnabled, args: hookArgs });
        return extensionInstance;
      }
    }
    return null;
  }

  getDataDictionaryJson({ dataDictionaryId }: { dataDictionaryId: string }) {
    const dataDictionary: any = {
      [AcDataDictionary.KeyName]: 0,
      [AcDataDictionary.KeyVersion]: 0,
      [AcDataDictionary.KeyTables]: {},
      [AcDataDictionary.KeyViews]: {},
      [AcDataDictionary.KeyRelationships]: [],
      [AcDataDictionary.KeyStoredProcedures]: {},
      [AcDataDictionary.KeyFunctions]: {},
      [AcDataDictionary.KeyTriggers]: {},
    };

    const dataDictionaryRows = this.dataStorage.getDataDictionaries({ dataDictionaryId: dataDictionaryId });
    if (dataDictionaryRows.length > 0) {
      const dataDictionaryRow: IAcDDEDataDictionary = dataDictionaryRows[0];
      dataDictionary[AcDataDictionary.KeyVersion] = dataDictionaryRow.dataDictionaryVersion;
      dataDictionary[AcDataDictionary.KeyName] = dataDictionaryRow.dataDictionaryName?.trim() ?? "";

      const tables: any = {};
      for (const tableRow of this.dataStorage.getTables({ dataDictionaryId: dataDictionaryRow.dataDictionaryId })) {
        const columns: any = {};
        const properties: any = { ...tableRow.tableProperties };

        for (const columnRow of this.dataStorage.getTableColumns({ tableId: tableRow.tableId! })) {
          const name = columnRow.columnName!.trim();
          columns[name] = {
            [AcDDTableColumn.KeyColumnName]: name,
            [AcDDTableColumn.KeyColumnType]: columnRow.columnType,
            [AcDDTableColumn.KeyColumnProperties]: columnRow.columnProperties
          };
        }

        delete properties[AcEnumDDTableProperty.SqlViewName];
        if (tableRow.viewId) {
          const viewRows = this.dataStorage.getViews({ viewId: tableRow.viewId, dataDictionaryId: dataDictionaryRow.dataDictionaryId });
          if (viewRows.length > 0) {
            properties[AcEnumDDTableProperty.SqlViewName] = {
              [AcDDTableProperty.KeyPropertyName]: AcEnumDDTableProperty.SqlViewName,
              [AcDDTableProperty.KeyPropertyValue]: viewRows[0].viewName?.trim()
            };
          }
        }

        tables[tableRow.tableName!.trim()] = {
          [AcDDTable.KeyTableName]: tableRow.tableName!.trim(),
          [AcDDTable.KeyTableColumns]: columns,
          [AcDDTable.KeyTableProperties]: properties
        };
      }
      dataDictionary[AcDataDictionary.KeyTables] = tables;

      const views: any = {};
      for (const viewRow of this.dataStorage.getViews({ dataDictionaryId: dataDictionaryRow.dataDictionaryId })) {
        const columns: any = {};
        for (const columnRow of this.dataStorage.getViewColumns({ viewId: viewRow.viewId })) {
          const name = columnRow.columnName!.trim();
          columns[name] = {
            [AcDDViewColumn.KeyColumnName]: name,
            [AcDDViewColumn.KeyColumnType]: columnRow.columnType,
            [AcDDViewColumn.KeyColumnProperties]: columnRow.columnProperties,
            [AcDDViewColumn.KeyColumnSource]: columnRow.columnSource,
            [AcDDViewColumn.KeyColumnSourceName]: columnRow.columnSourceName?.trim(),
            [AcDDViewColumn.KeyColumnSourceOriginalColumn]: columnRow.columnSourceOriginalColumn?.trim()
          };
        }
        views[viewRow.viewName!.trim()] = {
          [AcDDView.KeyViewName]: viewRow.viewName!.trim(),
          [AcDDView.KeyViewColumns]: columns,
          [AcDDView.KeyViewQuery]: viewRow.viewQuery?.trim() ?? ""
        };
      }
      dataDictionary[AcDataDictionary.KeyViews] = views;

      const relationships: any[] = [];
      for (const relationshipRow of this.dataStorage.getRelationships({ dataDictionaryId: dataDictionaryRow.dataDictionaryId })) {
        if (
          this.dataStorage.hasTableColumnWithId(relationshipRow.destinationColumnId!) &&
          this.dataStorage.hasTableColumnWithId(relationshipRow.sourceColumnId!) &&
          this.dataStorage.hasTableWithId(relationshipRow.destinationTableId!) &&
          this.dataStorage.hasTableWithId(relationshipRow.sourceTableId!)
        ) {
          relationships.push({
            [AcDDRelationship.KeyCascadeDeleteDestination]: relationshipRow.cascadeDeleteDestination,
            [AcDDRelationship.KeyCascadeDeleteSource]: relationshipRow.cascadeDeleteSource,
            [AcDDRelationship.KeyDestinationColumn]: this.dataStorage.getTableColumns({ columnId: relationshipRow.destinationColumnId })[0].columnName!.trim(),
            [AcDDRelationship.KeyDestinationTable]: this.dataStorage.getTables({ tableId: relationshipRow.destinationTableId })[0].tableName!.trim(),
            [AcDDRelationship.KeySourceColumn]: this.dataStorage.getTableColumns({ columnId: relationshipRow.sourceColumnId })[0].columnName!.trim(),
            [AcDDRelationship.KeySourceTable]: this.dataStorage.getTables({ tableId: relationshipRow.sourceTableId })[0].tableName!.trim()
          });
        }
      }
      dataDictionary[AcDataDictionary.KeyRelationships] = relationships;

      const triggers: any = {};
      for (const triggerRow of this.dataStorage.getTriggers({ dataDictionaryId: dataDictionaryRow.dataDictionaryId })) {
        if (this.dataStorage.hasTableWithId(triggerRow.tableId!)) {
          const tableName = this.dataStorage.getTables({ tableId: triggerRow.tableId })[0].tableName!.trim();
          triggers[triggerRow.triggerName!.trim()] = {
            [AcDDTrigger.KeyTriggerExecution]: triggerRow.triggerExecution,
            [AcDDTrigger.KeyRowOperation]: triggerRow.rowOperation,
            [AcDDTrigger.KeyTableName]: tableName,
            [AcDDTrigger.KeyTriggerName]: triggerRow.triggerName!.trim(),
            [AcDDTrigger.KeyTriggerCode]: triggerRow.triggerCode?.trim() ?? ""
          };
        }
      }
      dataDictionary[AcDataDictionary.KeyTriggers] = triggers;

      const functions: any = {};
      for (const functionRow of this.dataStorage.getFunctions({ dataDictionaryId: dataDictionaryRow.dataDictionaryId })) {
        functions[functionRow.functionName!.trim()] = {
          [AcDDFunction.KeyFunctionName]: functionRow.functionName!.trim(),
          [AcDDFunction.KeyFunctionCode]: functionRow.functionCode?.trim() ?? ""
        };
      }
      dataDictionary[AcDataDictionary.KeyFunctions] = functions;

      const storedProcedures: any = {};
      for (const storedProcedureRow of this.dataStorage.getStoredProcedures({ dataDictionaryId: dataDictionaryRow.dataDictionaryId })) {
        storedProcedures[storedProcedureRow.storedProcedureName!.trim()] = {
          [AcDDStoredProcedure.KeyStoredProcedureName]: storedProcedureRow.storedProcedureName!.trim(),
          [AcDDStoredProcedure.KeyStoredProcedureCode]: storedProcedureRow.storedProcedureCode?.trim() ?? ""
        };
      }
      dataDictionary[AcDataDictionary.KeyStoredProcedures] = storedProcedures;
    }

    if(Object.keys(dataDictionary[AcDataDictionary.KeyTables]).length == 0){
      delete dataDictionary[AcDataDictionary.KeyTables];
    }
    if(Object.keys(dataDictionary[AcDataDictionary.KeyViews]).length == 0){
      delete dataDictionary[AcDataDictionary.KeyViews];
    }
    if(Object.keys(dataDictionary[AcDataDictionary.KeyRelationships]).length == 0){
      delete dataDictionary[AcDataDictionary.KeyRelationships];
    }
    if(Object.keys(dataDictionary[AcDataDictionary.KeyStoredProcedures]).length == 0){
      delete dataDictionary[AcDataDictionary.KeyStoredProcedures];
    }
    if(Object.keys(dataDictionary[AcDataDictionary.KeyFunctions]).length == 0){
      delete dataDictionary[AcDataDictionary.KeyFunctions];
    }
    if(Object.keys(dataDictionary[AcDataDictionary.KeyTriggers]).length == 0){
      delete dataDictionary[AcDataDictionary.KeyTriggers];
    }
    return dataDictionary;
  }

  getState(): IAcDDEState {
    return this.editorState.toJson();
  }

  on({ event, callback }: { event: string, callback: Function }): string {
    return this.events.subscribe({ event, callback });
  }

  setDataDictionaryJson({ dataDictionaryJson, dataDictionaryName }: { dataDictionaryName?: string, dataDictionaryJson: any }) {
    let version: number = 0;
    if (dataDictionaryJson[AcDataDictionary.KeyVersion]) {
      version = dataDictionaryJson[AcDataDictionary.KeyVersion];
    }

    const name = (dataDictionaryName ?? dataDictionaryJson[AcDataDictionary.KeyName] ?? "").trim();
    if (!name) {
      throw new Error("Data dictionary name is required");
    }

    const dataDictionaries = this.dataStorage.getDataDictionaries({ dataDictionaryName: name });
    let dataDictionaryRow: IAcDDEDataDictionary;
    if (dataDictionaries.length > 0) {
      dataDictionaryRow = dataDictionaries[0];
    } else {
      dataDictionaryRow = this.dataStorage.addDataDictionary({ dataDictionaryName: name, dataDictionaryVersion: version });
    }
    const dataDictionaryId = dataDictionaryRow.dataDictionaryId;

    // Views
    if (dataDictionaryJson[AcDataDictionary.KeyViews]) {
      const viewNames: string[] = Object.keys(dataDictionaryJson[AcDataDictionary.KeyViews]).map(n => n.trim()).sort();
      for (const viewName of viewNames) {
        const viewDetails = dataDictionaryJson[AcDataDictionary.KeyViews][viewName];
        const viewQuery = (viewDetails[AcDDView.KeyViewQuery] ?? "").trim();
        const viewColumns = viewDetails[AcDDView.KeyViewColumns] ?? {};

        const viewRow = this.dataStorage.addView({ dataDictionaryId: dataDictionaryId, viewName: viewName.trim(), viewQuery: viewQuery });

        for (const columnDetails of Object.values(viewColumns) as any[]) {
          const columnName = columnDetails[AcDDViewColumn.KeyColumnName]?.trim() ?? "";
          const columnProperties = columnDetails[AcDDViewColumn.KeyColumnProperties] ?? {};
          const columnSource = columnDetails[AcDDViewColumn.KeyColumnSource]?.trim() ?? "";
          const columnSourceName = columnDetails[AcDDViewColumn.KeyColumnSourceName]?.trim() ?? "";
          const columnSourceOriginalColumn = columnDetails[AcDDViewColumn.KeyColumnSourceOriginalColumn]?.trim() ?? "";
          const columnType = columnDetails[AcDDViewColumn.KeyColumnType] ?? "";

          this.dataStorage.addViewColumn({
            dataDictionaryId: dataDictionaryId,
            viewId: viewRow.viewId,
            columnName: columnName,
            columnType: columnType,
            columnProperties: columnProperties,
            columnSource: columnSource,
            columnSourceName: columnSourceName,
            columnSourceOriginalColumn: columnSourceOriginalColumn
          });
        }
      }
    }

    // Tables
    if (dataDictionaryJson[AcDataDictionary.KeyTables]) {
      const tableNames: string[] = Object.keys(dataDictionaryJson[AcDataDictionary.KeyTables]).map(n => n.trim()).sort();
      for (const tableName of tableNames) {
        const tableDetails = dataDictionaryJson[AcDataDictionary.KeyTables][tableName];
        const tableColumns = tableDetails[AcDDTable.KeyTableColumns] ?? {};
        const tableProperties = tableDetails[AcDDTable.KeyTableProperties] ?? {};

        let sqlViewId: string | undefined;
        if (tableProperties[AcEnumDDTableProperty.SqlViewName]) {
          const sqlViewName = tableProperties[AcEnumDDTableProperty.SqlViewName][AcDDTableProperty.KeyPropertyValue]?.trim() ?? "";
          if (sqlViewName) {
            const viewRows = this.dataStorage.getViews({ viewName: sqlViewName, dataDictionaryId: dataDictionaryId! });
            if (viewRows.length > 0) {
              sqlViewId = viewRows[0].viewId;
            }
          }
        }

        const tableRow = this.dataStorage.addTable({
          dataDictionaryId: dataDictionaryId,
          tableName: tableName.trim(),
          tableProperties: tableProperties,
          viewId: sqlViewId
        });

        for (const columnDetails of Object.values(tableColumns) as any[]) {
          const columnName = columnDetails[AcDDTableColumn.KeyColumnName]?.trim() ?? "";
          const columnProperties = columnDetails[AcDDTableColumn.KeyColumnProperties] ?? {};
          const columnType = columnDetails[AcDDTableColumn.KeyColumnType] ?? "";

          this.dataStorage.addTableColumn({
            dataDictionaryId: dataDictionaryId,
            tableId: tableRow.tableId,
            columnName: columnName,
            columnType: columnType,
            columnProperties: columnProperties
          });
        }
      }
    }

    // Triggers
    if (dataDictionaryJson[AcDataDictionary.KeyTriggers]) {
      const triggerNames: string[] = Object.keys(dataDictionaryJson[AcDataDictionary.KeyTriggers]).map(n => n.trim()).sort();
      for (const triggerName of triggerNames) {
        const triggerDetails = dataDictionaryJson[AcDataDictionary.KeyTriggers][triggerName];
        const tableName = triggerDetails[AcDDTrigger.KeyTableName]?.trim() ?? "";
        const tableRows = this.dataStorage.getTables({ tableName: tableName, dataDictionaryId: dataDictionaryId! });
        if (tableRows.length > 0) {
          this.dataStorage.addTrigger({
            dataDictionaryId: dataDictionaryId,
            triggerName: triggerName.trim(),
            rowOperation: triggerDetails[AcDDTrigger.KeyRowOperation],
            tableId: tableRows[0].tableId,
            triggerCode: (triggerDetails[AcDDTrigger.KeyTriggerCode] ?? "").trim(),
            triggerExecution: triggerDetails[AcDDTrigger.KeyTriggerExecution]
          });
        }
      }
    }

    // Relationships (fixed the commented-out nested loop issue)
    if (dataDictionaryJson[AcDataDictionary.KeyRelationships]) {
      for (const relationshipDetails of Object.values(dataDictionaryJson[AcDataDictionary.KeyRelationships]) as any[]) {
        const destinationTableName = relationshipDetails[AcDDRelationship.KeyDestinationTable]?.trim() ?? "";
        const sourceTableName = relationshipDetails[AcDDRelationship.KeySourceTable]?.trim() ?? "";
        const sourceColumnName = relationshipDetails[AcDDRelationship.KeySourceColumn]?.trim() ?? "";
        const destinationColumnName = relationshipDetails[AcDDRelationship.KeyDestinationColumn]?.trim() ?? "";

        const sourceTableRows = this.dataStorage.getTables({ tableName: sourceTableName, dataDictionaryId: dataDictionaryId! });
        const destinationTableRows = this.dataStorage.getTables({ tableName: destinationTableName, dataDictionaryId: dataDictionaryId! });

        if (sourceTableRows.length > 0 && destinationTableRows.length > 0) {
          const sourceTableId = sourceTableRows[0].tableId;
          const destinationTableId = destinationTableRows[0].tableId;

          const sourceColumnRows = this.dataStorage.getTableColumns({
            columnName: sourceColumnName,
            dataDictionaryId: dataDictionaryId!,
            tableId: sourceTableId!
          });
          const destinationColumnRows = this.dataStorage.getTableColumns({
            columnName: destinationColumnName,
            dataDictionaryId: dataDictionaryId!,
            tableId: destinationTableId!
          });

          if (sourceColumnRows.length > 0 && destinationColumnRows.length > 0) {
            this.dataStorage.addRelationship({
              dataDictionaryId: dataDictionaryId,
              sourceTableId: sourceTableId,
              sourceColumnId: sourceColumnRows[0].columnId,
              destinationColumnId: destinationColumnRows[0].columnId,
              destinationTableId: destinationTableId,
              cascadeDeleteDestination: relationshipDetails[AcDDRelationship.KeyCascadeDeleteDestination],
              cascadeDeleteSource: relationshipDetails[AcDDRelationship.KeyCascadeDeleteSource]
            });
          }
        }
      }
    }

    // Functions
    if (dataDictionaryJson[AcDataDictionary.KeyFunctions]) {
      for (const functionDetails of Object.values(dataDictionaryJson[AcDataDictionary.KeyFunctions]) as any[]) {
        const functionName = functionDetails[AcDDFunction.KeyFunctionName]?.trim() ?? "";
        if (functionName) {
          this.dataStorage.addFunction({
            dataDictionaryId: dataDictionaryId,
            functionName: functionName,
            functionCode: (functionDetails[AcDDFunction.KeyFunctionCode] ?? "").trim()
          });
        }
      }
    }

    // Stored Procedures
    if (dataDictionaryJson[AcDataDictionary.KeyStoredProcedures]) {
      for (const storedProcedureDetails of Object.values(dataDictionaryJson[AcDataDictionary.KeyStoredProcedures]) as any[]) {
        const storedProcedureName = storedProcedureDetails[AcDDStoredProcedure.KeyStoredProcedureName]?.trim() ?? "";
        if (storedProcedureName) {
          this.dataStorage.addStoredProcedure({
            dataDictionaryId: dataDictionaryId,
            storedProcedureName: storedProcedureName,
            storedProcedureCode: (storedProcedureDetails[AcDDStoredProcedure.KeyStoredProcedureCode] ?? "").trim()
          });
        }
      }
    }

    this.hooks.execute({ hook: AcEnumDDEHook.DataDictionarySet });
  }

  setState(state: IAcDDEState): void {
    this.editorState.apply({ state: state });
  }

}
