import { useQuery } from "@tanstack/react-query";
import { 
  Gauge, 
  ServerIcon, 
  TriangleAlert, 
  BellIcon, 
  ChartBarIcon, 
  CogIcon,
  ChartLineIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Application } from "@shared/schema";

export default function Sidebar() {
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-chart-2';
      case 'warning': return 'bg-chart-3';
      case 'critical': return 'bg-chart-4';
      default: return 'bg-chart-1';
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartLineIcon className="text-primary-foreground text-sm w-4 h-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">APM Dashboard</h1>
            <p className="text-xs text-muted-foreground">Performance Monitoring</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md bg-accent text-accent-foreground"
            data-testid="link-overview"
          >
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-medium">Overview</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="link-applications"
          >
            <ServerIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Applications</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="link-errors"
          >
            <TriangleAlert className="w-4 h-4" />
            <span className="text-sm font-medium">Errors</span>
            <Badge variant="destructive" className="ml-auto text-xs">12</Badge>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="link-alerts"
          >
            <BellIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Alerts</span>
            <Badge variant="secondary" className="ml-auto bg-chart-3 text-black text-xs">3</Badge>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="link-analytics"
          >
            <ChartBarIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Analytics</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            data-testid="link-settings"
          >
            <CogIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </a>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Applications
          </h3>
          <div className="space-y-2">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="flex items-center space-x-2 px-3 py-2 text-sm"
                data-testid={`app-status-${app.id}`}
              >
                <div className={`w-2 h-2 ${getStatusColor(app.status)} rounded-full`} />
                <span className="text-card-foreground">{app.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {app.uptime.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
