'use client';

import { ReactNode } from 'react';

interface Column {
  key: string;
  header: string;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, ReactNode>[];
  className?: string;
}

export function DataTable({ columns, data, className = '' }: DataTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-4 text-sm font-semibold text-zinc-300 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 px-4 text-sm text-zinc-400 ${col.className || ''}`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
