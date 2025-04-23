import { useState, useEffect, useMemo, useRef } from 'react';
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
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

// Enum for accessor keys
export enum AccessorKey {
  Name = 'name',
  Age = 'age',
  Nickname = 'nickname',
  IsEmployee = 'isEmployee',
}

export function EmployeeTable() {
  const [data, setData] = useState<Employee[]>(employees);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        accessorKey: AccessorKey.Name,
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
        accessorKey: AccessorKey.Age,
        header: Column.Age,
        meta: { align: 'right' },
        enableSorting: true,
      },
      {
        accessorKey: AccessorKey.Nickname,
        header: Column.Nickname,
        enableSorting: false,
      },
      {
        accessorKey: AccessorKey.IsEmployee,
        header: Column.Employee,
        cell: ({ row }) => (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Checkbox
              checked={row.original.isEmployee}
              onCheckedChange={(checked: boolean) => {
                const newData = [...data];
                newData[row.index].isEmployee = checked;
                setData(newData);
              }}
            />
          </div>
        ),
        meta: { align: 'center' },
        enableSorting: true,
      },
    ],
    [data]
  );

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

  // Virtualization setup
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Set a consistent row height based on the tallest content
  const rowHeight = 59; // Matches the observed td height of 59px

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight, // Use the fixed row height
    overscan: 5,
  });

  // Calculate header height to offset the virtual rows
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.getBoundingClientRect().height);
    }
  }, []);

  // Function to calculate and set CSS variable for td width
  const setTdWidth = () => {
    const width = window.innerWidth;
    const visibleColumns = table.getVisibleLeafColumns().length;
    const tdWidth = Math.floor(width / visibleColumns);
    document.documentElement.style.setProperty('--td-width', `${tdWidth}px`);
  };

  // Set td width on mount and on resize
  useEffect(() => {
    setTdWidth();
    window.addEventListener('resize', setTdWidth);
    return () => window.removeEventListener('resize', setTdWidth);
  }, [table.getVisibleLeafColumns().length]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="justify-between" style={{ height: '50px', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
          style={{ width: '300px' }}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="select-columns-button">
              Select Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div>
              {table.getAllLeafColumns().map((column) => (
                <div key={column.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) => column.toggleVisibility(value)}
                    style={{ marginRight: '5px' }}
                  />
                  <span>{column.columnDef.header as string}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div ref={tableContainerRef} style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', height: `${totalHeight}px`, position: 'relative' }}>
          <thead ref={headerRef}>
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
                      width: 'var(--td-width)',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
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
            {virtualRows.map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  data-row-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    transform: `translateY(${virtualRow.start + headerHeight}px)`,
                    height: `${rowHeight}px`, // Explicitly set the tr height
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        border: '1px solid black',
                        padding: '5px',
                        textAlign: cell.column.columnDef.meta?.align || 'left',
                        width: 'var(--td-width)',
                        height: `${rowHeight}px`, // Explicitly set the td height
                        boxSizing: 'border-box',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}