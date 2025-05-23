'use client'
import * as React from 'react';
import { SpreadsheetComponent, SheetsDirective, SheetDirective, RangesDirective, 
         RangeDirective, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-spreadsheet';
import '@syncfusion/ej2-react-spreadsheet/styles/material.css';
import Link from 'next/link';

export default function Home() {
  const [csvData, setCsvData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const spreadsheetRef = React.useRef(null);

  React.useEffect(() => {
    fetchCsvData();
  }, []);

  function fetchCsvData() {
    setLoading(true);
    fetch('/test-data.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(csvText => {
        const rows = csvText.split('\n');
        if (rows.length > 0) {
          const headers = rows[0].split(',').map(header => header.trim());
          
          const parsedData = rows.slice(1).map(row => {
            if (!row.trim()) return null;
            
            const values = row.split(',');
            const rowData: {[key: string]: string} = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index]?.trim() || '';
            });
            
            return rowData;
          }).filter(Boolean);
          
          setCsvData(parsedData);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching or parsing CSV:", error);
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Syncfusion Spreadsheet Component</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <h2>Syncfusion Spreadsheet Component</h2>
      <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Back to Home
        </Link>
      <div style={{ height: '100%', width: '100%' }}>
        <SpreadsheetComponent 
          ref={spreadsheetRef}
          showSheetTabs={false}
          showRibbon={false}
          showFormulaBar={false}
        >
          <SheetsDirective>
            <SheetDirective name="CSV Data">
              <RangesDirective>
                <RangeDirective dataSource={csvData}></RangeDirective>
              </RangesDirective>
              <ColumnsDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
                <ColumnDirective width={150}></ColumnDirective>
              </ColumnsDirective>
            </SheetDirective>
          </SheetsDirective>
        </SpreadsheetComponent>
      </div>
    </div>
  );
} 