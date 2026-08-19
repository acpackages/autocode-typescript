import { AcEnumDatagridColumnAggregateFunction } from "../enums/ac-enum-datagrid-column-aggregate-function.enum";

export interface IAcDatagridColumnDefinition {
  /* AcDoc({
    "description": "Set to `true` to have the grid allow sorting on this column."
    "default_value": false
  }) */
  allowFilter?: boolean;
  allowFocus?: boolean;

  /* AcDoc({
    "description": "Set to `true` to have the grid allow sorting on this column."
    "default_value": true
  }) */
  allowSort?: boolean;

  /* AcDoc({
    "description": "Set to `true` to have the grid calculate the height of a row based on contents of this column."
    "default_value": false
  }) */
  autoHeight?: boolean;
  allowResize?:boolean;

  /* AcDoc({
    "description": "Set to `true` to have the grid calculate the width of a column based on contents of this column."
    "default_value": false
  }) */
  autoWidth?: boolean;
  cellClass?:string;

  cellEditorElement?:any;
  cellEditorElementAttrs?:any;
  cellEditorElementParams?:any;
  cellEditorFunction?:any;

  cellInputElement?:any;
  cellInputElementAttrs?:any;
  cellInputFunction?:any;

  cellRendererElement?:any;
  cellRendererElementAttrs?:any;
  cellRendererElementParams?:any;
  cellRendererFunction?:any;

  dataType?: "BOOLEAN"|"CUSTOM"|"DATE"|"DATETIME"|"NUMBER"|"OBJECT"|"STRING"|"UNKNOWN";
  /* AcDoc({
    "description": "The unique ID to give the column. This is optional. If missing, the ID will default to the field.
      If both field and colId are missing, a unique ID will be generated.
      This ID is used to identify the column in the API for sorting, filtering etc."
  }) */
  columnId?: string;

  /* AcDoc({
    "description": "Set to `true` if this column is editable, otherwise `false`. Can also be a function to have different rows editable."
    "default_value": false
  }) */
  allowEdit?: boolean;

  extensionData?:Record<string,any>;

  format?:string;

  /* AcDoc({
    "description": "The field of the row object to get the cell's data from."
  }) */
  field: string,
  flexSize?:number;

  floatingFilterInput?:any;
  floatingFilterInputAttrs?:any;
  floatingFilterInputFunction?:any;
  floatingFilterInputParams?:any;

  headerCellClass?:string;
  index?:number;

  /* AcDoc({
    "description": Maximum width in pixels for the column."
  }) */
  maxWidth?: number;

  /* AcDoc({
    "description": Minimum width in pixels for the column."
  }) */
  minWidth?: number;

  pinnedOn?:'LEFT'|'RIGHT';
  suppressFocus?:boolean;

  /* AcDoc({
    "description": "The title of the column. If not provided, field value will be used"
  }) */
  title?: string;

  /* AcDoc({
    "description": "The field to use for tooltip."
  }) */
  tooltipField?: string;

  useCellEditorForRenderer?:boolean;
  isGroup?:boolean;
  groupAggregateFunction?:AcEnumDatagridColumnAggregateFunction;

  /* AcDoc({
    "description": A function or expression to format a value, should return a string."
  }) */
  valueFormatter?: string | Function;

  /* AcDoc({
    "description": Function or expression. Gets the value from your data for display."
  }) */
  valueGetter?: string | Function;
  visible?:boolean;

  /* AcDoc({
    "description": Initial width in pixels for the column.",
    "default_value": 200
  }) */
  width?: number;
}
