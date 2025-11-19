import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save } from "lucide-react";
import type { User } from "@shared/schema";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

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

  const { data: userData } = useQuery<User>({
    queryKey: ["/api/user/settings"],
    enabled: !!user,
  });

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "");
      setIsPublic(userData.isPublic || false);
    }
  }, [userData]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { displayName?: string; isPublic?: boolean }) => {
      return apiRequest("PATCH", "/api/user/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Success!",
        description: "Settings updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    await updateSettingsMutation.mutateAsync({
      displayName: displayName || undefined,
      isPublic,
    });
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 -ml-2"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            </div>
          </div>
          <p className="text-muted-foreground">Manage your account preferences and privacy</p>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold tracking-tight">Profile Settings</CardTitle>
              <CardDescription>Update your display name and leaderboard visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  className="h-10"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  data-testid="input-display-name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will appear on the public leaderboard. Leave blank to use your email prefix.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="isPublic" className="text-sm font-medium">Public Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Show your portfolio performance on the public leaderboard
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  data-testid="switch-is-public"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
                className="w-full h-10 font-medium shadow-sm"
                data-testid="button-save-settings"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
