import './_app.export';
import './assets/scss/styles.scss';
import './assets/scss/autocode.scss';
import { acBootstrapElements, acRouter } from "@autocode-ts/ac-runtime";
import { AggridLocalPage, AggridOnDemandPage, APP_ROUTES } from "./_app.export";

import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AC_DATAGRID_AGGRID_DEFAULT_OPTIONS } from '@autocode-ts/ac-datagrid-on-ag-grid';

ModuleRegistry.registerModules([
  AllCommunityModule,
  AllEnterpriseModule,
  ClientSideRowModelModule,
  ServerSideRowModelModule
]);

 AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['singleClickEdit'] = true;
    // AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['animateRows'] = false;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['enableRangeSelection'] = false;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['enableCharts'] = false;
    // AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['enableFillHandle'] = false;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['rowDragManaged'] = false;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['suppressClipboardPaste'] = true;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['suppressCopyRowsToClipboard'] = true;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['domLayout'] = 'normal';
    // AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['suppressRowVirtualisation'] = true;
    // AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['cacheBlockSize'] = 100;
    // AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['maxBlocksInCache'] = 10;
    // AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['rowBuffer'] = 5;
    AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['paginationPageSize'] = 50;

console.log("🚀 [Main] Starting application initialization...");

window.addEventListener('DOMContentLoaded', async () => {
  console.log("📂 [Main] DOMContentLoaded event fired.");

  // We append the main layout to the app div


  // Bootstrap all AcElements
  console.log("🛠️ [Main] Bootstrapping ac-runtime elements...");
  try {
    await acBootstrapElements();
    acRouter.registerRoutes([
      // { path: '/', element: DashboardPage },
      { path:APP_ROUTES.agGrid.local, element:AggridLocalPage},
      { path:APP_ROUTES.agGrid.onDemand, element:AggridOnDemandPage},
      { path: '**', redirectTo: '/' }
    ]);
    console.log("✅ [Main] Bootstrap completed successfully.");
  } catch (err) {
    console.error("🔥 [Main] Bootstrap failed:", err);
  }
});
