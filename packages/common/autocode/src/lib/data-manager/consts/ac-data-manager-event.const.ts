/**
 * AC_DATA_MANAGER_EVENT
 * All values are intentionally lowercase so they arrive pre-normalised
 * at AcEvents.execute() / subscribe() — eliminating a string allocation per call.
 */
export const AC_DATA_MANAGER_EVENT = {
  BeforeDataChange:               'beforedatachange',
  BeforeGetOnDemandData:          'beforegetondemanddata',
  BeforeRowAdd:                   'beforerowadd',
  DataChange:                     'datachange',
  DataFoundForFirstTime:          'datafoundforfirsttime',
  DataRowInstanceCreate:          'datasourceinstancecreate',
  DisplayedRowsChange:            'displayedrowschange',
  FilterGroupChange:              'filtergroupchange',
  GetOnDemandDataSuccessCallback: 'getondemanddatasuccesscallback',
  OnDemandFunctionSet:            'ondemandfunctionset',
  RefreshRows:                    'refreshrows',
  Reset:                          'reset',
  RowAdd:                         'rowadd',
  RowCreate:                      'rowcreate',
  RowDelete:                      'rowdelete',
  RowUpdate:                      'rowupdate',
  RowsBatchAdd:                   'rowsbatchadd',
  RowsBatchUpdate:                'rowsbatchupdate',
  SearchQueryChange:              'searchquerychange',
  SortOrderChange:                'sortorderchange',
  TotalRowsChange:                'totalrowschange',
  Unknown:                        'unknown',
}
