
import './styles.scss';
import { AcDatagridRowDraggingHtmlPlaceholder, AcDatagridTreeTableHtmlPlaceholder, acInit, AcTabsCssClassName } from '@autocode-ts/ac-browser';
import { AcRouter } from './utils/ac-router';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { AggridLocalData } from './pages/ag-grid/local-data.page';
import { DatagridLocalData } from './pages/datagrid/local-data.page';
import { DatagridLocalDataTree } from './pages/datagrid/local-data-tree.page';
import { DraggableAxisLockPage } from './pages/draggable/axis-lock';
import { DraggableBasicPage } from './pages/draggable/basic';
import { DraggableCloneRevertPage } from './pages/draggable/clone-revert';
import { DraggableGroupedTestPage } from './pages/draggable/groupped';
import { DraggableSnapGridPage } from './pages/draggable/snap-grid';
import { DraggableSortablePage } from './pages/draggable/sortable';
import { InputBasicPage } from './pages/inputs/basic.page';
import { TemplateEnginePage } from './pages/template-engine/template-engine.page';
import { AggridLocalDataTree } from './pages/ag-grid/local-data-tree.page';
import { CollapseTestPage } from './pages/collapse/collapse-all-tests.page';
import { AggridOnDemandData } from './pages/ag-grid/on-demand-data.page';
import { ResizableTestPage } from './pages/resizable/resizable-test-page.page';
import { ResizablePanelsTestPage } from './pages/resizable/resizable-panels-test-page.page';
import { DrawerTestPage } from './pages/drawer/drawer-test-page.page';
import { DropdownTestPage } from './pages/dropdown/dropdown-test-page.page';
import { MessageTestPage } from './pages/message/message-test-page.page';
import { ModalTestPage } from './pages/modal/modal-test-page.page';
import { AnimatedModalTestPage } from './pages/modal/animated-modal-test-page.page';
import { PopoverTestPage } from './pages/popover/popover-test-page.page';
import { BasicScrollTrackTestPage } from './pages/scroll-track/basic-scroll-track-test.page';
import { SlidesBasicTestPage } from './pages/slides/slides-basic-test.page';
import { VirtualTestScrollPage } from './pages/scrollable/virtual-test-scroll.page';
import { VirtualScrollDirectDomTestPage } from './pages/scrollable/virtual-scroll-direct-dom-test.page';
import { SQLiteDaoTestPage } from './pages/dao/sqlite-dao-test-page.page';
import { AcSqliteDao } from '@autocode-ts/ac-sqlite-dao-browser';
import { AccordionTestPage } from './pages/collapse/accordion-test-page.page';
import { BasicBuilderPage } from './pages/builder/basic-builder.page';
import { TabsTestPage } from './pages/tabs/tabs-test-page.pages';
import { TooltipTestPage } from './pages/popover/tooltip-test-page.page';
import { DDEEditorDatagridPage } from './pages/data-dictionary/data-dictionary-editor.page';
import { DataDictionaryComponentsPage } from './pages/data-dictionary/data-dictionary-components.page';
import { InputElementsPage } from './pages/inputs/elements.page';
import { WindowTabsPage } from './pages/tabs/window-tabs.page';
import { RuntimeComponentPage } from './pages/builder/runtime-component-page';
import { HttpTestPage } from './pages/utils/http-test';
import { AppBrowserTestPage } from './pages/utils/app-browser-tests';
import { AcFormTest } from './pages/inputs/form-test.page';
import { AcStorageTestPage } from './pages/utils/ac-storage-tests';
import { AcDataManagerTestPage } from './pages/utils/ac-data-maganer.tests';
import { FilePreviewTestPage } from './pages/inputs/file-preview-tests.page';
import { AcDataCacheTestPage } from './pages/utils/ac-data-cache.tests';
import { BasicReportPage } from './pages/reports/basic-report';
import { initAgGrid } from '@autocode-ts/ac-datagrid-on-ag-grid';
import { WebSocketTestPage } from './pages/web-socket/web-socket.page';
import { DataBridgeUIPage } from './pages/data-bridge/data-bridge-ui.page';
import { RepeaterOfflinePage } from './pages/repeater/repeater-offline.page';
import { RepeaterOnDemandPage } from './pages/repeater/repeater-on-demand.page';


