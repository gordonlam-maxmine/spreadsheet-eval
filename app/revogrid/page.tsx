'use client'
import * as React from 'react';
import { RevoGrid, Template, type ColumnDataSchemaModel } from '@revolist/react-datagrid';
import Link from 'next/link';

// Hash function to generate consistent colors for the same content
function stringToColorCode(str: string): string {
  if (!str || str.trim() === '') return '#FFA500'; // Return orange for empty cells
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a pastel color
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 70%, 80%)`;
}

// Custom cell component with color highlighting
const ColoredCell = ({ value }: Partial<ColumnDataSchemaModel>) => {
  if (!value || value.toString().trim() === '') {
    return (
      <div style={{ backgroundColor: '#FFA500', padding: '4px', height: '100%', display: 'flex', alignItems: 'center' }}>
        <span role="img" aria-label="warning" style={{ marginRight: '4px' }}>⚠️</span>
        <em>Empty</em>
      </div>
    );
  }
  
  const backgroundColor = stringToColorCode(value.toString());
  
  return (
    <div style={{ backgroundColor, padding: '4px', height: '100%', display: 'flex', alignItems: 'center' }}>
      <strong>{value}</strong>
    </div>
  );
};

export default function RevoGridPage() {
  const [source, setSource] = React.useState<any[]>([]);
  const [columns, setColumns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [columnTypes, setColumnTypes] = React.useState<{[key: string]: string}>({});
  const [showColumnList, setShowColumnList] = React.useState(false);
  
  React.useEffect(() => {
    fetchCsvData();
  }, []);

  // Toggle column list visibility
  const toggleColumnList = () => {
    setShowColumnList(!showColumnList);
  };

  // Function to determine column types based on headers
  const determineColumnTypes = (headers: string[]) => {
    const types: {[key: string]: string} = {};
    
    headers.forEach((header) => {
      const headerLower = header.toLowerCase();
      
      // Detect date/time columns
      if (headerLower.includes('time')) {
        types[header] = 'datetime';
      } 
      // Add more type detection as needed
      else if (headerLower.includes('date')) {
        types[header] = 'date';
      }
    });
    
    setColumnTypes(types);
  };

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
          // Extract headers from first row and create column definitions
          const headers = rows[0].split(',').map(header => header.trim());
          setHeaders(headers);
          
          // Determine column types based on headers
          determineColumnTypes(headers);
          
          const columnDefs = headers.map(header => ({
            prop: header,
            name: header,
            size: 150,
            sortable: true,
            filterable: true,
            resizable: true,
            cellTemplate: Template(ColoredCell) // Apply custom cell template to all columns
          }));
          
          // Parse data rows
          const parsedData = rows.slice(1).map(row => {
            if (!row.trim()) return null;
            
            const values = row.split(',');
            const rowData: {[key: string]: string} = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index]?.trim() || '';
            });
            
            return rowData;
          }).filter(Boolean);
          
          setColumns(columnDefs);
          setSource(parsedData);
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
        <h2 className="text-2xl font-bold mb-4">RevoGrid Data Grid</h2>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-4">RevoGrid Data Grid with Custom Cell Rendering</h2>
      <div className="flex justify-between items-center mb-4">
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline inline-block"
        >
          Back to Home
        </Link>
        <button 
          onClick={toggleColumnList}
          className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
        >
          {showColumnList ? 'Hide Column Order' : 'Show Column Order'}
        </button>
      </div>
      
      {showColumnList && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
          <h3 className="font-bold mb-2">Default Column Order:</h3>
          <ol className="list-decimal pl-6">
            {headers.map((header, index) => (
              <li key={index} className="mb-1">
                <span className="font-medium">{header}</span>
                {columnTypes[header] && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {columnTypes[header]}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      
      <div className="flex-1">
        <RevoGrid 
          columns={columns} 
          source={source}
          theme="material"
          resize={true}
          filter={true}
        />
      </div>
    </div>
  );
} 