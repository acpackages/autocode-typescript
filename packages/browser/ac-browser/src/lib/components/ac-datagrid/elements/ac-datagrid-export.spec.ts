/**
 * @jest-environment jsdom
 */
import './ac-datagrid.element';
import { AcDatagridElement } from './ac-datagrid.element';
import { AcBrowser } from '../../../core/ac-browser';
import { AC_DATAGRID_EXTENSION_NAME } from '../consts/ac-datagrid-extension-name.const';

describe('AcDatagrid CSV and XLSX Export', () => {
  let grid: AcDatagridElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    grid = document.createElement('ac-datagrid') as AcDatagridElement;
    document.body.appendChild(grid);
  });

  afterEach(() => {
    grid.remove();
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  const setupTestGrid = () => {
    const api = grid.datagridApi;
    api.columnDefinitions = [
      { field: 'id', title: 'ID' },
      { field: 'name', title: 'Full Name' },
      { field: 'role', title: 'Department Role' },
      { field: 'salary', title: 'Annual Salary', format: '#,##0.00' },
      { field: 'notes', title: 'Notes' }
    ];

    api.data = [
      { id: 1, name: 'Alice, Smith', role: 'Engineering', salary: 120000, notes: 'Lead "Architect"' },
      { id: 2, name: 'Bob Jones', role: 'Design\nUI/UX', salary: 95000, notes: 'Specialist' },
      { id: 3, name: 'Charlie Brown', role: 'Marketing', salary: 85000, notes: 'Senior' }
    ];

    return api;
  };

  describe('CSV Export (getDataAsCsv)', () => {
    it('generates standard CSV with headers and data escaping commas, newlines, and quotes', async () => {
      const api = setupTestGrid();
      const csv = await api.getDataAsCsv({ useBom: false });

      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('ID,Full Name,Department Role,Annual Salary,Notes');
      // Alice has comma in name and quotes in notes
      expect(lines[1]).toBe('1,"Alice, Smith",Engineering,120000,"Lead ""Architect"""');
      // Bob has newline in role
      expect(csv).toContain('"Design\nUI/UX"');
    });

    it('exports all rows from dataManager across pages before generating export', async () => {
      const api = grid.datagridApi;
      api.columnDefinitions = [
        { field: 'id', title: 'ID' },
        { field: 'title', title: 'Title' }
      ];

      // Provide 10 items
      const tenItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, title: `Item ${i + 1}` }));
      api.data = tenItems;

      // Enable pagination with page size 2
      api.usePagination = true;
      if (api.pagination) {
        api.pagination.activePageSize = 2;
      }

      // Despite pagination displaying only page 1, export should fetch all rows from dataManager
      const csv = await api.getDataAsCsv({ useBom: false });
      for (let i = 1; i <= 10; i++) {
        expect(csv).toContain(`Item ${i}`);
      }
    });

    it('supports custom delimiter such as semicolon and tab', async () => {
      const api = setupTestGrid();
      const csvSemicolon = await api.getDataAsCsv({ columnSeparator: ';', useBom: false });
      expect(csvSemicolon).toContain('ID;Full Name;Department Role;Annual Salary;Notes');

      const csvTab = await api.getDataAsCsv({ columnSeparator: '\t', useBom: false });
      expect(csvTab).toContain('ID\tFull Name\tDepartment Role\tAnnual Salary\tNotes');
    });

    it('respects skipColumnHeaders option', async () => {
      const api = setupTestGrid();
      const csv = await api.getDataAsCsv({ skipColumnHeaders: true, useBom: false });
      const lines = csv.split('\r\n');
      expect(lines[0]).not.toContain('Department Role');
      expect(lines[0]).toBe('1,"Alice, Smith",Engineering,120000,"Lead ""Architect"""');
    });

    it('supports columnKeys to filter and reorder exported columns', async () => {
      const api = setupTestGrid();
      const csv = await api.getDataAsCsv({ columnKeys: ['role', 'name'], useBom: false });
      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Department Role,Full Name');
      expect(lines[1]).toBe('Engineering,"Alice, Smith"');
    });

    it('supports allColumns: true to include hidden columns', async () => {
      const api = grid.datagridApi;
      api.columnDefinitions = [
        { field: 'visibleCol', title: 'Visible Col', visible: true },
        { field: 'hiddenCol', title: 'Hidden Col', visible: false }
      ];
      api.data = [{ visibleCol: 'A', hiddenCol: 'B' }];

      const csvDefault = await api.getDataAsCsv({ useBom: false });
      expect(csvDefault).toContain('Visible Col');
      expect(csvDefault).not.toContain('Hidden Col');

      const csvAll = await api.getDataAsCsv({ allColumns: true, useBom: false });
      expect(csvAll).toContain('Visible Col,Hidden Col');
      expect(csvAll).toContain('A,B');
    });

    it('supports shouldRowBeSkipped to dynamically filter rows', async () => {
      const api = setupTestGrid();
      const csv = await api.getDataAsCsv({
        shouldRowBeSkipped: (params) => params.node.data.id === 2,
        useBom: false
      });

      expect(csv).toContain('Alice, Smith');
      expect(csv).not.toContain('Bob Jones');
      expect(csv).toContain('Charlie Brown');
    });

    it('supports processCellCallback and processHeaderCallback', async () => {
      const api = setupTestGrid();
      const csv = await api.getDataAsCsv({
        processHeaderCallback: ({ column }) => `COL_${(column.columnDefinition?.field || column.columnKey).toUpperCase()}`,
        processCellCallback: ({ value, column }) => {
          if ((column.columnDefinition?.field || column.columnKey) === 'salary') {
            return `$${value}`;
          }
          return value;
        },
        useBom: false
      });

      expect(csv).toContain('COL_ID,COL_NAME,COL_ROLE,COL_SALARY,COL_NOTES');
      expect(csv).toContain('$120000');
    });

    it('supports prependContent and appendContent', async () => {
      const api = setupTestGrid();
      const csv = await api.getDataAsCsv({
        prependContent: 'Report Title\nConfidential Data',
        appendContent: [['End of Report', 'Total Records: 3']],
        useBom: false
      });

      const lines = csv.split('\r\n');
      expect(lines[0]).toBe('Report Title');
      expect(lines[1]).toBe('Confidential Data');
      expect(csv).toContain('End of Report,Total Records: 3');
    });

    it('supports onlySelected to export only selected rows', async () => {
      const api = setupTestGrid();
      api.enableExtension({
        extensionName: AC_DATAGRID_EXTENSION_NAME.RowSelection
      });

      // Select row 2
      const targetRow = api.datagridRows[1];
      api.selectRow({ rowId: targetRow.rowId, isSelected: true });

      const csvSelected = await api.getDataAsCsv({ onlySelected: true, useBom: false });
      expect(csvSelected).not.toContain('Alice, Smith');
      expect(csvSelected).toContain('Bob Jones');
      expect(csvSelected).not.toContain('Charlie Brown');
    });
  });

  describe('Excel Export (getDataAsExcel & exportMultipleSheetsAsExcel)', () => {
    it('generates an Excel Blob with appropriate MIME type', async () => {
      const api = setupTestGrid();
      const blob = await api.getDataAsExcel({ sheetName: 'Employees' });
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('calls AcBrowser.downloadFile when exportDataAsCsv is called', async () => {
      const api = setupTestGrid();
      const downloadSpy = jest.spyOn(AcBrowser, 'downloadFile').mockImplementation(() => {});

      await api.exportDataAsCsv({ fileName: 'my-data' });
      expect(downloadSpy).toHaveBeenCalledWith({
        content: expect.any(String),
        filename: 'my-data.csv'
      });
    });

    it('calls AcBrowser.downloadFile when exportDataAsExcel is called', async () => {
      const api = setupTestGrid();
      const downloadSpy = jest.spyOn(AcBrowser, 'downloadFile').mockImplementation(() => {});

      await api.exportDataAsExcel({ fileName: 'report' });
      expect(downloadSpy).toHaveBeenCalledWith({
        content: expect.any(Blob),
        filename: 'report.xlsx'
      });
    });

    it('supports exportMultipleSheetsAsExcel for multi-grid / multi-sheet workbooks', async () => {
      const api1 = setupTestGrid();

      const grid2 = document.createElement('ac-datagrid') as AcDatagridElement;
      document.body.appendChild(grid2);
      const api2 = grid2.datagridApi;
      api2.columnDefinitions = [{ field: 'code', title: 'Code' }];
      api2.data = [{ code: 'X1' }, { code: 'X2' }];

      const downloadSpy = jest.spyOn(AcBrowser, 'downloadFile').mockImplementation(() => {});

      await api1.exportMultipleSheetsAsExcel({
        fileName: 'multi_sheet_report',
        sheets: [
          { sheetName: 'Staff', api: api1 },
          { sheetName: 'Codes', api: api2 }
        ]
      });

      expect(downloadSpy).toHaveBeenCalledWith({
        content: expect.any(Blob),
        filename: 'multi_sheet_report.xlsx'
      });

      grid2.remove();
    });
  });
});
