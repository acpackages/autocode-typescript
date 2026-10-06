/* eslint-disable @nx/enforce-module-boundaries */
import { AcElement, AcViewChild } from '@autocode-ts/ac-runtime';
import {
  AcDatabaseDesignerElement,
  registerAcDatabaseDesignerElement,
} from '@autocode-ts/ac-database-designer';
import { IAppMenuItem } from 'src/_app.export';

// Register the custom element (idempotent — safe to call multiple times)
registerAcDatabaseDesignerElement();

@AcElement({
  selector: 'database-designer-page',
  template: `
    <div class="app-page overflow-hidden d-flex flex-column">
      <app-header
        [title]="'Database Designer'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="flex-fill overflow-hidden position-relative">
        <ac-database-designer #designer class="h-100 w-100"></ac-database-designer>
      </div>
    </div>
  `
})
export class DatabaseDesignerPage {
  @AcViewChild('#designer') designer!: AcDatabaseDesignerElement;

  dropdownItems: IAppMenuItem[] = [
    { label: 'Schema Actions', isHeader: true },
    { label: 'Load Sample Schema', callback: () => this._loadSample() },
    { label: 'Separator', isSeparator: true },
    { label: 'Dark Mode', callback: () => this._toggleTheme() },
  ];

  private _theme: 'light' | 'dark' = 'light';

  acOnInit(): void {
    // Wait one tick for the custom element's connectedCallback to finish
    setTimeout(() => this._loadSample(), 0);
  }

  private _toggleTheme(): void {
    this._theme = this._theme === 'light' ? 'dark' : 'light';
    this.designer?.setAttribute('theme', this._theme);
  }

  private _loadSample(): void {
    if (!this.designer) return;

    const sampleDD = {
      name: 'E-Commerce',
      version: 1,
      config: {
        insertTimestampColumnKey: 'created_at',
        updateTimestampColumnKey: 'updated_at',
        deleteTimestampColumnKey: '',
      },
      tables: {
        users: {
          tableName: 'users',
          tableColumns: {
            id:         { columnName: 'id',         columnType: 'AUTO_INCREMENT', columnProperties: { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } },
            email:      { columnName: 'email',       columnType: 'STRING',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true }, SIZE: { propertyName: 'SIZE', propertyValue: 255 } } },
            username:   { columnName: 'username',    columnType: 'STRING',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            created_at: { columnName: 'created_at',  columnType: 'TIMESTAMP',     columnProperties: {} },
          },
          tableProperties: { SINGULAR_NAME: { propertyName: 'SINGULAR_NAME', propertyValue: 'user' } },
        },
        products: {
          tableName: 'products',
          tableColumns: {
            id:          { columnName: 'id',          columnType: 'AUTO_INCREMENT', columnProperties: { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } },
            title:       { columnName: 'title',        columnType: 'STRING',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            price:       { columnName: 'price',        columnType: 'DOUBLE',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            stock:       { columnName: 'stock',        columnType: 'INTEGER',       columnProperties: {} },
            description: { columnName: 'description',  columnType: 'TEXT',          columnProperties: {} },
          },
          tableProperties: {},
        },
        orders: {
          tableName: 'orders',
          tableColumns: {
            id:         { columnName: 'id',         columnType: 'AUTO_INCREMENT', columnProperties: { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } },
            user_id:    { columnName: 'user_id',    columnType: 'INTEGER',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            total:      { columnName: 'total',      columnType: 'DOUBLE',         columnProperties: {} },
            status:     { columnName: 'status',     columnType: 'STRING',         columnProperties: {} },
            created_at: { columnName: 'created_at', columnType: 'TIMESTAMP',      columnProperties: {} },
          },
          tableProperties: {},
        },
        order_items: {
          tableName: 'order_items',
          tableColumns: {
            id:         { columnName: 'id',         columnType: 'AUTO_INCREMENT', columnProperties: { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } },
            order_id:   { columnName: 'order_id',   columnType: 'INTEGER',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            product_id: { columnName: 'product_id', columnType: 'INTEGER',        columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            quantity:   { columnName: 'quantity',   columnType: 'INTEGER',        columnProperties: {} },
            unit_price: { columnName: 'unit_price', columnType: 'DOUBLE',         columnProperties: {} },
          },
          tableProperties: {},
        },
        categories: {
          tableName: 'categories',
          tableColumns: {
            id:        { columnName: 'id',        columnType: 'AUTO_INCREMENT', columnProperties: { PRIMARY_KEY: { propertyName: 'PRIMARY_KEY', propertyValue: true } } },
            name:      { columnName: 'name',      columnType: 'STRING',         columnProperties: { NOT_NULL: { propertyName: 'NOT_NULL', propertyValue: true } } },
            parent_id: { columnName: 'parent_id', columnType: 'INTEGER',        columnProperties: {} },
          },
          tableProperties: {},
        },
      },
      relationships: [
        { sourceTable: 'users',    sourceColumn: 'id', destinationTable: 'orders',      destinationColumn: 'user_id',    cascadeDeleteDestination: true,  cascadeDeleteSource: false },
        { sourceTable: 'orders',   sourceColumn: 'id', destinationTable: 'order_items', destinationColumn: 'order_id',   cascadeDeleteDestination: true,  cascadeDeleteSource: false },
        { sourceTable: 'products', sourceColumn: 'id', destinationTable: 'order_items', destinationColumn: 'product_id', cascadeDeleteDestination: false, cascadeDeleteSource: false },
        { sourceTable: 'categories', sourceColumn: 'id', destinationTable: 'categories', destinationColumn: 'parent_id', cascadeDeleteDestination: false, cascadeDeleteSource: false },
      ],
      views: {}, triggers: {}, storedProcedures: {}, functions: {},
    };

    this.designer.loadFromJson(sampleDD as any);
  }
}
