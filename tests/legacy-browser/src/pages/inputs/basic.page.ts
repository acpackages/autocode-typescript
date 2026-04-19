/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @nx/enforce-module-boundaries */
import './../../../../../packages/browser/ac-tiptap-editor-input/src/lib/css/ac-tiptap-editor-simple-editor.css';
import "./../../../../../node_modules/quill/dist/quill.snow.css";
import { AcArrayValuesInputElement, AcDatagridApi, AcDatagridColumnDraggingExtension, AcDatagridColumnsCustomizerExtension, AcDatagridDataExportXlsxExtension, AcDatagridExtensionManager, AcDatagridRowDraggingExtension, AcDatagridRowNumbersExtension, AcDatagridRowSelectionExtension, AcDatagridSelectInputElement, AC_DATAGRID_EXTENSION_NAME, AcEnumInputType, AcForm, AcOptionInputElement, AcPopoutTextareaInputElement, AcSelectInputElement, AcTagsInputElement, AcTextareaInputElement, AcTextInputElement } from "@autocode-ts/ac-browser";
import { PageHeader } from "../../components/page-header/page-header.component";
import { customersData } from './../../../../data/customers-data';
import { ActionsDatagridColumn } from "../../components/actions-datagrid-column/actions-datagrid-column.component";
import { AcDatagridOnAgGridExtension, AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME, AgGridOnAcDatagrid } from "@autocode-ts/ac-datagrid-on-ag-grid";
import { AcDataManager, IAcOnDemandRequestArgs, AcContext } from "@autocode-ts/autocode";
import { acInitTipTapEditor } from "@autocode-ts/ac-tiptap-editor-input";
import { AcQuillEditorInput, acInitQuillEditor } from "@autocode-ts/ac-quill-editor-input";

export class InputBasicPage extends HTMLElement {
  datagridApi!: AcDatagridApi;
  pageHeader: PageHeader = new PageHeader();
  agGridExtension!: AcDatagridOnAgGridExtension;
  columnDraggingExtension!: AcDatagridColumnDraggingExtension;
  columnsCustomizerExtension!: AcDatagridColumnsCustomizerExtension;
  dataExportXlsxExtension!: AcDatagridDataExportXlsxExtension;
  rowDraggingExtension!: AcDatagridRowDraggingExtension;
  rowNumbersExtension!: AcDatagridRowNumbersExtension;
  rowSelectionExtension!: AcDatagridRowSelectionExtension;
  form!: AcForm;
  btnSubmit!: HTMLButtonElement;
  context: AcContext = new AcContext({
    value: {
      full_name: 'Alice Johnson',
      bio: "This is bio of the element",
      personal_email: 'alice.j@example.com',
      user_password: 'Secret123!',
      age: 29,
      favorite_color: '#007bff',
      // customer_id: '97667fd4-fbd2-48ea-a42f-6391505370e7',
      birth_date: '1996-05-12',
      preferred_time: '09:30',
      meeting_datetime: '2025-08-15T14:30',
      preferred_month: '2025-08',
      preferred_week: '2025-W33',
      contact_number: '+91-9876543210',
      portfolio_url: 'https://alicejohnson.dev',
      search_query: 'frontend developer',
      auth_token: 'abc123xyz',
      profile_strength: 85,
      resume_file: '',       // placeholder for file input
      profile_picture: '',   // placeholder for image input
      about_me: 'UI/UX designer with 5+ years of experience.',
      favourite_quote: 'The value of life is not in its duration, but in its donation. You are not important because of how long you live, you are important because of how effective you live..',
      contact_preference: 'Email',
      interested_fruits: ['Apple', 'Mango'],
      preferred_framework: 'Vue.js',
      phone_numbers: [{ "label": "Home", "value": "0123456789" }, { "label": "Mobile", "value": "9876543210" }]
    }, name: 'record'
  });

