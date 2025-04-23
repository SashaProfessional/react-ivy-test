import { ColumnMeta } from "@tanstack/react-table";

import { Employee } from "./employee";

// Define a custom ColumnMeta type to include align
export interface CustomColumnMeta extends ColumnMeta<Employee, unknown> {
  align?: "left" | "center" | "right";
}
