import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import type { LeaderboardStats } from "@shared/schema";

interface LeaderboardProps {
  stats: LeaderboardStats | null;
  isLoading?: boolean;
}

export function Leaderboard({ stats, isLoading = false }: LeaderboardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Anonymous Rankings</CardTitle>
              <CardDescription>See how you compare to other investors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50">
                <div className="h-4 bg-muted rounded animate-pulse w-32 mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Anonymous Rankings</CardTitle>
              <CardDescription>See how you compare to other investors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No ranking data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add portfolio entries to see your ranking
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOutperforming = stats.userPercentChange > stats.averagePercentChange;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <div>
            <CardTitle>Anonymous Rankings</CardTitle>
            <CardDescription>See how you compare to other investors</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 rounded-lg bg-primary/5 border border-primary/20" data-testid="leaderboard-user-stats">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Performance</p>
              <p className="text-3xl font-bold tabular-nums">
                {stats.userPercentChange >= 0 ? "+" : ""}
                {stats.userPercentChange.toFixed(2)}%
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${isOutperforming ? "text-chart-2" : "text-muted-foreground"}`} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Rank</p>
              <p className="text-lg font-semibold">{stats.userRank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Investors</p>
              <p className="text-lg font-semibold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground mb-1">Average Performance</p>
          <p className="text-2xl font-bold tabular-nums" data-testid="text-average-performance">
            {stats.averagePercentChange >= 0 ? "+" : ""}
            {stats.averagePercentChange.toFixed(2)}%
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            {isOutperforming ? (
              <span className="text-chart-2 font-medium">
                You're outperforming the average by{" "}
                {(stats.userPercentChange - stats.averagePercentChange).toFixed(2)}%
              </span>
            ) : (
              <span className="text-muted-foreground">
                Average is{" "}
                {(stats.averagePercentChange - stats.userPercentChange).toFixed(2)}% higher
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
