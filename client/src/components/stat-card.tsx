import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function StatCard({ title, value, change, icon, isLoading = false }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold tabular-nums" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <ArrowUp className="w-4 h-4 text-chart-2" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    isPositive ? "text-chart-2" : "text-destructive"
                  )}
                  data-testid="stat-change"
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
