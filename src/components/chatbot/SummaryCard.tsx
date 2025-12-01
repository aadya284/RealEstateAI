"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface SummaryCardProps {
  summary: string;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  // Truncate summary to first 300 characters and add ellipsis if needed
  const truncatedSummary = summary.length > 300 
    ? summary.substring(0, 300) + '...' 
    : summary;

  return (
    <Card className="shadow-lg border-border/50 transition-all hover:shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">{truncatedSummary}</p>
        {summary.length > 300 && (
          <p className="text-xs text-muted-foreground/60 mt-3 italic">Summary truncated for readability...</p>
        )}
      </CardContent>
    </Card>
  );
}