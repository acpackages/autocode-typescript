/* eslint-disable @nx/enforce-module-boundaries */
import "./assets/scss/styles.scss";
import "./assets/scss/autocode.scss";

import { APP_ROUTES } from "./shared/consts/app-routes.consts";
import { acInit, acRegisterCustomElement } from "@autocode-ts/ac-browser";
import './_app.export';

import { AcDateTimePickerElement } from '@autocode-ts/ac-datetime-picker';
import { IAcRoute, acRouter } from "@autocode-ts/ac-runtime-router";

acInit();

console.log("🚀 [Main] Starting application initialization...");

window.addEventListener('DOMContentLoaded', async () => {
    console.log("📂 [Main] DOMContentLoaded event fired.");

    // Initialize Router
    const routes: IAcRoute[] = [
        { path: '*', redirectTo: APP_ROUTES.dashboard },
        { path: APP_ROUTES.dashboard, element: { selector: 'dashboard-page' } },
        { path: APP_ROUTES.agGrid.local, element: { selector: 'aggrid-local-page' } },
        { path: APP_ROUTES.agGrid.onDemand, element: { selector: 'aggrid-on-demand-page' } },
        { path: APP_ROUTES.agGrid.tree, element: { selector: 'ag-grid-tree-page' } },
        { path: APP_ROUTES.collapse.accordion, element: { selector: 'accordion-page' } },
        { path: APP_ROUTES.collapse.collapse, element: { selector: 'collapse-page' } },
        { path: APP_ROUTES.dao.sqlite, element: { selector: 'dao-sqlite-page' } },
        { path: APP_ROUTES.dataDictionary.components, element: { selector: 'data-dictionary-components-page' } },
        { path: APP_ROUTES.dataDictionary.editor, element: { selector: 'data-dictionary-editor-page' } },
        { path: APP_ROUTES.nodeflow.designer, element: { selector: 'nodeflow-designer-page' } },
        { path: APP_ROUTES.databaseDesigner, element: { selector: 'database-designer-page' } },
        { path: APP_ROUTES.datagrid.local, element: { selector: 'datagrid-local-page' } },
        { path: APP_ROUTES.datagrid.columnResizing, element: { selector: 'datagrid-column-resizing-page' } },
        { path: APP_ROUTES.datagrid.columnDragging, element: { selector: 'datagrid-column-dragging-page' } },
        { path: APP_ROUTES.datagrid.rowDragging, element: { selector: 'datagrid-row-dragging-page' } },
        { path: APP_ROUTES.datagrid.nestedTreeRows, element: { selector: 'datagrid-nested-tree-rows-page' } },
        { path: APP_ROUTES.datagrid.rowGrouping, element: { selector: 'datagrid-row-grouping-page' } },
        { path: APP_ROUTES.datagrid.aggregates, element: { selector: 'datagrid-aggregates-page' } },
        { path: APP_ROUTES.datagrid.cellEditing, element: { selector: 'datagrid-cell-editing-page' } },
        { path: APP_ROUTES.datagrid.rowEditing, element: { selector: 'datagrid-row-editing-page' } },
        { path: APP_ROUTES.datagrid.rowPinning, element: { selector: 'datagrid-row-pinning-page' } },
        { path: APP_ROUTES.datagrid.columnPinning, element: { selector: 'datagrid-column-pinning-page' } },
        { path: APP_ROUTES.datagrid.masterDetail, element: { selector: 'datagrid-master-detail-page' } },
        { path: APP_ROUTES.datagrid.keyboardNavigation, element: { selector: 'datagrid-keyboard-navigation-page' } },
        { path: APP_ROUTES.datagrid.rowSelection, element: { selector: 'datagrid-row-selection-page' } },
        { path: APP_ROUTES.datagrid.statePersistence, element: { selector: 'datagrid-state-persistence-page' } },
        { path: APP_ROUTES.datagrid.sidePanel, element: { selector: 'datagrid-side-panel-page' } },
        { path: APP_ROUTES.datagrid.kitchenSink, element: { selector: 'datagrid-kitchen-sink-page' } },
        { path: APP_ROUTES.draggable.advanced, element: { selector: 'draggable-advanced-page' } },
        { path: APP_ROUTES.draggable.basic, element: { selector: 'draggable-basic-page' } },
        { path: APP_ROUTES.draggable.sortable, element: { selector: 'sortable-page' } },
        { path: APP_ROUTES.drawer, element: { selector: 'drawer-page' } },
        { path: APP_ROUTES.dropdown, element: { selector: 'dropdown-page' } },
        { path: APP_ROUTES.filePreview, element: { selector: 'file-preview-page' } },
        { path: APP_ROUTES.inputs.basic, element: { selector: 'inputs-page' } },
        { path: APP_ROUTES.inputs.datetimePicker, element: { selector: 'datetime-picker-page' } },
        { path: APP_ROUTES.message, element: { selector: 'message-page' } },
        { path: APP_ROUTES.modal.simple, element: { selector: 'modal-page' } },
        { path: APP_ROUTES.popover.popover, element: { selector: 'popover-page' } },
        { path: APP_ROUTES.repeater.local, element: { selector: 'repeater-offline-page' } },
        { path: APP_ROUTES.repeater.onDemand, element: { selector: 'repeater-on-demand-page' } },
        { path: APP_ROUTES.reports.basic, element: { selector: 'reports-basic-page' } },
        { path: APP_ROUTES.resizable.basic, element: { selector: 'resizable-page' } },
        { path: APP_ROUTES.scrollTrack, element: { selector: 'scroll-track-page' } },
        { path: APP_ROUTES.scrollable.virtual, element: { selector: 'scrollable-page' } },
        { path: APP_ROUTES.slides, element: { selector: 'slides-page' } },
        { path: APP_ROUTES.tabs.basic, element: { selector: 'tabs-page' } },
        { path: APP_ROUTES.tabs.window, element: { selector: 'tabs-window-page' } },
        { path: APP_ROUTES.templateEngine, element: { selector: 'template-engine-page' } },
        { path: APP_ROUTES.utils.http, element: { selector: 'utils-page' } },
        { path: APP_ROUTES.utils.webSocket, element: { selector: 'web-socket-page' } }
    ];

    console.log(routes);
    acRouter.registerRoutes({ routes });
    // Set up the main layout
    const appRoot = document.getElementById('app');
    if (appRoot) {
        appRoot.innerHTML = '<app-layout></app-layout>';
    }
    acRegisterCustomElement({ tag: 'ac-datetime-picker', type: AcDateTimePickerElement });

    console.log("✅ [Main] Bootstrap completed successfully.");
});
