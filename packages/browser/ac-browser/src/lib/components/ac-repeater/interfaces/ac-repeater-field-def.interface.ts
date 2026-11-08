export interface IAcRepeaterFieldDef {
  key: string;
  label: string;
  type?: 'BOOLEAN' | 'CUSTOM' | 'DATE' | 'DATETIME' | 'NUMBER' | 'OBJECT' | 'STRING' | 'UNKNOWN';
  allowSort?: boolean;
  allowFilter?: boolean;
  allowEdit?: boolean;
  fieldEditorElement?: new () => any;
  fieldEditorElementAttrs?: Record<string, any>;
  fieldEditorElementParams?: Record<string, any>;
  fieldEditorFunction?: (args: any) => HTMLElement;
  labelPosition?: 'top' | 'left' | 'hidden';
  placeholder?: string;
}
