"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface SummaryCardProps {
  summary: string;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <Card className="shadow-lg border-border/50 transition-all hover:shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}