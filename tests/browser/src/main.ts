import './_app.export';
import './assets/scss/styles.scss';
import './assets/scss/autocode.scss';
import { acBootstrapElements, acRouter } from "@autocode-ts/ac-runtime";
import {
  AccordionPage,
  AggridLocalPage,
  AggridOnDemandPage,
  AggridTreePage,
  CollapsePage,
  DashboardPage,
  DaoSqlitePage,
  DataDictionaryComponentsPage,
  DataDictionaryEditorPage,
  DatagridLocalPage,
  DraggableAdvancedPage,
  DraggableBasicPage,
  DrawerPage,
  DropdownPage,
  FilePreviewPage,
  InputsPage,
  MessagePage,
  ModalPage,
  PopoverPage,
  RepeaterOfflinePage,
  RepeaterOnDemandPage,
  ReportsBasicPage,
  ResizablePage,
  ScrollTrackPage,
  ScrollablePage,
  SlidesPage,
  SortablePage,
  TabsPage,
  TabsWindowPage,
  TemplateEnginePage,
  UtilsPage,
  WebSocketPage,
  APP_ROUTES
} from "./_app.export";

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
      { path: '/', redirectTo: APP_ROUTES.dashboard },
      { path: APP_ROUTES.dashboard, element: DashboardPage },
      { path: APP_ROUTES.agGrid.local, element: AggridLocalPage },
      { path: APP_ROUTES.agGrid.onDemand, element: AggridOnDemandPage },
      { path: APP_ROUTES.agGrid.tree, element: AggridTreePage },
      // { path: APP_ROUTES.builder.basic, element: BuilderBasicPage },
      { path: APP_ROUTES.collapse.accordion, element: AccordionPage },
      { path: APP_ROUTES.collapse.collapse, element: CollapsePage },
      { path: APP_ROUTES.dao.sqlite, element: DaoSqlitePage },
      { path: APP_ROUTES.dataDictionary.components, element: DataDictionaryComponentsPage },
      { path: APP_ROUTES.dataDictionary.editor, element: DataDictionaryEditorPage },
      { path: APP_ROUTES.datagrid.local, element: DatagridLocalPage },
      { path: APP_ROUTES.draggable.advanced, element: DraggableAdvancedPage },
      { path: APP_ROUTES.draggable.basic, element: DraggableBasicPage },
      { path: APP_ROUTES.draggable.sortable, element: SortablePage },
      { path: APP_ROUTES.drawer, element: DrawerPage },
      { path: APP_ROUTES.dropdown, element: DropdownPage },
      { path: APP_ROUTES.filePreview, element: FilePreviewPage },
      { path: APP_ROUTES.inputs.basic, element: InputsPage },
      { path: APP_ROUTES.message, element: MessagePage },
      { path: APP_ROUTES.modal.simple, element: ModalPage },
      { path: APP_ROUTES.popover.popover, element: PopoverPage },
      { path: APP_ROUTES.repeater.local, element: RepeaterOfflinePage },
      { path: APP_ROUTES.repeater.onDemand, element: RepeaterOnDemandPage },
      { path: APP_ROUTES.reports.basic, element: ReportsBasicPage },
      { path: APP_ROUTES.resizable.basic, element: ResizablePage },
      { path: APP_ROUTES.scrollTrack, element: ScrollTrackPage },
      { path: APP_ROUTES.scrollable.virtual, element: ScrollablePage },
      { path: APP_ROUTES.slides, element: SlidesPage },
      { path: APP_ROUTES.tabs.basic, element: TabsPage },
      { path: APP_ROUTES.tabs.window, element: TabsWindowPage },
      { path: APP_ROUTES.templateEngine, element: TemplateEnginePage },
      { path: APP_ROUTES.utils.http, element: UtilsPage },
      { path: APP_ROUTES.utils.webSocket, element: WebSocketPage },

      { path: '**', redirectTo: APP_ROUTES.dashboard }
    ]);
    console.log("✅ [Main] Bootstrap completed successfully.");
  } catch (err) {
    console.error("🔥 [Main] Bootstrap failed:", err);
  }
});
