"use client";

import SummaryCard from "./SummaryCard";
import ChartView from "./ChartView";
import DataTable from "./DataTable";
import { BarChart3 } from "lucide-react";

interface ResultsPanelProps {
  results: {
    summary: string;
    chart: {
      years: number[];
      prices: number[];
      demand: number[];
    };
    table: Record<string, any>[];
  } | null;
}

export default function ResultsPanel({ results }: ResultsPanelProps) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Upload an Excel file and send a query to see detailed analysis results here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SummaryCard summary={results.summary} />
      <ChartView chartData={results.chart} />
      <DataTable data={results.table} />
    </div>
  );
}