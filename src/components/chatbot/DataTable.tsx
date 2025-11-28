"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Table2, Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface DataTableProps {
  data: Record<string, any>[];
}

export default function DataTable({ data }: DataTableProps) {
  const handleDownload = () => {
    if (!data || data.length === 0) return;

    // Create a new workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `real-estate-data-${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg border-border/50 animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: "200ms" }}>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Table2 className="h-4 w-4 text-primary" />
            </div>
            Data Table
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Get all unique keys from the data
  const columns = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  );

  return (
    <Card className="shadow-lg border-border/50 transition-all hover:shadow-xl animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: "200ms" }}>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Table2 className="h-4 w-4 text-primary" />
            </div>
            Data Table
          </CardTitle>
          <Button
            onClick={handleDownload}
            size="sm"
            variant="outline"
            className="gap-2 transition-all hover:scale-105"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[300px] w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead key={column} className="capitalize font-semibold text-foreground/80 text-xs">
                    {column.replace(/_/g, " ")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="border-b transition-colors hover:bg-muted/50"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {columns.map((column) => (
                    <TableCell key={column} className="text-sm text-muted-foreground">
                      {row[column] !== undefined ? String(row[column]) : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}