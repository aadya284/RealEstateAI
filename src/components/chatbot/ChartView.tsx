"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface ChartData {
  years: number[];
  prices: number[];
  demand: number[];
}

interface ChartViewProps {
  chartData: ChartData;
}

export default function ChartView({ chartData }: ChartViewProps) {
  // Transform data for recharts
  const data = chartData.years.map((year, index) => ({
    year,
    price: chartData.prices[index],
    demand: chartData.demand[index],
  }));

  return (
    <Card className="shadow-lg border-border/50 transition-all hover:shadow-xl animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: "100ms" }}>
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/20" opacity={0.5} />
            <XAxis
              dataKey="year"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={{ stroke: "hsl(var(--border))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              name="Price"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke="hsl(var(--secondary))"
              strokeWidth={2.5}
              name="Demand"
              dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
              animationBegin={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}