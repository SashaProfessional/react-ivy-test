import { useState, useEffect, useMemo, useRef } from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

import { Columns } from "../enums/columns";
import { AccessorKey } from "../enums/accessorKeys";
import { CustomColumnMeta } from "../interfaces/customColumnMeta";
import { Employee } from "../interfaces/employee";
import { employees } from "./mockData";
import { ROW_HEIGHT } from "./constants/app";

export function EmployeeTable() {
  const [data, setData] = useState<Employee[]>(employees);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns: ColumnDef<Employee, CustomColumnMeta>[] = useMemo(
    () => [
      {
        accessorKey: AccessorKey.Name,
        header: Columns.NameJobTitle,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div>{row.original.name}</div>
            <div>{row.original.jobTitle}</div>
          </div>
        ),
        enableSorting: true,
      },
      {
        accessorKey: AccessorKey.Age,
        header: Columns.Age,
        meta: { align: "right" },
        enableSorting: true,
      },
      {
        accessorKey: AccessorKey.Nickname,
        header: Columns.Nickname,
        enableSorting: false,
      },
      {
        accessorKey: AccessorKey.IsEmployee,
        header: Columns.Employee,
        cell: ({ row }) => (
          <div className="flex justify-center">
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
        meta: { align: "center" },
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

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
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
    document.documentElement.style.setProperty("--td-width", `${tdWidth}px`);
  };

  // Set td width on mount and on resize
  useEffect(() => {
    setTdWidth();
    window.addEventListener("resize", setTdWidth);
    return () => window.removeEventListener("resize", setTdWidth);
  }, [table.getVisibleLeafColumns().length]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();

  return (
    <div className="flex flex-col h-screen">
      <div className="justify-between flex items-center px-2.5 h-[50px]">
        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setGlobalFilter(e.target.value)
          }
          className="w-[300px]"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="select-columns-button">
              Select Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-1">
              {table.getAllLeafColumns().map((column) => (
                <div key={column.id} className="flex items-center">
                  <Checkbox
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(value)
                    }
                    className="mr-1.5"
                  />
                  <span>{column.columnDef.header as string}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div ref={tableContainerRef} className="flex-1 overflow-auto">
        <table
          className="w-full border-collapse relative"
          style={{ height: `${totalHeight}px` }}
        >
          <thead ref={headerRef}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`p-1.5 bg-gray-100 sticky top-0 z-10 ${
                      header.column.columnDef.header === Columns.Age
                        ? "text-right pr-4"
                        : (header.column.columnDef.meta as CustomColumnMeta)
                            ?.align || "text-left"
                    }`}
                    style={{
                      width: "var(--td-width)",
                      height: `${ROW_HEIGHT}px`,
                    }}
                  >
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className={`flex items-center cursor-pointer ${
                        header.column.columnDef.header === Columns.Age
                          ? "justify-end"
                          : `justify-${
                              (header.column.columnDef.meta as CustomColumnMeta)
                                ?.align || "start"
                            }`
                      }`}
                    >
                      {header.column.columnDef.header ===
                      Columns.NameJobTitle ? (
                        <div className="flex flex-col items-start">
                          <span>Name</span>
                          <span>(job title)</span>
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                      {header.column.getCanSort() && (
                        <span className="ml-1.5">
                          {header.column.getIsSorted() === "asc"
                            ? " 🔼"
                            : header.column.getIsSorted() === "desc"
                            ? " 🔽"
                            : " ↕️"}
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
                    position: "absolute",
                    top: 0,
                    transform: `translateY(${
                      virtualRow.start + headerHeight
                    }px)`,
                    height: `${ROW_HEIGHT}px`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`border border-gray-900 p-1.5 ${
                        (cell.column.columnDef.meta as CustomColumnMeta)
                          ?.align || "text-left"
                      }`}
                      style={{
                        border: "1px solid black",
                        padding: "5px",
                        textAlign:
                          (cell.column.columnDef.meta as CustomColumnMeta)
                            ?.align || "left",
                        width: "var(--td-width)",
                        height: `${ROW_HEIGHT}px`,
                        boxSizing: "border-box",
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
