import { useState } from 'react';
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { employees, Employee } from './mockData';

// Enum for columns
export enum Column {
  NameJobTitle = 'Name (job title)',
  Age = 'Age',
  Nickname = 'Nickname',
  Employee = 'Employee',
}

export function EmployeeTable() {
  const [data, setData] = useState<Employee[]>(employees);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: Column.NameJobTitle,
      cell: ({ row }) => (
        <div>
          <div>{row.original.name}</div>
          <div>{row.original.jobTitle}</div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'age',
      header: Column.Age,
      meta: { align: 'right' },
      enableSorting: true,
    },
    {
      accessorKey: 'nickname',
      header: Column.Nickname,
      enableSorting: false,
    },
    {
      accessorKey: 'isEmployee',
      header: Column.Employee,
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Checkbox
            checked={row.original.isEmployee}
            onCheckedChange={(checked) => {
              const newData = [...data];
              newData[row.index].isEmployee = checked as boolean;
              setData(newData);
            }}
          />
        </div>
      ),
      meta: { align: 'center' },
      enableSorting: true,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ height: '50px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Select Columns</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div>
              {table.getAllLeafColumns().map((column) => (
                <div key={column.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    style={{ marginRight: '5px' }}
                  />
                  <span>{column.columnDef.header as string}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      border: '1px solid black',
                      padding: '5px',
                      textAlign: header.column.columnDef.meta?.align || 'left',
                      backgroundColor: '#f5f5f5',
                    }}
                  >
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          header.column.columnDef.meta?.align === 'right'
                            ? 'flex-end'
                            : header.column.columnDef.meta?.align === 'center'
                            ? 'center'
                            : 'flex-start',
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span style={{ marginLeft: '5px' }}>
                          {header.column.getIsSorted() === 'asc'
                            ? ' 🔼'
                            : header.column.getIsSorted() === 'desc'
                            ? ' 🔽'
                            : ' ↕️'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      border: '1px solid black',
                      padding: '5px',
                      textAlign: cell.column.columnDef.meta?.align || 'left',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}