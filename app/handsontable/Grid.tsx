'use client';

import {
  AutoColumnSize,
  ContextMenu,
  CopyPaste,
  DropdownMenu,
  Filters,
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

registerCellType(CheckboxCellType);
registerCellType(NumericCellType);
registerCellType(TextCellType);
registerCellType(DateCellType);
registerCellType(TimeCellType);

registerPlugin(AutoColumnSize);
registerPlugin(ContextMenu);
registerPlugin(CopyPaste);
registerPlugin(DropdownMenu);
registerPlugin(Filters);

registerAllModules();

const stringToColor = (str: string): string => {
  if (!str) {
    return '#ffddbb';
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = Math.abs(hash) % 360;
  const s = 50 + (Math.abs(hash) % 30);
  const l = 80;

  return `hsl(${h}, ${s}%, ${l}%)`;
};

const colorCache = new Map<string, string>();

const customRenderer = function(
  instance: any, 
  td: HTMLTableCellElement, 
  row: number, 
  col: number, 
  prop: string | number, 
  value: any, 
  cellProperties: any
) {
  textRenderer.apply(this as any, [instance, td, row, col, prop, value, cellProperties]);
  
  const valueStr = String(value || '');
  
  if (!value || value === '' || value === null || value === undefined) {
    td.style.backgroundColor = '#ffddbb';
    
    const icon = document.createElement('span');
    icon.innerHTML = ' ⚠️ ';
    icon.style.marginLeft = '5px';
    icon.title = 'Empty cell';
    
    td.innerHTML = '';
    td.appendChild(icon);
    
    const text = document.createElement('span');
    text.innerText = 'No data';
    text.style.color = '#999';
    text.style.fontSize = '11px';
    text.style.fontStyle = 'italic';
    td.appendChild(text);
  } else {
    let bgColor: string;
    if (colorCache.has(valueStr)) {
      bgColor = colorCache.get(valueStr)!;
    } else {
      bgColor = stringToColor(valueStr);
      colorCache.set(valueStr, bgColor);
    }
    
    td.style.backgroundColor = bgColor;
    td.style.border = '1px solid #ddd';
    td.style.color = 'black';
  }
  
  return td;
};

type GridProps = {
  data: any[][];
  headers: string[];
  columnDefinitions?: Array<{
    name: string;
    type: string;
    format?: string;
    description?: string;
  }>;
};

export default function Grid(props: GridProps) {
  const { data, headers, columnDefinitions } = props;
  
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
          cellProperties._origRenderer = cellProperties.renderer;
        }}
      >
        {columnIndexes.map((index) => {
          let columnType = 'text';
          let columnClass = '';
          
          const headerName = headers[index];
          const definition = columnDefinitions?.find(def => def.name === headerName);
          
          if (definition) {
            columnType = definition.type;
            
            if (columnType === 'checkbox') {
              columnClass = 'htCenter';
            }
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