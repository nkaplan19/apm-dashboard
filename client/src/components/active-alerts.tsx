import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { Alert } from "@shared/schema";
import type { TimeRange } from "@/components/time-range-picker";

interface ActiveAlertsProps {
  timeRange: TimeRange;
}

export default function ActiveAlerts({ timeRange }: ActiveAlertsProps) {
  const queryClient = useQueryClient();
  
  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    refetchInterval: 30000,
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: string) => 
      apiRequest('PATCH', `/api/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
  });

  const activeAlerts = alerts.filter(alert => !alert.acknowledged).slice(0, 3);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-chart-4/10 border-chart-4/20';
      case 'warning': return 'bg-chart-3/10 border-chart-3/20';
      default: return 'bg-chart-1/10 border-chart-1/20';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-chart-4';
      case 'warning': return 'text-chart-3';
      default: return 'text-chart-1';
    }
  };

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Active Alerts</h3>
          <Badge variant="secondary" className="bg-chart-4 text-white">
            {activeAlerts.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}
              data-testid={`alert-item-${alert.id}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getSeverityTextColor(alert.severity)}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Threshold: {alert.threshold}, Current: {alert.currentValue.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.timestamp!), { addSuffix: true })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={acknowledgeAlertMutation.isPending}
                    className={`${getSeverityTextColor(alert.severity)} hover:bg-transparent p-1`}
                    data-testid={`button-acknowledge-${alert.id}`}
                  >
                    <CheckIcon className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {activeAlerts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
