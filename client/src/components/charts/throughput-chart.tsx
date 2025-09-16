import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Chart from "chart.js/auto";
import { chartConfig } from "@/lib/chart-config";
import type { Metric } from "@shared/schema";
import type { TimeRange } from "@/components/time-range-picker";

interface ThroughputChartProps {
  timeRange: TimeRange;
}

export default function ThroughputChart({ timeRange }: ThroughputChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const startISO = timeRange.start.toISOString();
  const endISO = timeRange.end.toISOString();
  
  const { data: metrics = [] } = useQuery<Metric[]>({
    queryKey: [`/api/metrics?start=${startISO}&end=${endISO}`],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!chartRef.current || metrics.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Process data for chart - take last 24 data points
    const recentMetrics = metrics.slice(0, 24).reverse();
    const labels = recentMetrics.map((_, index) => {
      const hoursAgo = 24 - index;
      return `${hoursAgo}h ago`;
    });
    const data = recentMetrics.map(m => Math.round(m.throughput));

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Requests/min',
          data,
          backgroundColor: chartConfig.colors.secondary + '80',
          borderColor: chartConfig.colors.secondary,
          borderWidth: 1
        }]
      },
      options: {
        ...chartConfig.baseOptions,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: chartConfig.colors.grid
            },
            ticks: {
              color: chartConfig.colors.text
            }
          },
          x: {
            grid: {
              color: chartConfig.colors.grid
            },
            ticks: {
              color: chartConfig.colors.text
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [metrics]);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Request Throughput</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Updated 30 sec ago</span>
            <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="h-64">
          <canvas ref={chartRef} data-testid="chart-throughput" />
        </div>
      </CardContent>
    </Card>
  );
}
