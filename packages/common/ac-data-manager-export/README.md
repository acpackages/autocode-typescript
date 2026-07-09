# `ac-data-manager-export`

A lightweight package for exporting data from `AcDataManager` using **SheetJS Community Edition**.

## Installation

```bash
npm install @autocode-ts/ac-data-manager-export
```

## Supported Export Formats

The package supports the following formats mapped to SheetJS bookTypes:

- `Xlsx` (Default) -> `xlsx`
- `Xlsb` -> `xlsb`
- `Xls` -> `biff8`
- `Csv` -> `csv`
- `Tsv` -> `txt`
- `Ods` -> `ods`
- `Html` -> `html`
- `Xml` -> `xlml`
- `Dif` -> `dif`
- `Slk` -> `slk`
- `Prn` -> `prn`

## Usage

### Basic Usage (Export File)

```typescript
import { AcDataManager } from "@autocode-ts/autocode";
import { AcDataManagerExport, AcDataManagerExportFormat, AcExportDataType } from "@autocode-ts/ac-data-manager-export";

const manager = new AcDataManager();
manager.data = [
    { name: "Apple", price: 100, quantity: 5 },
    { name: "Orange", price: 80, quantity: 8 }
];

AcDataManagerExport.export({
    manager,
    fileName: "Products.xlsx",
    format: AcDataManagerExportFormat.Xlsx,
    sheetName: "Products",
    columns: [
        {
            title: "Product Name",
            field: "name",
            type: AcExportDataType.Text
        },
        {
            title: "Unit Price",
            field: "price",
            type: AcExportDataType.Currency
        }
    ]
});
```

### Workbook Creation

If you need to work with the SheetJS Workbook directly:

```typescript
const workbook = AcDataManagerExport.toWorkbook({
    manager,
    sheetName: "Data Sheet",
    columns: [
        { title: "Product", field: "name" }
    ]
});
```

### Custom Value (valueGetter)

You can compute columns dynamically:

```typescript
AcDataManagerExport.export({
    manager,
    fileName: "Sales.xlsx",
    columns: [
        { title: "Product", field: "name" },
        {
            title: "Total Amount",
            valueGetter: row => row.quantity * row.price,
            type: AcExportDataType.Currency
        }
    ]
});
```

### Formatter Example

Apply custom post-processing to values:

```typescript
AcDataManagerExport.export({
    manager,
    fileName: "Status.xlsx",
    columns: [
        { title: "Product", field: "name" },
        {
            title: "Stock Status",
            field: "quantity",
            formatter: (value, row) => value > 5 ? "In Stock" : "Low Stock"
        }
    ]
});
```
