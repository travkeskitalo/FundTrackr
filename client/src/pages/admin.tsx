import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Trophy } from "lucide-react";
import type { PublicLeaderboardEntry, User } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setLocation("/login");
        return;
      }
      setUser(currentUser as User);
    };
    checkAuth();
  }, [setLocation]);

  const { data: leaderboardEntries = [], isLoading } = useQuery<PublicLeaderboardEntry[]>({
    queryKey: ["/api/leaderboard/public"],
    enabled: !!user,
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", "/api/admin/remove-from-leaderboard", { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/public"] });
      toast({
        title: "Success!",
        description: "User removed from public leaderboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove user.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveUser = async (userId: string, displayName: string) => {
    if (confirm(`Are you sure you want to remove ${displayName} from the public leaderboard?`)) {
      await removeUserMutation.mutateAsync(userId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 -ml-2"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
            </div>
          </div>
          <p className="text-muted-foreground">Manage public leaderboard users</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Trophy className="w-5 h-5 text-primary" />
              Public Leaderboard Management
            </CardTitle>
            <CardDescription>
              Remove users from the public leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No users on the public leaderboard.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboardEntries.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate transition-shadow"
                    data-testid={`admin-entry-${entry.userId}`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-base">{entry.displayName}</p>
                      <p className="text-sm text-muted-foreground">{entry.email}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">Rank #{entry.rank}</span>
                        <span>•</span>
                        <span className={entry.percentChange >= 0 ? "text-chart-2" : "text-destructive"}>
                          {entry.percentChange >= 0 ? "+" : ""}
                          {entry.percentChange.toFixed(2)}%
                        </span>
                        <span>•</span>
                        <span>
                          ${entry.currentValue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUser(entry.userId, entry.displayName)}
                      disabled={removeUserMutation.isPending}
                      data-testid={`button-remove-${entry.userId}`}
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
