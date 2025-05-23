import * as React from 'react';

declare module '@syncfusion/ej2-react-spreadsheet' {
  export class SpreadsheetComponent extends React.Component<any, any> {
    numberFormat(format: string, address: string): void;
    cellFormat(style: any, range: string): void;
  }
  
  export class SheetsDirective extends React.Component<any, any> {}
  export class SheetDirective extends React.Component<any, any> {}
  export class ColumnsDirective extends React.Component<any, any> {}
  export class ColumnDirective extends React.Component<any, any> {}
  export class RangesDirective extends React.Component<any, any> {}
  export class RangeDirective extends React.Component<any, any> {}
  export class RowsDirective extends React.Component<any, any> {}
  export class RowDirective extends React.Component<any, any> {}
  export class CellsDirective extends React.Component<any, any> {}
  export class CellDirective extends React.Component<any, any> {}
  
  export interface CellStyleModel {
    fontWeight?: string;
    textAlign?: string;
    verticalAlign?: string;
  }
} 