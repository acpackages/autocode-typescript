/* eslint-disable @nx/enforce-module-boundaries */
import "./assets/scss/styles.scss";
import "./assets/scss/autocode.scss";
import "@autocode-ts/ac-browser/src/lib/components/ac-datagrid/css/ac-datagrid.css";
import "@autocode-ts/ac-browser/src/lib/components/ac-pagination/css/ac-pagination.css";

// Automatically import and register all components and pages from cache
const pages = import.meta.glob('./*pages*.ts', { eager: true });
const layouts = import.meta.glob('./*layout*.ts', { eager: true });
const elements = import.meta.glob('./*elements*.ts', { eager: true });
const shared = import.meta.glob('./*shared*.ts', { eager: true });
const allCompiled = import.meta.glob('./*.ts', { eager: true });

console.log('🚀 [Main] Compiled components loaded:', allCompiled);
console.log('🚀 [Main] Total components:', Object.keys(allCompiled).length);

import { provideRouter } from "@autocode-ts/ac-runtime-router";
import { APP_ROUTES } from "./shared/consts/app-routes.consts";
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AC_DATAGRID_AGGRID_DEFAULT_OPTIONS, initAgGrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDatagridExtensionManager, acInit } from "@autocode-ts/ac-browser";
import { AgGridOnAcDatagrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDataDictionary } from "@autocode-ts/ac-data-dictionary";
import { dataDictionaryJson as actDataDictionary } from "../../data/accountea-pro";

ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
    ClientSideRowModelModule,
    ServerSideRowModelModule
]);

AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['singleClickEdit'] = true;
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['enableRangeSelection'] = false;
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['enableCharts'] = false;
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['rowDragManaged'] = false;
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['suppressClipboardPaste'] = true;
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['suppressCopyRowsToClipboard'] = true;
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['domLayout'] = 'normal';
AC_DATAGRID_AGGRID_DEFAULT_OPTIONS['paginationPageSize'] = 50;

acInit();
initAgGrid();
AcDataDictionary.registerDataDictionary({ jsonData: actDataDictionary });
AcDatagridExtensionManager.register(AgGridOnAcDatagrid);

console.log("🚀 [Main] Starting application initialization...");

window.addEventListener('DOMContentLoaded', async () => {
    console.log("📂 [Main] DOMContentLoaded event fired.");

    // Initialize Router
    provideRouter([
        { path: '/', component: 'dashboard-page' },
        { path: APP_ROUTES.dashboard, component: 'dashboard-page' },
        { path: APP_ROUTES.agGrid.local, component: 'aggrid-local-page' },
        { path: APP_ROUTES.agGrid.onDemand, component: 'aggrid-on-demand-page' },
        { path: APP_ROUTES.agGrid.tree, component: 'ag-grid-tree-page' },
        { path: APP_ROUTES.collapse.accordion, component: 'accordion-page' },
        { path: APP_ROUTES.collapse.collapse, component: 'collapse-page' },
        { path: APP_ROUTES.dao.sqlite, component: 'dao-sqlite-page' },
        { path: APP_ROUTES.dataDictionary.components, component: 'data-dictionary-components-page' },
        { path: APP_ROUTES.dataDictionary.editor, component: 'data-dictionary-editor-page' },
        { path: APP_ROUTES.datagrid.local, component: 'datagrid-local-page' },
        { path: APP_ROUTES.draggable.advanced, component: 'draggable-advanced-page' },
        { path: APP_ROUTES.draggable.basic, component: 'draggable-basic-page' },
        { path: APP_ROUTES.draggable.sortable, component: 'sortable-page' },
        { path: APP_ROUTES.drawer, component: 'drawer-page' },
        { path: APP_ROUTES.dropdown, component: 'dropdown-page' },
        { path: APP_ROUTES.filePreview, component: 'file-preview-page' },
        { path: APP_ROUTES.inputs.basic, component: 'inputs-page' },
        { path: APP_ROUTES.message, component: 'message-page' },
        { path: APP_ROUTES.modal.simple, component: 'modal-page' },
        { path: APP_ROUTES.popover.popover, component: 'popover-page' },
        { path: APP_ROUTES.repeater.local, component: 'repeater-offline-page' },
        { path: APP_ROUTES.repeater.onDemand, component: 'repeater-on-demand-page' },
        { path: APP_ROUTES.reports.basic, component: 'reports-basic-page' },
        { path: APP_ROUTES.resizable.basic, component: 'resizable-page' },
        { path: APP_ROUTES.scrollTrack, component: 'scroll-track-page' },
        { path: APP_ROUTES.scrollable.virtual, component: 'scrollable-page' },
        { path: APP_ROUTES.slides, component: 'slides-page' },
        { path: APP_ROUTES.tabs.basic, component: 'tabs-page' },
        { path: APP_ROUTES.tabs.window, component: 'tabs-window-page' },
        { path: APP_ROUTES.templateEngine, component: 'template-engine-page' },
        { path: APP_ROUTES.utils.http, component: 'utils-page' },
        { path: APP_ROUTES.utils.webSocket, component: 'web-socket-page' },
        { path: '*', component: 'dashboard-page' }
    ]);

    // Set up the main layout
    const appRoot = document.getElementById('app');
    if (appRoot) {
        appRoot.innerHTML = '<app-layout></app-layout>';
    }

    console.log("✅ [Main] Bootstrap completed successfully.");
});