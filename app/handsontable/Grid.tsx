'use client';

import {
  AutoColumnSize,
  Autofill,
  ContextMenu,
  CopyPaste,
  DropdownMenu,
  Filters,
  HiddenRows,
  registerPlugin,
} from 'handsontable/plugins';

import {
  CheckboxCellType,
  TimeCellType,
  NumericCellType,
  registerCellType,
  DateCellType,
  TextCellType,
} from 'handsontable/cellTypes';
import { HotTable, HotColumn } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import { textRenderer } from 'handsontable/renderers/textRenderer';
import 'handsontable/dist/handsontable.full.min.css';

import { Data } from '@/app/data';

registerCellType(CheckboxCellType);
registerCellType(NumericCellType);
registerCellType(TextCellType);
registerCellType(DateCellType);
registerCellType(TimeCellType);

registerPlugin(AutoColumnSize);
registerPlugin(Autofill);
registerPlugin(ContextMenu);
registerPlugin(CopyPaste);
registerPlugin(DropdownMenu);
registerPlugin(Filters);
registerPlugin(HiddenRows);

// register Handsontable's modules
registerAllModules();

// Function to generate a consistent color based on a string
const stringToColor = (str: string): string => {
  // Handle empty strings
  if (!str) {
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
};

// Map to store colors for reuse
const colorCache = new Map<string, string>();

// Custom renderer for cells with color hashing
const customRenderer = function(
  instance: any, 
  td: HTMLTableCellElement, 
  row: number, 
  col: number, 
  prop: string | number, 
  value: any, 
  cellProperties: any
) {
  // First call the original text renderer
  textRenderer.apply(this as any, [instance, td, row, col, prop, value, cellProperties]);
  
  // Convert value to string for consistent handling
  const valueStr = String(value || '');
  
  // Check if the cell is empty
  if (!value || value === '' || value === null || value === undefined) {
    // Set the background color to orange
    td.style.backgroundColor = '#ffddbb';
    
    // Add an icon for empty cells (using a Unicode character for simplicity)
    const icon = document.createElement('span');
    icon.innerHTML = ' ⚠️ '; // Warning icon
    icon.style.marginLeft = '5px';
    icon.title = 'Empty cell';
    
    // Clear the cell and append the icon
    td.innerHTML = '';
    td.appendChild(icon);
    
    // Add a text label
    const text = document.createElement('span');
    text.innerText = 'No data';
    text.style.color = '#999';
    text.style.fontSize = '11px';
    text.style.fontStyle = 'italic';
    td.appendChild(text);
  } else {
    // For non-empty cells, apply color hashing
    
    // Get color from cache or generate new one
    let bgColor: string;
    if (colorCache.has(valueStr)) {
      bgColor = colorCache.get(valueStr)!;
    } else {
      bgColor = stringToColor(valueStr);
      colorCache.set(valueStr, bgColor);
    }
    
    // Apply the background color
    td.style.backgroundColor = bgColor;
    
    // Add a slight border for better visibility between cells
    td.style.border = '1px solid #ddd';
    
    // Ensure text is readable on any background
    const isDark = false; // We're using pastel colors which are generally light
    if (isDark) {
      td.style.color = 'white';
    } else {
      td.style.color = 'black';
    }
  }
  
  return td;
};

type GridProps = {
  data: Data;
  headers: string[];
};

export default function Grid(props: GridProps) {
  const { data, headers } = props;
  
  // Generate column indexes for each header
  const columnIndexes = headers.map((_, index) => index);
  
  return (
    <div className="h-full w-full flex-1">
      <HotTable
        data={data}
        colWidths={Array(headers.length).fill(150)}
        colHeaders={headers}
        multiColumnSorting={true}
        contextMenu={true}
        manualColumnMove={true}
        manualColumnResize={true}
        filters={true}
        // enable the column menu, but display only the filter menu items
        dropdownMenu={[
          'filter_by_condition',
          'filter_by_value',
          'filter_action_bar',
        ]}
        rowHeaders={true}
        manualRowMove={true}
        navigableHeaders={true}
        autoWrapRow={true}
        autoWrapCol={true}
        height={'80vh'}
        licenseKey="non-commercial-and-evaluation"
        beforeRenderer={(TD: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
          // Store the original renderer to be used by empty renderer
          cellProperties._origRenderer = cellProperties.renderer;
        }}
        afterInit={(hotInstance: any) => {
          // Store the Handsontable instance for debugging/testing
          if (typeof window !== 'undefined') {
            console.log('Handsontable instance initialized and stored');
            (window as any).hotData = hotInstance;
          }
        }}
      >
        {columnIndexes.map((index) => {
          let columnType = 'text';
          let columnClass = '';
          
          // Try to determine column types based on header name
          if (headers[index]?.toLowerCase().includes('date')) {
            columnType = 'date';
          } else if (headers[index]?.toLowerCase().includes('time')) {
            columnType = 'time';
          } else if (headers[index]?.toLowerCase().includes('in stock')) {
            columnType = 'checkbox';
            columnClass = 'htCenter';
          } else if (
            headers[index]?.toLowerCase().includes('qty') || 
            headers[index]?.toLowerCase().includes('progress') ||
            headers[index]?.toLowerCase().includes('rating')
          ) {
            columnType = 'numeric';
          }
          
          return (
            <HotColumn 
              key={index}
              data={index} 
              type={columnType as any}
              className={columnClass}
              filterable={true}
              sortable={true}
              renderer={customRenderer}
            />
          );
        })}
      </HotTable>
    </div>
  );
}
