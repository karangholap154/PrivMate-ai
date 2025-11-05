import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Crown, Flame, MessageSquare, TrendingUp } from "lucide-react";

type AdminStats = {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  activeStreaks: number;
  totalQuestions: number;
};

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    activeStreaks: 0,
    totalQuestions: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Check if user has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadStats();
      setLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const loadStats = async () => {
    try {
      // Get total users and plan distribution
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("plan, streak_days");

      if (profileError) throw profileError;

      const totalUsers = profiles?.length || 0;
      const freeUsers = profiles?.filter(p => p.plan === "free").length || 0;
      const proUsers = profiles?.filter(p => p.plan === "pro").length || 0;
      const activeStreaks = profiles?.filter(p => p.streak_days > 0).length || 0;

      // Get total questions
      const { data: answers, error: answersError } = await supabase
        .from("answers")
        .select("id", { count: "exact", head: true });

      if (answersError) throw answersError;

      setStats({
        totalUsers,
        freeUsers,
        proUsers,
        activeStreaks,
        totalQuestions: answers?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      <Header 
        userEmail={user.email || ""} 
        plan="pro"
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor platform usage and statistics</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Users */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered accounts
                </p>
              </CardContent>
            </Card>

            {/* Free Users */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.freeUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.freeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            {/* Pro Users */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                <Crown className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.proUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            {/* Active Streaks */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
                <Flame className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeStreaks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users with active learning streaks
                </p>
              </CardContent>
            </Card>

            {/* Total Questions */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <MessageSquare className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalQuestions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI answers generated
                </p>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.totalUsers > 0 
                    ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1)
                    : "0"
                  }%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Free to Pro conversion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Engagement Rate</span>
                  <span className="font-medium">
                    {stats.totalUsers > 0 
                      ? ((stats.activeStreaks / stats.totalUsers) * 100).toFixed(1)
                      : "0"
                    }%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Questions/User</span>
                  <span className="font-medium">
                    {stats.totalUsers > 0 
                      ? (stats.totalQuestions / stats.totalUsers).toFixed(1)
                      : "0"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue Potential</span>
                  <span className="font-medium text-primary">
                    ${(stats.proUsers * 5).toFixed(2)}/month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Admin management tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  For advanced admin operations, use the Supabase dashboard to:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>View and edit user data</li>
                  <li>Monitor payment webhooks</li>
                  <li>Check edge function logs</li>
                  <li>Manage user roles and permissions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
