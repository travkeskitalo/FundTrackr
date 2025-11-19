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
    <Card className="shadow-sm hover-elevate transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground tracking-tight">{title}</CardTitle>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-9 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold tabular-nums tracking-tight" data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1.5 pt-1">
                {isPositive ? (
                  <ArrowUp className="w-3.5 h-3.5 text-chart-2" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-destructive" />
                )}
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
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
