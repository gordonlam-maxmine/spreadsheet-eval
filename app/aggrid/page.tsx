'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import Grid from './Grid';

export default function AGGridPage() {
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching CSV data...');
    
    fetch('/test-data.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        return response.text();
      })
      .then(csvText => {
        console.log('Parsing CSV data...');
        const result = Papa.parse(csvText, {
          skipEmptyLines: true,
          header: false
        });
        
        if (result.errors.length > 0) {
          throw new Error(`CSV parse error: ${result.errors[0].message}`);
        }
        
        console.log('CSV data parsed successfully');
        
        // Extract headers from the first row
        const parsedData = result.data as any[][];
        if (parsedData.length > 0) {
          const headerRow = parsedData[0] as string[];
          
          // Convert row data to objects with keys from headers
          const rowData = parsedData.slice(1).map(row => {
            const rowObj: Record<string, any> = {};
            headerRow.forEach((header, index) => {
              // Convert values to appropriate types
              let value = row[index];
              
              // Try to convert to number if it looks like a number
              if (/^-?\d+(\.\d+)?$/.test(value)) {
                value = parseFloat(value);
              } 
              // Convert to boolean if true/false
              else if (value?.toLowerCase() === 'true') {
                value = true;
              } 
              else if (value?.toLowerCase() === 'false') {
                value = false;
              }
              
              rowObj[header] = value;
            });
            return rowObj;
          });
          
          console.log('Headers extracted:', headerRow);
          // Create simple column definitions
          setColumnDefs(headerRow.map(header => ({ field: header })));
          setRowData(rowData);
        } else {
          setRowData([]);
          setColumnDefs([]);
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-full mx-2 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">AG Grid Demo (Community Edition)</h1>
        <div className="flex gap-4 items-center">
          <Link 
            href="/"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {loading && <p>Loading CSV data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && (
        <div className="h-[80vh]">
          <Grid 
            rowData={rowData} 
            columnDefs={columnDefs} 
          />
        </div>
      )}
    </div>
  );
} 