// This file is no longer used. See app/aggrid/page.tsx for the full implementation. 

'use client';

import React, { useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface GridProps {
  rowData: any[];
  columnDefs?: any[];
}

// Function to generate a consistent color based on a string
const stringToColor = (str: string): string => {
  if (!str) return '#ffddbb';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash) % 360;
  const s = 50 + (Math.abs(hash) % 30);
  const l = 80;
  
  return `hsl(${h}, ${s}%, ${l}%)`;
};

// Map to store colors for reuse
const colorCache = new Map<string, string>();

// Custom React cell renderer component
const ColoredCellRenderer = (props: any) => {
  const value = props.value;
  const valueStr = String(value || '');
  
  // For empty cells
  if (value === null || value === undefined || value === '') {
    return (
      <div style={{
        backgroundColor: '#ffddbb',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px'
      }}>
        <span role="img" aria-label="warning" style={{ marginRight: '5px' }}>⚠️</span>
        <span style={{ fontSize: '11px', fontStyle: 'italic', color: '#999' }}>
          No data
        </span>
      </div>
    );
  }
  
  // For cells with data
  let bgColor;
  if (colorCache.has(valueStr)) {
    bgColor = colorCache.get(valueStr);
  } else {
    bgColor = stringToColor(valueStr);
    colorCache.set(valueStr, bgColor);
  }
  
  return (
    <div style={{
      backgroundColor: bgColor,
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px'
    }}>
      {value}
    </div>
  );
};

export default function Grid({ rowData, columnDefs = [] }: GridProps) {
  const gridRef = useRef<any>(null);
  
  // Process column definitions to add custom renderer
  const processedColumnDefs = columnDefs.map(colDef => ({
    ...colDef,
    cellRenderer: ColoredCellRenderer,
    filter: true
  }));

  // Default column properties - only using community features
  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true, // Basic filter only
    resizable: true
  };

  // Grid ready handler
  const onGridReady = (params: any) => {
    // Store grid API for debugging
    if (typeof window !== 'undefined') {
      (window as any).agGridApi = params.api;
    }
    
    // Fit columns to available width
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 0);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current && gridRef.current.api) {
        gridRef.current.api.sizeColumnsToFit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="ag-theme-alpine w-full h-full">
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={processedColumnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
        animateRows={true}
        onGridReady={onGridReady}
        suppressRowClickSelection={true}
        // Force include specific modules using module params
        rowModelType="clientSide"
        suppressAggFuncInHeader={true}
      />
    </div>
  );
} 