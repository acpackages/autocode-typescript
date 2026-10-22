import { AC_DATA_MANAGER_EVENT } from "./ac-data-manager-event.const";

/**
 * AC_DATA_MANAGER_HOOK
 * Extends AC_DATA_MANAGER_EVENT with hook-specific entries.
 * All values are lowercase (inherited from AC_DATA_MANAGER_EVENT).
 */
export const AC_DATA_MANAGER_HOOK = {
  ...AC_DATA_MANAGER_EVENT,
  AssignUniqueIdToDataChange:       'assignuniqueidtodatachange',
  AssignUniqueParentIdToDataChange: 'assignuniqueparentidtodatachange',
  DataParentUniqueValueKeyChange:   'dataparentuniquvaluekeychange',
  DataUniqueValueKeyChange:         'datauniquvaluekeychange',
  UniqueIdKeyChange:                'uniqueidkeychange',
  UniqueIdParentKeyChange:          'uniqueidparentkeychange',
}