  async connectedCallback() {
    acInitQuillEditor();
    acInitTipTapEditor();

    this.innerHTML = `<ac-form>
      <div class="container py-4">
        <div class="accordion" id="formAccordion"></div>
        <buton type="submit" class="btn btn-primary my-2">Submit</buton>
      </div>
    </ac-form>`;
    setTimeout(() => {
      console.log("Setting log values")
      this.setExampleValues();
    }, 5000);


    this.pageHeader.addMenuItem({
      label: 'Record',
      children: [
        {
          label: 'Log',
          callback: () => {
            console.log(this.context);
            console.log(JSON.stringify(this.context));

          }
        },
        {
          label: 'Set Value',
          callback: () => this.setExampleValues()
        }
      ]
    });
    this.form = this.querySelector('ac-form') as AcForm;
    this.form.addEventListener('submit', () => {
      console.log(this.form.valuesToJsonObject());
    });
    console.dir(this);
    this.prepend(this.pageHeader.element);
    this.pageHeader.pageTitle = 'All Real-Life Inputs';

    const accordion = this.querySelector('#formAccordion')!;

    const addField = (labelText: string, element: HTMLElement, container: HTMLElement) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'mb-3';
      const label = document.createElement('label');
      label.textContent = labelText;
      label.className = 'form-label';
      wrapper.append(label, element);
      container.appendChild(wrapper);
    };

    const createCard = (title: string, id: string) => {
      const card = document.createElement('div');
      card.className = 'accordion-item';
      card.innerHTML = `
        <div id="collapse-${id}" class="accordion-collapse collapse ${accordion.children.length === 0 ? 'show' : ''}" aria-labelledby="heading-${id}" data-bs-parent="#formAccordion">
          <div class="accordion-body row g-3"></div>
        </div>
      `;
      accordion.appendChild(card);
      return card.querySelector('.accordion-body')! as HTMLElement;
    };

    const allInputsGroup = createCard('Real-Life Inputs', 'real-inputs');
    AcDatagridExtensionManager.register(AgGridOnAcDatagrid);

