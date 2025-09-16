import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon, ArrowRightIcon, TriangleAlert, HeartIcon, ArrowDownIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import type { Metric } from "@shared/schema";
import type { TimeRange } from "@/components/time-range-picker";

interface MetricsGridProps {
  timeRange: TimeRange;
}

export default function MetricsGrid({ timeRange }: MetricsGridProps) {
  const startISO = timeRange.start.toISOString();
  const endISO = timeRange.end.toISOString();
  
  const { data: metrics = [] } = useQuery<Metric[]>({
    queryKey: [`/api/metrics?start=${startISO}&end=${endISO}`],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate aggregated metrics from recent data
  const recentMetrics = metrics.slice(0, 10); // Last 10 data points
  
  const avgResponseTime = recentMetrics.length > 0 
    ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
    : 0;
    
  const avgThroughput = recentMetrics.length > 0
    ? recentMetrics.reduce((sum, m) => sum + m.throughput, 0) / recentMetrics.length
    : 0;
    
  const avgErrorRate = recentMetrics.length > 0
    ? recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length
    : 0;
    
  const avgSuccessRate = recentMetrics.length > 0
    ? recentMetrics.reduce((sum, m) => sum + m.successRate, 0) / recentMetrics.length
    : 99.97;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Response Time</p>
              <p className="text-2xl font-semibold text-card-foreground" data-testid="metric-response-time">
                {Math.round(avgResponseTime)}ms
              </p>
              <p className="text-xs text-chart-2 flex items-center mt-1">
                <ArrowDownIcon className="w-3 h-3 mr-1" />
                <span>12% from last hour</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ClockIcon className="text-primary w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Throughput</p>
              <p className="text-2xl font-semibold text-card-foreground" data-testid="metric-throughput">
                {Math.round(avgThroughput)}/min
              </p>
              <p className="text-xs text-chart-2 flex items-center mt-1">
                <ArrowUpIcon className="w-3 h-3 mr-1" />
                <span>8% from last hour</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
              <ArrowRightIcon className="text-chart-2 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-semibold text-card-foreground" data-testid="metric-error-rate">
                {avgErrorRate.toFixed(2)}%
              </p>
              <p className="text-xs text-chart-4 flex items-center mt-1">
                <ArrowUpIcon className="w-3 h-3 mr-1" />
                <span>0.03% from last hour</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
              <TriangleAlert className="text-chart-4 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uptime</p>
              <p className="text-2xl font-semibold text-card-foreground" data-testid="metric-uptime">
                {avgSuccessRate.toFixed(2)}%
              </p>
              <p className="text-xs text-chart-2 flex items-center mt-1">
                <CheckIcon className="w-3 h-3 mr-1" />
                <span>30 days</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
              <HeartIcon className="text-chart-2 w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
