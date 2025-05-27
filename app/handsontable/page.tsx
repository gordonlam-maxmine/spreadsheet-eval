'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import Grid from './Grid';

// Enhanced column definitions with explicit types and metadata
const columnDefinitions = [
  { name: 'Source Time', type: 'time', format: 'HH:mm:ss', description: 'Time of source event' },
  { name: 'Date', type: 'date', format: 'YYYY-MM-DD', description: 'Date of event' },
  { name: 'Type', type: 'text', description: 'Event type classification' },
  { name: 'Shift', type: 'text', description: 'Work shift identifier' },
  { name: 'Source', type: 'text', description: 'Origin location' },
  { name: 'Flitch', type: 'text', description: 'Flitch identifier' },
  { name: 'Destination', type: 'text', description: 'Target location' },
  { name: 'Product', type: 'text', description: 'Product name or identifier' },
  { name: 'Product Code', type: 'text', description: 'Unique product code' },
  { name: 'Block ID', type: 'text', description: 'Block identifier' },
  { name: 'Truck#', type: 'text', description: 'Truck number' },
  { name: 'Loads', type: 'numeric', format: '0.00', description: 'Number of loads' },
  { name: 'Loader#', type: 'text', description: 'Loader identifier' },
  { name: 'T/F', type: 'text', description: 'True/False indicator' },
  { name: 'Mass', type: 'numeric', format: '0.00', description: 'Weight measurement' },
  { name: 'Geofence Source', type: 'text', description: 'Geofence at source' },
  { name: 'Geofence Destination', type: 'text', description: 'Geofence at destination' },
  { name: 'Source Latitude', type: 'numeric', format: '0.000000', description: 'Latitude of source' },
  { name: 'Source Longitude', type: 'numeric', format: '0.000000', description: 'Longitude of source' },
  { name: 'Destination Latitude', type: 'numeric', format: '0.000000', description: 'Latitude of destination' },
  { name: 'Destination Longitude', type: 'numeric', format: '0.000000', description: 'Longitude of destination' },
  { name: 'SRTLink', type: 'text', description: 'SRT link reference' },
  { name: 'Source - Original', type: 'text', description: 'Original source value' },
  { name: 'Destination - Original', type: 'text', description: 'Original destination value' },
  { name: 'Product Code - Original', type: 'text', description: 'Original product code' },
  { name: 'Source Time - Original', type: 'time', format: 'HH:mm:ss', description: 'Original source time' },
  { name: 'Destination - Original', type: 'text', description: 'Original destination value' },
  { name: 'Product Code - Original', type: 'text', description: 'Original product code' },
  { name: 'Source Time - Original', type: 'time', format: 'HH:mm:ss', description: 'Original source time' },
  { name: 'Destination - Original', type: 'text', description: 'Original destination value' },
  { name: 'Product Code - Original', type: 'text', description: 'Original product code' },
  { name: 'Source Time - Original', type: 'time', format: 'HH:mm:ss', description: 'Original source time' },
];

// Extract just the column names for simple operations
const columnNames = columnDefinitions.map(col => col.name);

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
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-4">Handsontable Demo</h1>
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline inline-block mb-4"
        >
          Back to Home
        </Link>
      </header>

      {loading && <p>Loading CSV data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {!loading && !error && <Grid data={data} headers={headers} columnDefinitions={columnDefinitions} />}
      
    </div>
  );
} 