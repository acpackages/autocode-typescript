import { APP_ROUTES } from "../_shared.export";



export interface IAppNavItem{
  label?:string,
  route?:string,
  icon?:string,
  isActive?:boolean,
  children?:IAppNavItem[]
}

export const SIDEBAR_NAV: IAppNavItem[] = [
  {
    label: 'Dashboard',
    route: APP_ROUTES.dashboard
  },
  {
    label: 'AG Grid',
    children: [
      {
        label:'Local Data',
        route:APP_ROUTES.agGrid.local
      },
      {
        label:'On-Demand Data',
        route:APP_ROUTES.agGrid.onDemand
      },
      {
        label:'Tree Data',
        route:APP_ROUTES.agGrid.tree
      }
    ],
  },
  {
    label: 'Collapse',
    children: [
      {
        label:'Accordion',
        route:APP_ROUTES.collapse.accordion
      },
      {
        label:'Collapse',
        route:APP_ROUTES.collapse.collapse
      }
    ],
  },
  {
    label: 'Data Bridge',
    route: APP_ROUTES.dataBridge
  },
  {
    label: 'Data Dictionary',
    children: [
      {
        label:'Components',
        route:APP_ROUTES.dataDictionary.components
      },
      {
        label:'Editor',
        route:APP_ROUTES.dataDictionary.editor
      }
    ],
  },
  {
    label: 'Datagrid',
    children: [
      {
        label:'Local Data',
        route:APP_ROUTES.datagrid.local
      },
      {
        label:'On-Demand Data',
        route:APP_ROUTES.datagrid.onDemand
      },
      {
        label:'Tree Data',
        route:APP_ROUTES.datagrid.tree
      }
    ],
  },
  {
    label: 'Inputs',
    children: [
      {
        label:'Basic',
        route:APP_ROUTES.inputs.basic
      },
      {
        label:'Elements',
        route:APP_ROUTES.inputs.elements
      },
      {
        label:'File Preview',
        route:APP_ROUTES.inputs.filePreview
      },
      {
        label:'Form',
        route:APP_ROUTES.inputs.form
      },
    ],
  },
  {
    label: 'Message',
    route: APP_ROUTES.message
  },
  {
    label: 'Modal',
    children: [
      {
        label:'Simple',
        route:APP_ROUTES.modal.simple
      },
      {
        label:'Animated',
        route:APP_ROUTES.modal.animated
      }
    ],
  },
  {
    label: 'Popover',
    children: [
      {
        label:'Popover',
        route:APP_ROUTES.popover.popover
      },
      {
        label:'Tooltip',
        route:APP_ROUTES.popover.tooltip
      }
    ],
  },
  {
    label: 'Repeater',
    children: [
      {
        label:'Offline',
        route:APP_ROUTES.repeater.offline
      },
      {
        label:'On Demand',
        route:APP_ROUTES.repeater.onDemand
      }
    ],
  },
  {
    label: 'Reports',
    route:APP_ROUTES.reports
  },
  {
    label: 'Resizable',
    children: [
      {
        label:'Panels',
        route:APP_ROUTES.resizable.panels
      },
      {
        label:'Element',
        route:APP_ROUTES.resizable.basic
      }
    ],
  },
  {
    label: 'Tabs',
    children: [
      {
        label:'Tabs',
        route:APP_ROUTES.tabs.basic
      },
      {
        label:'Window',
        route:APP_ROUTES.tabs.window
      }
    ],
  },
  {
    label: 'Utils',
    children: [
      {
        label:'App Browser',
        route:APP_ROUTES.utils.appBrowser
      },
      {
        label:'Data Cache',
        route:APP_ROUTES.utils.dataCache
      },
      {
        label:'Data Manager',
        route:APP_ROUTES.utils.dataManager
      },
      {
        label:'Local Storage',
        route:APP_ROUTES.utils.storage
      },
      {
        label:'HTTP',
        route:APP_ROUTES.utils.http
      }
    ],
  },
  {
    label: 'Web Socket',
    children: [
      {
        label:'Client',
        route:APP_ROUTES.webSocket.client
      }
    ],
  },
];
