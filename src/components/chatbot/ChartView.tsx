"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface ChartData {
  years: number[];
  prices: number[];
  demand: number[];
}

interface ChartViewProps {
  chartData: ChartData;
}

export default function ChartView({ chartData }: ChartViewProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Transform data for recharts
  const data = chartData.years.map((year, index) => ({
    year,
    price: chartData.prices[index],
    demand: chartData.demand[index],
  }));

  // Color palette for different data series
  const colors = {
    price: '#3b82f6',      // Blue
    demand: '#ef4444',     // Red
  };

  return (
    <Card className="shadow-lg border-border/50 transition-all hover:shadow-xl animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationDelay: "100ms" }}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            Market Trends
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
              className="h-8"
            >
              <TrendingUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
              className="h-8"
            >
              <BarChart3 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={320}>
          {chartType === 'line' ? (
            <LineChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                stroke={colors.price}
                strokeWidth={3}
                name="Price (₹)"
                dot={{ fill: colors.price, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="demand"
                stroke={colors.demand}
                strokeWidth={3}
                name="Demand Score"
                dot={{ fill: colors.demand, strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={1000}
                animationBegin={200}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <defs>
                <linearGradient id="priceBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="demandBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>
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
                iconType="square"
              />
              <Bar
                dataKey="price"
                fill="url(#priceBarGradient)"
                name="Price (₹)"
                animationDuration={1000}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="demand"
                fill="url(#demandBarGradient)"
                name="Demand Score"
                animationDuration={1000}
                animationBegin={200}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}