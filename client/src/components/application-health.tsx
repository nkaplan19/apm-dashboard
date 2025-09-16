import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Application } from "@shared/schema";
import type { TimeRange } from "@/components/time-range-picker";

interface ApplicationHealthProps {
  timeRange: TimeRange;
}

export default function ApplicationHealth({ timeRange }: ApplicationHealthProps) {
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-chart-2';
      case 'warning': return 'bg-chart-3';
      case 'critical': return 'bg-chart-4';
      default: return 'bg-chart-1';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">Application Health</h3>
        <div className="space-y-4">
          {applications.map((app) => (
            <div 
              key={app.id} 
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
              data-testid={`app-health-${app.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${getStatusColor(app.status)} rounded-full`} />
                <div>
                  <p className="font-medium text-card-foreground">{app.name}</p>
                  <p className="text-sm text-muted-foreground">{getStatusText(app.status)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-card-foreground">{app.uptime.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{Math.round(app.avgResponseTime)}ms avg</p>
              </div>
            </div>
          ))}
          
          {applications.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
