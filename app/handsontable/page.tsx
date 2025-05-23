'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import Grid from './Grid';

export default function HandsontablePage() {
  const [data, setData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
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
          const dataRows = parsedData.slice(1);
          
          console.log('Headers extracted:', headerRow);
          setHeaders(headerRow);
          setData(dataRows);
        } else {
          setData([]);
          setHeaders([]);
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
        <h1 className="text-3xl font-bold mb-4">Handsontable Demo</h1>
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Back to Home
        </Link>
      </header>

        {loading && <p>Loading CSV data...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && <Grid data={data} headers={headers} />}
      
    </div>
  );
} 