// AcPaginationHtmlPlaceholder.first = `<i class="fa-solid fa-angles-left"></i>`;
// AcPaginationHtmlPlaceholder.previous = `<i class="fa-solid fa-angle-left"></i>`;
// AcPaginationHtmlPlaceholder.next = `<i class="fa-solid fa-angle-right"></i>`;
// AcPaginationHtmlPlaceholder.last = `<i class="fa-solid fa-angles-right"></i>`;

// AcDatagridHtmlPlaceholder.appliedFilter = `<i class="fa-solid fa-filter"></i>`;
// AcDatagridHtmlPlaceholder.filter = `<i class="fa-solid fa-align-center" style='transform: rotate(179deg);'></i>`;
// AcDatagridHtmlPlaceholder.sort = `<i class="fa-solid fa-sort"></i>`;
// AcDatagridHtmlPlaceholder.resize = `&nbsp;`;
// AcDatagridHtmlPlaceholder.sortAscending = `<i class="fa-solid fa-arrow-down-short-wide"></i>`;
// AcDatagridHtmlPlaceholder.sortDescending = `<i class="fa-solid fa-arrow-down-wide-short"></i>`;

AcDatagridRowDraggingHtmlPlaceholder.drag = `<i class="fa-solid fa-grip-lines"></i>`;

AcDatagridTreeTableHtmlPlaceholder.treeClosed = `<i class="fa-solid fa-plus"></i>`;
AcDatagridTreeTableHtmlPlaceholder.treeOpen = `<i class="fa-solid fa-minus"></i>`;

AcTabsCssClassName.acTabActive += ' active';
AcTabsCssClassName.acTabPane += ' ';
AcTabsCssClassName.acTabPane += ' show active';

AcSqliteDao.wasmUrl = './assets/vendor/sql.js/sql-wasm.wasm';

initAgGrid();
acInit();

