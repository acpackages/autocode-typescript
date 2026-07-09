/* eslint-disable @nx/enforce-module-boundaries */
import "./assets/scss/styles.scss";
import "./assets/scss/autocode.scss";
// import "@autocode-ts/ac-browser/src/lib/components/ac-datagrid/css/ac-datagrid.css";
// import "@autocode-ts/ac-browser/src/lib/components/ac-pagination/css/ac-pagination.css";

// Automatically import and register all components and pages from cache
// const pages = import.meta.glob('./*pages*.ts', { eager: true });
// const layouts = import.meta.glob('./*layout*.ts', { eager: true });
// const elements = import.meta.glob('./*elements*.ts', { eager: true });
// const shared = import.meta.glob('./*shared*.ts', { eager: true });
// const allCompiled = import.meta.glob('./*.ts', { eager: true });

// console.log('🚀 [Main] Compiled components loaded:', allCompiled);
// console.log('🚀 [Main] Total components:', Object.keys(allCompiled).length);

import { APP_ROUTES } from "./shared/consts/app-routes.consts";
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { AC_DATAGRID_AGGRID_DEFAULT_OPTIONS, initAgGrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDatagridExtensionManager, acInit } from "@autocode-ts/ac-browser";
import { AgGridOnAcDatagrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDataDictionary } from "@autocode-ts/ac-data-dictionary";
import { dataDictionaryJson as actDataDictionary } from './data/accountea-pro';
import './_app.export';
import { IAcRoute,acRouter } from "@autocode-ts/ac-runtime-router";

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
    const routes: IAcRoute[] = [
        { path: '*', redirectTo:APP_ROUTES.dashboard},
        { path: APP_ROUTES.dashboard, element:{selector: 'dashboard-page' }},
        { path: APP_ROUTES.agGrid.local, element:{selector: 'aggrid-local-page' }},
        { path: APP_ROUTES.agGrid.onDemand, element:{selector: 'aggrid-on-demand-page' }},
        { path: APP_ROUTES.agGrid.tree, element:{selector: 'ag-grid-tree-page' }},
        { path: APP_ROUTES.collapse.accordion, element:{selector: 'accordion-page' }},
        { path: APP_ROUTES.collapse.collapse, element:{selector: 'collapse-page' }},
        { path: APP_ROUTES.dao.sqlite, element:{selector: 'dao-sqlite-page' }},
        { path: APP_ROUTES.dataDictionary.components, element:{selector: 'data-dictionary-components-page' }},
        { path: APP_ROUTES.dataDictionary.editor, element:{selector: 'data-dictionary-editor-page' }},
        { path: APP_ROUTES.datagrid.local, element:{selector: 'datagrid-local-page' }},
        { path: APP_ROUTES.draggable.advanced, element:{selector: 'draggable-advanced-page' }},
        { path: APP_ROUTES.draggable.basic, element:{selector: 'draggable-basic-page' }},
        { path: APP_ROUTES.draggable.sortable, element:{selector: 'sortable-page' }},
        { path: APP_ROUTES.drawer, element:{selector: 'drawer-page' }},
        { path: APP_ROUTES.dropdown, element:{selector: 'dropdown-page' }},
        { path: APP_ROUTES.filePreview, element:{selector: 'file-preview-page' }},
        { path: APP_ROUTES.inputs.basic, element:{selector: 'inputs-page' }},
        { path: APP_ROUTES.message, element:{selector: 'message-page' }},
        { path: APP_ROUTES.modal.simple, element:{selector: 'modal-page' }},
        { path: APP_ROUTES.popover.popover, element:{selector: 'popover-page' }},
        { path: APP_ROUTES.repeater.local, element:{selector: 'repeater-offline-page' }},
        { path: APP_ROUTES.repeater.onDemand, element:{selector: 'repeater-on-demand-page' }},
        { path: APP_ROUTES.reports.basic, element:{selector: 'reports-basic-page' }},
        { path: APP_ROUTES.resizable.basic, element:{selector: 'resizable-page' }},
        { path: APP_ROUTES.scrollTrack, element:{selector: 'scroll-track-page' }},
        { path: APP_ROUTES.scrollable.virtual, element:{selector: 'scrollable-page' }},
        { path: APP_ROUTES.slides, element:{selector: 'slides-page' }},
        { path: APP_ROUTES.tabs.basic, element:{selector: 'tabs-page' }},
        { path: APP_ROUTES.tabs.window, element:{selector: 'tabs-window-page' }},
        { path: APP_ROUTES.templateEngine, element:{selector: 'template-engine-page' }},
        { path: APP_ROUTES.utils.http, element:{selector: 'utils-page' }},
        { path: APP_ROUTES.utils.webSocket, element:{selector: 'web-socket-page' }}
    ];

    console.log(routes);
     acRouter.registerRoutes({routes});
    // Set up the main layout
    const appRoot = document.getElementById('app');
    if (appRoot) {
        appRoot.innerHTML = '<app-layout></app-layout>';
    }

    console.log("✅ [Main] Bootstrap completed successfully.");
});
