import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Error } from "@shared/schema";
import type { TimeRange } from "@/components/time-range-picker";

interface RecentErrorsProps {
  timeRange: TimeRange;
}

export default function RecentErrors({ timeRange }: RecentErrorsProps) {
  const { data: errors = [] } = useQuery<Error[]>({
    queryKey: ['/api/errors'],
    refetchInterval: 30000,
  });

  const recentErrors = errors.slice(0, 3); // Show only 3 most recent

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Errors</h3>
          <Button 
            variant="link" 
            className="text-sm text-primary hover:text-primary/80 p-0"
            data-testid="button-view-all-errors"
          >
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {recentErrors.map((error) => (
            <div 
              key={error.id} 
              className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              data-testid={`error-item-${error.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error.errorType}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {error.endpoint || 'Unknown endpoint'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(error.timestamp!), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-primary hover:text-primary/80 p-1"
                  data-testid={`button-error-details-${error.id}`}
                >
                  <ExternalLinkIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {recentErrors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent errors</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