window.addEventListener('DOMContentLoaded', () => {
  AcRouter.registerRoute({ label: 'Dashboard', path: '/', componentTag: 'dashboard-page', component: DashboardPage });
  AcRouter.registerRouteGroup({
    label: 'AGGrid',
    routes: [
      { label: 'Local Data', path: '/aggrid/local-data', componentTag: 'aggrid-local-data', component: AggridLocalData },
      { label: 'Local Data Tree', path: '/aggrid/local-data-tree', componentTag: 'aggrid-local-data-tree', component: AggridLocalDataTree },
      { label: 'On-Demand Data', path: '/aggrid/on-demand-data', componentTag: 'on-demand-data', component: AggridOnDemandData },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Builder',
    routes: [
      { label: 'Basic', path: '/builder-basic', componentTag: 'builder-basic', component: BasicBuilderPage },
      { label: 'Runtime Component', path: '/runtime-component', componentTag: 'runtime-component', component: RuntimeComponentPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Collapse & Accordion',
    routes: [
      { label: 'Collapse', path: '/collapse/collapse', componentTag: 'collapse-test', component: CollapseTestPage },
      { label: 'Accordion', path: '/collapse/accordion', componentTag: 'accordion-test', component: AccordionTestPage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Dao',
    routes: [
      { label: 'Slite', path: '/dao/sqlite', componentTag: 'dao-sqlite', component: SQLiteDaoTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Data Bridge',
    routes: [
      { label: 'UI', path: '/data-bridge-ui', componentTag: 'data-bridge-ui', component: DataBridgeUIPage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Data Dictionary',
    routes: [
      { label: 'Components', path: '/data-dictionary/components', componentTag: 'data-dictionary-components', component: DataDictionaryComponentsPage },
      { label: 'Editor', path: '/data-dictionary/editor', componentTag: 'data-dictionary-editor', component: DDEEditorDatagridPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Datagrid',
    routes: [
      { label: 'Local Data', path: '/datagrid/local-data', componentTag: 'datagrid-local-data', component: DatagridLocalData },
      { label: 'Local Data Tree', path: '/datagrid/local-data-tree', componentTag: 'datagrid-local-data-tree', component: DatagridLocalDataTree },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Drag/Drop',
    routes: [
      { label: 'Axis Lock', path: '/draggable/axis-lock', componentTag: 'draggable-axis-lock', component: DraggableAxisLockPage },
      { label: 'Basic', path: '/draggable/basic', componentTag: 'draggable-basic', component: DraggableBasicPage },
      { label: 'Clone/Revert', path: '/draggable/clone-revert', componentTag: 'draggable-clone-revert', component: DraggableCloneRevertPage },
      { label: 'Grouped', path: '/draggable/grouped', componentTag: 'draggable-grouped', component: DraggableGroupedTestPage },
      { label: 'Snap Grid', path: '/draggable/snap-grid', componentTag: 'draggable-snap-grid', component: DraggableSnapGridPage },
      { label: 'Sortable', path: '/draggable/sortable', componentTag: 'draggable-sortable', component: DraggableSortablePage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Drawer',
    routes: [
      { label: 'All Directions', path: '/drawer/all-directions', componentTag: 'drawer-all-directions', component: DrawerTestPage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Dropdown',
    routes: [
      { label: 'Basic', path: '/dropdown/basic', componentTag: 'dropdown-basic', component: DropdownTestPage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Inputs',
    routes: [
      { label: 'Basic', path: '/inputs/basic', componentTag: 'inputs-basic', component: InputBasicPage },
      { label: 'Elements', path: '/inputs/elements', componentTag: 'input-elements', component: InputElementsPage },
      { label: 'Form', path: '/inputs/form', componentTag: 'form-test', component: AcFormTest },
      { label: 'File Preview', path: '/inputs/file-preview', componentTag: 'file-preview-test', component: FilePreviewTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Message',
    routes: [
      { label: 'All', path: '/message/all', componentTag: 'message-all', component: MessageTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Modal',
    routes: [
      { label: 'Basic', path: '/modal/basic', componentTag: 'modal-basic', component: ModalTestPage },
      { label: 'Animated', path: '/modal/animated', componentTag: 'modal-animated', component: AnimatedModalTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Popover',
    routes: [
      { label: 'Popover', path: '/popover/popover', componentTag: 'popover-test', component: PopoverTestPage },
      { label: 'Tooltip', path: '/popover/tooltip', componentTag: 'tooltip-test', component: TooltipTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Repeater',
    routes: [
      { label: 'Offline', path: '/repeater/offline', componentTag: 'repeater-offline-page', component: RepeaterOfflinePage },
      { label: 'On Demand', path: '/repeater/on-demand', componentTag: 'repeater-on-demand-page', component: RepeaterOnDemandPage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Resizable',
    routes: [
      { label: 'Basic', path: '/resizable/basic', componentTag: 'resizable-basic', component: ResizableTestPage },
      { label: 'Resizable Panels', path: '/resizable/panels', componentTag: 'resizable-panels', component: ResizablePanelsTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Reports',
    routes: [
      { label: 'Basic', path: '/reports/basic', componentTag: 'reports-basic', component: BasicReportPage },
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Scroll Track',
    routes: [
      { label: 'Basic', path: '/scroll-track/basic', componentTag: 'scroll-track-basic', component: BasicScrollTrackTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Scrollable',
    routes: [
      { label: 'Virtual Using API', path: '/scrollable/virtual-api', componentTag: 'virtual-scroll-api', component: VirtualTestScrollPage },
      { label: 'Virtual through DOM', path: '/scrollable/virtual-dom', componentTag: 'virtual-scroll-dom', component: VirtualScrollDirectDomTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Slides',
    routes: [
      { label: 'Basic', path: '/slides/basic', componentTag: 'slides-basic', component: SlidesBasicTestPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Tabs',
    routes: [
      { label: 'Basic', path: '/tabs/basic', componentTag: 'tabs-basic', component: TabsTestPage },
      { label: 'Windows', path: '/tabs/windows', componentTag: 'tabs-windows', component: WindowTabsPage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Template Engine',
    routes: [
      { label: 'Basic', path: '/template-engine', componentTag: 'template-engine', component: TemplateEnginePage }
    ]
  });
  AcRouter.registerRouteGroup({
    label: 'Utils',
    routes: [
      { label: 'App Browser', path: '/utils/app-browser', componentTag: 'app-browser-test', component: AppBrowserTestPage },
      { label: 'HTTP', path: '/utils/http', componentTag: 'http-test', component: HttpTestPage },
      { label: 'Data Cache', path: '/utils/data-cache', componentTag: 'data-cache', component: AcDataCacheTestPage },
      { label: 'Data Manager', path: '/utils/data-manager', componentTag: 'data-manager', component: AcDataManagerTestPage },
      { label: 'Storage', path: '/utils/ac-storage', componentTag: 'ac-storage-test', component: AcStorageTestPage },
      { label: 'WebSocket', path: '/utils/web-socket', componentTag: 'web-socket-test', component: WebSocketTestPage }
    ]
  });
  window.addEventListener('popstate', () => AcRouter.loadRoute(location.pathname));
  AcRouter.loadRoute(location.pathname);
});
