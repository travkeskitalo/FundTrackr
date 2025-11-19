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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Manage public leaderboard users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
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
                  <div key={i} className="h-16 bg-muted/30 rounded animate-pulse" />
                ))}
              </div>
            ) : leaderboardEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users on the public leaderboard.
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboardEntries.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    data-testid={`admin-entry-${entry.userId}`}
                  >
                    <div>
                      <p className="font-medium">{entry.displayName}</p>
                      <p className="text-sm text-muted-foreground">{entry.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rank #{entry.rank} • {entry.percentChange >= 0 ? "+" : ""}
                        {entry.percentChange.toFixed(2)}% • $
                        {entry.currentValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveUser(entry.userId, entry.displayName)}
                      disabled={removeUserMutation.isPending}
                      data-testid={`button-remove-${entry.userId}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
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
