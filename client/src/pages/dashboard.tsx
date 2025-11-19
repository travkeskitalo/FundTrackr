import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCurrentUser, signOut } from "@/lib/auth";
import type { PortfolioEntry, InsertPortfolioEntry, MarketIndexData, LeaderboardStats, PublicLeaderboardEntry, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PortfolioInput } from "@/components/portfolio-input";
import { StatCard } from "@/components/stat-card";
import { PerformanceChart } from "@/components/performance-chart";
import { RecentEntries } from "@/components/recent-entries";
import { Leaderboard } from "@/components/leaderboard";
import { PublicLeaderboard } from "@/components/public-leaderboard";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Activity, LogOut, Settings as SettingsIcon, Shield } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setLocation("/login");
      } else {
        setUser(currentUser);
      }
    };
    checkAuth();
  }, [setLocation]);

  const { data: entries = [], isLoading: entriesLoading } = useQuery<PortfolioEntry[]>({
    queryKey: ["/api/portfolio/entries"],
    enabled: !!user,
  });

  const { data: marketData = [], isLoading: marketLoading } = useQuery<MarketIndexData[]>({
    queryKey: ["/api/market/indices"],
    enabled: !!user,
  });

  const { data: leaderboardStats, isLoading: leaderboardLoading } = useQuery<LeaderboardStats>({
    queryKey: ["/api/leaderboard"],
    enabled: !!user,
  });

  const { data: userData } = useQuery<User>({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
  });

  const { data: publicLeaderboard = [], isLoading: publicLeaderboardLoading } = useQuery<PublicLeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/public"],
    enabled: !!user,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (data: InsertPortfolioEntry) => {
      return apiRequest("POST", "/api/portfolio/entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Success!",
        description: "Portfolio snapshot saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save portfolio snapshot.",
        variant: "destructive",
      });
    },
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    if (!entries.length) {
      return {
        currentValue: "$0.00",
        totalReturn: 0,
        recentChange: 0,
      };
    }

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstValue = parseFloat(sortedEntries[0].value);
    const lastValue = parseFloat(sortedEntries[sortedEntries.length - 1].value);
    const totalReturn = ((lastValue - firstValue) / firstValue) * 100;

    let recentChange = 0;
    if (sortedEntries.length >= 2) {
      const secondLast = parseFloat(sortedEntries[sortedEntries.length - 2].value);
      recentChange = ((lastValue - secondLast) / secondLast) * 100;
    }

    return {
      currentValue: `$${lastValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      totalReturn,
      recentChange,
    };
  };

  const stats = calculateStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">FundTrack</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-email">
                {user.email}
              </span>
              {userData?.isMaster && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" data-testid="button-admin">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/settings">
                <Button variant="outline" size="sm" data-testid="button-settings">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Current Value"
              value={stats.currentValue}
              icon={<DollarSign className="w-4 h-4" />}
              isLoading={entriesLoading}
            />
            <StatCard
              title="Total Return"
              value={`${stats.totalReturn >= 0 ? "+" : ""}${stats.totalReturn.toFixed(2)}%`}
              change={stats.totalReturn}
              icon={<TrendingUp className="w-4 h-4" />}
              isLoading={entriesLoading}
            />
            <StatCard
              title="Recent Change"
              value={`${stats.recentChange >= 0 ? "+" : ""}${stats.recentChange.toFixed(2)}%`}
              change={stats.recentChange}
              icon={<Activity className="w-4 h-4" />}
              isLoading={entriesLoading}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PortfolioInput
                onSubmit={async (data) => {
                  await addEntryMutation.mutateAsync(data);
                }}
                isLoading={addEntryMutation.isPending}
              />
              <PerformanceChart
                entries={entries}
                marketData={marketData}
                isLoading={entriesLoading || marketLoading}
              />
            </div>
            <div className="space-y-6">
              <RecentEntries entries={entries} isLoading={entriesLoading} />
              <Leaderboard stats={leaderboardStats || null} isLoading={leaderboardLoading} />
              <PublicLeaderboard entries={publicLeaderboard} isLoading={publicLeaderboardLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
