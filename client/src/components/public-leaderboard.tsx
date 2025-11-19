import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import type { PublicLeaderboardEntry } from "@shared/schema";

interface PublicLeaderboardProps {
  entries: PublicLeaderboardEntry[];
  isLoading?: boolean;
}

export function PublicLeaderboard({ entries, isLoading = false }: PublicLeaderboardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Trophy className="w-5 h-5 text-primary" />
            Public Leaderboard
          </CardTitle>
          <CardDescription>Top performing portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/30 rounded-lg border animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Trophy className="w-5 h-5 text-primary" />
            Public Leaderboard
          </CardTitle>
          <CardDescription>Top performing portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No users on the public leaderboard yet. Opt in from your settings to appear here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Trophy className="w-5 h-5 text-primary" />
          Public Leaderboard
        </CardTitle>
        <CardDescription>Top performing portfolios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate transition-shadow"
              data-testid={`leaderboard-entry-${entry.rank}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center font-bold ${getMedalColor(entry.rank)}`}>
                  {entry.rank <= 3 ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">#{entry.rank}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold" data-testid={`text-display-name-${entry.rank}`}>
                    {entry.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    ${entry.currentValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {entry.percentChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-chart-2" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                )}
                <span
                  className={`font-bold text-sm tabular-nums ${
                    entry.percentChange >= 0 ? "text-chart-2" : "text-destructive"
                  }`}
                  data-testid={`text-percent-change-${entry.rank}`}
                >
                  {entry.percentChange >= 0 ? "+" : ""}
                  {entry.percentChange.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
