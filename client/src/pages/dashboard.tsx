import { useState } from "react";
import Sidebar from "@/components/sidebar";
import MetricsGrid from "@/components/metrics-grid";
import ResponseTimeChart from "@/components/charts/response-time-chart";
import ThroughputChart from "@/components/charts/throughput-chart";
import ErrorRateChart from "@/components/charts/error-rate-chart";
import ApplicationHealth from "@/components/application-health";
import RecentErrors from "@/components/recent-errors";
import ActiveAlerts from "@/components/active-alerts";
import PerformanceHeatmap from "@/components/performance-heatmap";
import { TimeRangePicker, type TimeRange } from "@/components/time-range-picker";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
    end: new Date(),
    label: "Last 24 hours",
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Connect to WebSocket for real-time updates
  useWebSocket();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Performance Overview</h1>
              <p className="text-muted-foreground">Real-time application metrics and monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <TimeRangePicker
                value={timeRange}
                onChange={setTimeRange}
              />
              
              <Button 
                variant={autoRefresh ? "default" : "secondary"}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center space-x-2"
                data-testid="button-auto-refresh"
              >
                <RefreshCwIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Auto-refresh</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <MetricsGrid timeRange={timeRange} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponseTimeChart timeRange={timeRange} />
            <ThroughputChart timeRange={timeRange} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ApplicationHealth timeRange={timeRange} />
            <RecentErrors timeRange={timeRange} />
            <ActiveAlerts timeRange={timeRange} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ErrorRateChart timeRange={timeRange} />
            <PerformanceHeatmap timeRange={timeRange} />
          </div>
        </div>
      </main>
    </div>
  );
}
