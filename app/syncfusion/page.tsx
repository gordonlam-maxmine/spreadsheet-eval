'use client'
import * as React from 'react';
import { SpreadsheetComponent, SheetsDirective, SheetDirective, RangesDirective, 
         RangeDirective, ColumnsDirective, ColumnDirective, CellRenderEventArgs } from '@syncfusion/ej2-react-spreadsheet';
import '@syncfusion/ej2-react-spreadsheet/styles/material.css';
import Link from 'next/link';

// Function to generate a consistent color based on a string
function stringToColor(str: string): string {
  // Handle empty strings
  if (!str || str.trim() === '') {
    return '#ffddbb'; // Default orange for empty cells
  }

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate pastel colors for better readability
  const h = Math.abs(hash) % 360; // Hue (0-360)
  const s = 50 + (Math.abs(hash) % 30); // Saturation (50-80%)
  const l = 80; // Lightness (fixed at 80% for pastel)

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function Home() {
  const [csvData, setCsvData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const spreadsheetRef = React.useRef<SpreadsheetComponent>(null);
  const [columnTypes, setColumnTypes] = React.useState<{[key: string]: string}>({});

  React.useEffect(() => {
    fetchCsvData();
  }, []);

  // Function to determine column types based on headers
  const determineColumnTypes = (headers: string[]) => {
    const types: {[key: string]: string} = {};
    
    headers.forEach((header) => {
      const headerLower = header.toLowerCase();
      console.log(headerLower)
      // Detect date/time columns
      if (headerLower.includes('time') || headerLower == 'source time') {
        types[header] = 'datetime';
         
      } 
      // Add more type detection as needed
      else if (headerLower.includes('date')) {
        types[header] = 'date';
        
      }
    });
    
    setColumnTypes(types);
  };

  // Apply time formatting to appropriate columns after spreadsheet is created
  const onCreated = () => {
    if (spreadsheetRef.current && csvData.length > 0) {
      setTimeout(() => {
        applyColumnFormats();
      }, 1000);
    }
  };

  // Apply formats to columns based on their detected types
  const applyColumnFormats = () => {
    const spreadsheet = spreadsheetRef.current;
    if (!spreadsheet) return;
    
    const headers = Object.keys(csvData[0] || {});
    
    // Apply formats based on column types
    headers.forEach((header, index) => {
      const columnLetter = String.fromCharCode(65 + index); // A, B, C, etc.
      const columnRange = `${columnLetter}2:${columnLetter}1000`; // Skip header row
      
      if (columnTypes[header] === 'datetime') {
        // Apply datetime format (dd/MM/yyyy hh:mm)
        spreadsheet.numberFormat('dd/MM hh:mm', columnRange);
      } else if (columnTypes[header] === 'date') {
        // Apply date format to date columns
        spreadsheet.numberFormat('dd/MM', columnRange);
      }
    });
  };

  // Handle before cell render event for custom styling
  function beforeCellRender(args: CellRenderEventArgs): void {
    const spreadsheet = spreadsheetRef.current;
    if (!spreadsheet) return;
    
    // Check if header row (row 0)
    if (args.address.includes('1')) {
      spreadsheet.cellFormat({ 
        fontWeight: 'bold', 
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
        verticalAlign: 'middle'
      }, args.address);
      return;
    }

    // Style cells based on content
    if (args.cell) {
      if (!args.cell.value || args.cell.value === '') {
        // Style for empty cells
        spreadsheet.cellFormat({ 
          backgroundColor: '#ffddbb',
          fontStyle: 'italic',
          color: '#666'
        }, args.address);
        
        // Add warning icon to empty cells
        args.cell.value = '⚠️ Empty';
      } else {
        // Apply color based on cell value for non-empty cells
        const bgColor = stringToColor(args.cell.value.toString());
        spreadsheet.cellFormat({ 
          backgroundColor: bgColor,
          fontWeight: 'bold'
        }, args.address);
      }
    }
  }

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
          
          // Determine column types based on headers
          determineColumnTypes(headers);
          
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
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Syncfusion Spreadsheet Component</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Syncfusion Spreadsheet with Custom Styling</h2>
      <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline mb-4 inline-block"
        >
          Back to Home
        </Link>
      <div style={{ height: 'calc(100vh - 120px)', width: '100%', marginTop: '16px' }}>
        <SpreadsheetComponent 
          ref={spreadsheetRef}
          showSheetTabs={false}
          showRibbon={false}
          showFormulaBar={false}
          beforeCellRender={beforeCellRender}
          created={onCreated}
          allowResizing={true}
          allowSorting={true}
          allowFiltering={true}
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