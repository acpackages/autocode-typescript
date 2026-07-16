import { APP_ROUTES } from "../_shared.export";

export interface IAppNavItem {
  label?: string,
  route?: string,
  icon?: string,
  isActive?: boolean,
  children?: IAppNavItem[]
}

export const SIDEBAR_NAV: IAppNavItem[] = [
  {
    label: 'Dashboard',
    route: APP_ROUTES.dashboard
  },
  {
    label: 'AG Grid',
    children: [
      { label: 'Local Data', route: APP_ROUTES.agGrid.local },
      { label: 'On-Demand Data', route: APP_ROUTES.agGrid.onDemand },
      { label: 'Tree Data', route: APP_ROUTES.agGrid.tree }
    ],
  },
  // {
  //   label: 'Builder',
  //   children: [
  //     { label: 'Visual Builder', route: APP_ROUTES.builder.basic }
  //   ]
  // },
  {
    label: 'Collapse',
    children: [
      { label: 'Accordion', route: APP_ROUTES.collapse.accordion },
      { label: 'Collapse', route: APP_ROUTES.collapse.collapse }
    ],
  },
  {
    label: 'Database (DAO)',
    children: [
      { label: 'SQLite WASM', route: APP_ROUTES.dao.sqlite }
    ]
  },
  {
    label: 'Data Dictionary',
    children: [
      { label: 'Components', route: APP_ROUTES.dataDictionary.components },
      { label: 'Editor', route: APP_ROUTES.dataDictionary.editor }
    ],
  },
  {
    label: 'Datagrid',
    children: [
      { label: 'Local Data', route: APP_ROUTES.datagrid.local },
      { label: 'On-Demand Data', route: APP_ROUTES.datagrid.onDemand },
      { label: 'Tree Data', route: APP_ROUTES.datagrid.tree }
    ],
  },
  {
    label: 'Drag & Drop',
    children: [
      { label: 'Basic', route: APP_ROUTES.draggable.basic },
      { label: 'Sortable', route: APP_ROUTES.draggable.sortable },
      { label: 'Advanced Tools', route: APP_ROUTES.draggable.advanced }
    ],
  },
  {
    label: 'Inputs & Forms',
    children: [
      { label: 'Basic Inputs', route: APP_ROUTES.inputs.basic },
      { label: 'Datetime Picker', route: APP_ROUTES.inputs.datetimePicker },
      { label: 'Elements', route: APP_ROUTES.inputs.elements },
      { label: 'File Preview', route: APP_ROUTES.filePreview },
      { label: 'AcForm', route: APP_ROUTES.inputs.form }
    ],
  },
  {
    label: 'Overlays',
    children: [
      { label: 'Drawer', route: APP_ROUTES.drawer },
      { label: 'Dropdown', route: APP_ROUTES.dropdown },
      { label: 'Message', route: APP_ROUTES.message },
      { label: 'Modal', route: APP_ROUTES.modal.simple },
      { label: 'Popover', route: APP_ROUTES.popover.popover }
    ],
  },
  {
    label: 'Repeater',
    children: [
      { label: 'Offline', route: APP_ROUTES.repeater.local },
      { label: 'On Demand', route: APP_ROUTES.repeater.onDemand }
    ],
  },
  {
    label: 'Reports',
    children: [
      { label: 'Basic Report', route: APP_ROUTES.reports.basic }
    ]
  },
  {
    label: 'Resizable',
    children: [
      { label: 'Panels', route: APP_ROUTES.resizable.panels },
      { label: 'Element', route: APP_ROUTES.resizable.basic }
    ],
  },
  {
    label: 'Scrolling',
    children: [
      { label: 'Scroll Track', route: APP_ROUTES.scrollTrack },
      { label: 'Virtual Scroll', route: APP_ROUTES.scrollable.virtual }
    ]
  },
  {
    label: 'Slides',
    route: APP_ROUTES.slides
  },
  {
    label: 'Tabs',
    children: [
      { label: 'Basic Tabs', route: APP_ROUTES.tabs.basic },
      { label: 'Window Tabs', route: APP_ROUTES.tabs.window }
    ],
  },
  {
    label: 'Template Engine',
    route: APP_ROUTES.templateEngine
  },
  {
    label: 'Utilities',
    children: [
      { label: 'Unified Utils', route: APP_ROUTES.utils.http },
      { label: 'WebSocket Client', route: APP_ROUTES.utils.webSocket }
    ],
  }
];