    const datagridSelectContainer = document.createElement('div');
    datagridSelectContainer.className = 'mb-3';
    datagridSelectContainer.innerHTML = '<label>Linked Customer</label><ac-datagrid-select-input class="form-control"></ac-datagrid-select-input>';
    allInputsGroup.appendChild(datagridSelectContainer);
    const datagridSelectInput: AcDatagridSelectInputElement = datagridSelectContainer.querySelector('ac-datagrid-select-input') as AcDatagridSelectInputElement;
    datagridSelectInput.labelKey = 'first_name';
    datagridSelectInput.valueKey = 'customer_id';
    this.datagridApi = datagridSelectInput.datagrid.datagridApi;
    this.columnDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnDragging }) as AcDatagridColumnDraggingExtension;
    this.columnsCustomizerExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.ColumnsCustomizer }) as AcDatagridColumnsCustomizerExtension;
    this.dataExportXlsxExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.DataExportXlsx }) as AcDatagridDataExportXlsxExtension;
    this.rowNumbersExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowNumbers }) as AcDatagridRowNumbersExtension;
    this.rowSelectionExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection }) as AcDatagridRowSelectionExtension;
    this.rowDraggingExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_EXTENSION_NAME.RowDragging }) as AcDatagridRowDraggingExtension;
    this.agGridExtension = this.datagridApi.enableExtension({ extensionName: AC_DATAGRID_ON_AG_GRID_EXTENSION_NAME }) as AcDatagridOnAgGridExtension;
    // datagridSelectInput.setState();
    setTimeout(() => {
      console.log(datagridSelectInput.getState());
    }, 7500);

    datagridSelectInput.setState({
      state: {
    "datagridState": {
        "columns": [
            {
                "field": "customer_id",
                "width": 200,
                "index": 0
            },
            {
                "field": "first_name",
                "width": 200,
                "index": 1
            },
            {
                "field": "last_name",
                "width": 200,
                "index": 2
            },
            {
                "field": "company",
                "width": 200,
                "index": 3
            },
            {
                "field": "city",
                "width": 200,
                "index": 4
            },
            {
                "field": "country",
                "width": 200,
                "index": 5
            },
            {
                "field": "phone_1",
                "width": 200,
                "index": 6
            },
            {
                "field": "phone_2",
                "width": 200,
                "index": 7
            },
            {
                "field": "email",
                "width": 200,
                "index": 8
            },
            {
                "field": "subscription_date",
                "width": 200,
                "index": 9
            },
            {
                "field": "website",
                "width": 200,
                "index": 10
            }
        ],
        "extensionStates": {
            "agGridOnAcDatagrid": {
                "columnOrder": {
                    "orderedColIds": [
                        "ag-Grid-SelectionColumn",
                        "__internal_ac_datagrid__",
                        "first_name",
                        "customer_id",
                        "last_name",
                        "company",
                        "city",
                        "country",
                        "phone_1",
                        "phone_2",
                        "email",
                        "subscription_date",
                        "website"
                    ]
                },
                "columnPinning": {
                    "leftColIds": [
                        "__internal_ac_datagrid__"
                    ],
                    "rightColIds": []
                },
                "columnSizing": {
                    "columnSizingModel": [
                        {
                            "colId": "ag-Grid-SelectionColumn",
                            "width": 25
                        },
                        {
                            "colId": "__internal_ac_datagrid__",
                            "width": 36
                        },
                        {
                            "colId": "first_name",
                            "width": 200
                        },
                        {
                            "colId": "customer_id",
                            "width": 200
                        },
                        {
                            "colId": "last_name",
                            "width": 200
                        },
                        {
                            "colId": "company",
                            "width": 200
                        },
                        {
                            "colId": "city",
                            "width": 200
                        },
                        {
                            "colId": "country",
                            "width": 200
                        },
                        {
                            "colId": "phone_1",
                            "width": 200
                        },
                        {
                            "colId": "phone_2",
                            "width": 200
                        },
                        {
                            "colId": "email",
                            "width": 200
                        },
                        {
                            "colId": "subscription_date",
                            "width": 200
                        },
                        {
                            "colId": "website",
                            "width": 200
                        }
                    ]
                },
                "columnVisibility": {
                    "hiddenColIds": [
                        "customer_id"
                    ]
                },
                "version": "34.0.1"
            }
        },
        "pagination": {},
        "sortOrder": {}
    },
    "dropdownSize": {
        "height": 300,
        "width": 600
    }
}
    });

    this.setOnDemandData(this.datagridApi);
    this.datagridApi.usePagination = true;
    datagridSelectInput.acContextKey = 'customer_id';
    datagridSelectInput.acContext = this.context;
    datagridSelectInput.addEventListener('change', () => {
      console.log("Datagrid value change");
      console.dir(datagridSelectInput);
    })


    this.columnsCustomizerExtension.showColumnCustomizerPanel = true;

    this.rowNumbersExtension.showRowNumbers = true;

    this.rowSelectionExtension.allowSelection = true;
    this.rowSelectionExtension.allowMultipleSelection = true;
    datagridSelectInput.columnDefinitions = [
      // { field: 'action', title: "", allowSort: false, cellRendererElement: ActionsDatagridColumn, width: 65 },
      { field: 'customer_id', title: "Id" },
      { field: 'first_name', title: "First Name", allowEdit: true },
      { field: 'last_name', title: "Last Name" },
      { field: 'company', title: "Company" },
      { field: 'city', title: "City" },
      { field: 'country', title: "Country" },
      { field: 'phone_1', title: "Phone 1" },
      { field: 'phone_2', title: "Phone 2" },
      { field: 'email', title: "Email" },
      { field: 'subscription_date', title: "Subscription Date" },
      { field: 'website', title: "Website" },
    ];

    datagridSelectInput.data = customersData;


    // const onDemandSelectContainer = document.createElement('div');
    // onDemandSelectContainer.className = 'mb-3';
    // onDemandSelectContainer.innerHTML = '<label>Linked Customer</label><ac-select-input class="form-control" placeholder="Select Customer"></ac-select-input>';
    // // allInputsGroup.appendChild(onDemandSelectContainer);
    // const onDemandSelectInput: AcSelectInputElement = onDemandSelectContainer.querySelector('ac-select-input') as AcSelectInputElement;
    // onDemandSelectInput.labelKey = 'first_name';
    // onDemandSelectInput.valueKey = 'customer_id';
    // onDemandSelectInput.acContextKey = 'customer_id';
    // onDemandSelectInput.acContext = this.context;
    // onDemandSelectInput.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
    //   // console.log("Getting on demand data");
    // };

    // console.dir(onDemandSelectInput);

    const tiptapEditorContainer = document.createElement('div');
    tiptapEditorContainer.style.height = "300px";
    tiptapEditorContainer.className = 'mb-3';
    tiptapEditorContainer.innerHTML = '<label>Bio</label><ac-tiptap-editor-input></ac-tiptap-editor-input>';
    // allInputsGroup.appendChild(tiptapEditorContainer);

    const quillEditorContainer = document.createElement('div');
    quillEditorContainer.style.height = "300px";
    quillEditorContainer.className = 'mb-3';
    quillEditorContainer.innerHTML = '<label>Bio</label><ac-quill-editor-input value="Sample editor content"></ac-quill-editor-input>';
    const quillEditor: AcQuillEditorInput = quillEditorContainer.querySelector('ac-quill-editor-input') as AcQuillEditorInput;
    quillEditor.acContextKey = 'bio';
    quillEditor.acContext = this.context;
    allInputsGroup.appendChild(quillEditorContainer);


    const addInput = (type: AcEnumInputType, label: string, key: string) => {
      const input = new AcTextInputElement();
      input.type = type;
      input.name = key;
      input.acContextKey = key;
      input.acContext = this.context;
      input.className = 'form-control';
      input.setAttribute('required', 'true');
      addField(label, input, allInputsGroup);
    };

    // Realistic mapped inputs
    addInput(AcEnumInputType.Text, 'Full Name', 'full_name');
    addInput(AcEnumInputType.Email, 'Personal Email', 'personal_email');
    addInput(AcEnumInputType.Password, 'Password', 'user_password');
    addInput(AcEnumInputType.Number, 'Age', 'age');

    const arrayValuesLabel = document.createElement('div');
    arrayValuesLabel.className = 'fw-bold mt-3';
    arrayValuesLabel.textContent = 'Phone Numbers';
    allInputsGroup.appendChild(arrayValuesLabel);
    const arrayValuesElement = new AcArrayValuesInputElement();
    arrayValuesElement.innerHTML = `
    <table>
    <thead>
      <tr>
        <th>Label</th>
        <th>Value</th>
        <th></th>
      </tr>
      <tbody ac-array-values-items>
        <tr >
          <td>
            <input class="form-control" ac-array-values-item-input ac-array-value-item-key="label"/>
          </td>
          <td>
              <input class="form-control" ac-array-values-item-input ac-array-value-item-key="value"/>
          </td>
          <td>
              <button type="button" class="btn btn-danger" ac-array-values-item-remove><i class="fa fa-trash"></i></button>
          </td>
        </tr>
      </tbody>
      <tfoot>
      <tr>
      <td colspan="3">
          <button type="button" class="btn btn-danger" ac-array-values-item-add><i class="fa fa-plus"></i> Add New</button>
      </td>
      </tr>
      </tfoot>
    </thead>
    </table>
    `;
    arrayValuesElement.acContext = this.context;
    arrayValuesElement.acContextKey = 'phone_numbers';
    arrayValuesElement.name = 'phone_numbers';
    allInputsGroup.appendChild(arrayValuesElement);

    addInput(AcEnumInputType.Color, 'Favorite Color', 'favorite_color');
    addInput(AcEnumInputType.Date, 'Birth Date', 'birth_date');
    addInput(AcEnumInputType.Time, 'Preferred Time', 'preferred_time');
    addInput(AcEnumInputType.DatetimeLocal, 'Meeting Date & Time', 'meeting_datetime');
    addInput(AcEnumInputType.Month, 'Preferred Month', 'preferred_month');
    addInput(AcEnumInputType.Week, 'Preferred Week', 'preferred_week');
    addInput(AcEnumInputType.Tel, 'Contact Number', 'contact_number');
    addInput(AcEnumInputType.Url, 'Portfolio URL', 'portfolio_url');
    addInput(AcEnumInputType.Search, 'Search Query', 'search_query');
    addInput(AcEnumInputType.Hidden, 'Auth Token', 'auth_token');
    addInput(AcEnumInputType.Range, 'Profile Strength (%)', 'profile_strength');
    addInput(AcEnumInputType.File, 'Resume File', 'resume_file');
    addInput(AcEnumInputType.Image, 'Profile Picture', 'profile_picture');

    // Textarea: About Me
    const textarea = new AcTextareaInputElement();
    textarea.acContextKey = 'about_me';
    textarea.name = 'about_me';
    textarea.acContext = this.context;
    textarea.className = 'form-control';
    addField('About Me', textarea, allInputsGroup);

    const popoutTextArea = new AcPopoutTextareaInputElement();
    popoutTextArea.acContextKey = 'favourite_quote';
    popoutTextArea.acContext = this.context;
    popoutTextArea.className = 'form-control';
    addField('Fav Quote', popoutTextArea, allInputsGroup);

    // // Radio group: Contact Preference
    const radioLabel = document.createElement('div');
    radioLabel.className = 'fw-bold mt-3';
    radioLabel.textContent = 'Preferred Contact Method';
    allInputsGroup.appendChild(radioLabel);

    ['Email', 'Phone', 'In-app'].forEach((method) => {
      const radio = new AcOptionInputElement();
      radio.type = AcEnumInputType.Radio;
      radio.name = 'contact_preference';
      radio.value = method;
      radio.acContextKey = 'contact_preference';
      radio.acContext = this.context;
      radio.className = 'form-check-input';

      const div = document.createElement('div');
      div.className = 'form-check';
      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.textContent = method;
      radio.labelElement = label;

      div.appendChild(radio);
      div.appendChild(label);
      allInputsGroup.appendChild(div);
    });

    // // Checkbox group: Favorite Fruits
    const checkboxLabel = document.createElement('div');
    checkboxLabel.className = 'fw-bold mt-3';
    checkboxLabel.textContent = 'Fruits You Like';
    allInputsGroup.appendChild(checkboxLabel);

    ['Apple', 'Banana', 'Mango', 'Orange'].forEach((fruit) => {
      const checkbox = new AcOptionInputElement();
      checkbox.type = AcEnumInputType.Checkbox;
      checkbox.value = fruit;
      checkbox.acContextKey = 'interested_fruits';
      checkbox.acContext = this.context;
      checkbox.className = 'form-check-input';

      const div = document.createElement('div');
      div.className = 'form-check';
      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.textContent = fruit;
      checkbox.labelElement = div;

      div.appendChild(checkbox);
      div.appendChild(label);
      allInputsGroup.appendChild(div);
    });

    // Select: Preferred Framework
    const select = new AcSelectInputElement();
    select.acContextKey = 'preferred_framework';
    select.name = 'preferred_framework';
    select.acContext = this.context;
    select.options = ['Angular', 'React', 'Vue.js', 'Svelte'];
    select.setAttribute('class', 'form-select');
    select.addOption = true;
    select.addOptionCallback = ({ query, callback }: { query: string, callback: Function }) => {
      alert(`Adding option : ${query}`);
      callback({ label: query, value: query });;
    };
    addField('Preferred Framework', select, allInputsGroup);

    const languageTags = new AcTagsInputElement();
    languageTags.acContextKey = 'languages';
    languageTags.name = 'languages';
    languageTags.acContext = this.context;
    languageTags.tagOptions = ['English', 'Hindi', 'Gujarati', 'Spanish', 'Sanskrit'];
    languageTags.className = 'form-control';
    addField('Languages', languageTags, allInputsGroup);



    // let value:any = {'hello':'world'};
    // value['hello']='new world';
    // value['new-property']='hello world';
    // value = new Proxy(value, {
    //       deleteProperty: (target, prop)=>{
    //         console.log('Proxy value property deleted',target,prop);
    //         return false;
    //       },
    //       set: (target, prop, value) => {
    //         console.log('Proxy value property changes',target,prop,value);
    //         return true;
    //       }
    //     });
    //     value['hello'] = 'hello-modern-world';
    //     value['new-property'] = 'another-property';
    //     value['another-property'] = 'another-property';
    //     delete value['hello'];
    //     value['hello'] = {'hello':'modified',nested:{level1:{level2:'hello'}}};
    //     value.hello.nestes.level1['level2_alternative'] = {};

    // const reactiveProxy = new AcReactiveValueProxy(window);
    // this.context.__events__.subscribeAllEvents({callback:(event:string,params:any)=>{
    //   console.log(event,params);
    // }})
    // console.log(value);
  }

  setExampleValues() {
    console.log("Set contect value");
    Object.assign(this.context, {
      full_name: 'Bob Martin',
      personal_email: 'bob.m@example.com',
      user_password: 'TopSecret456',
      age: 41,
      favorite_color: '#00cc88',
      birth_date: '1983-04-22',
      preferred_time: '11:15',
      meeting_datetime: '2025-09-10T17:00',
      preferred_month: '2025-09',
      preferred_week: '2025-W37',
      contact_number: '+91-9988776655',
      portfolio_url: 'https://bobmartin.dev',
      search_query: 'ux specialist',
      auth_token: 'zxy321lmn',
      profile_strength: 92,
      resume_file: '',
      profile_picture: '',
      about_me: 'Product designer focused on user-centered design.',
      contact_preference: 'Phone',
      interested_fruits: ['Banana', 'Orange'],
      preferred_framework: 'React',
      languages: 'Telgu,English,Hindi,Sanskrit',
      customer_id: 'a680504b-8b54-4b1e-85a1-65d8eeafdcde'
    });
  }

  setLocalData(datagridApi: AcDatagridApi) {
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData) {
        index++;
        data.push({ index: index, ...row })
      }
    }
    datagridApi.data = data;
  }

  setOnDemandData(datagridApi: AcDatagridApi) {
    const onDemandProxyDataManager: AcDataManager = new AcDataManager();
    onDemandProxyDataManager.logger.logMessages = false;
    const data: any[] = [];
    const multiplier = 1;
    let index: number = 0;
    for (let i = 0; i < multiplier; i++) {
      for (const row of customersData) {
        index++;
        data.push({ index: index, ...row })
      }
    }
    onDemandProxyDataManager.data = data;

    datagridApi.dataManager.onDemandFunction = async (args: IAcOnDemandRequestArgs) => {
      if (args.filterGroup) {
        onDemandProxyDataManager.filterGroup = args.filterGroup;
      }
      if (args.sortOrder) {
        onDemandProxyDataManager.sortOrder = args.sortOrder;
      }
      onDemandProxyDataManager.searchQuery = args.searchQuery ?? '';
      onDemandProxyDataManager.processRows();
      const totalCount = onDemandProxyDataManager.totalRows;
      const data = await onDemandProxyDataManager.getData({ startIndex: args.startIndex, rowsCount: args.rowsCount });
      const response = {
        totalCount,
        data
      };
      args.successCallback(response);
    };
    // this.datagridApi.dataManager.getRows({rowsCount:50});
  }
}
