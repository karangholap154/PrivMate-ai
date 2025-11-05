import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Flame, Award, Mail } from "lucide-react";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";

type UserProfile = {
  id: string;
  email: string;
  plan: "free" | "pro";
  streak_days: number;
  last_answer_date: string | null;
};

type Reward = {
  id: string;
  milestone: string;
  reward_name: string;
  reward_claimed: boolean;
  created_at: string;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
      await loadUserData(session.user.id);
      setLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    // Load profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error loading profile:", profileError);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      return;
    }

    if (profileData) {
      setProfile(profileData);
    }

    // Load rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (rewardsError) {
      console.error("Error loading rewards:", rewardsError);
    } else {
      setRewards(rewardsData || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getMilestoneIcon = (milestone: string) => {
    const milestoneMap: Record<string, string> = {
      "7_days": "🗓️",
      "15_days": "🏅",
      "30_days": "🏆",
      "60_days": "👑",
      "90_days": "⭐",
    };
    return milestoneMap[milestone] || "🎖️";
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

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      <Header 
        userEmail={user.email || ""} 
        plan={profile.plan}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Track your progress and achievements</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.plan === "pro" ? (
                      <Badge className="bg-primary">
                        <Crown className="h-3 w-3 mr-1" />
                        Pro
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                </div>
                {profile.plan === "free" && (
                  <Button onClick={() => setShowUpgradeModal(true)}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>

              {profile.plan === "free" && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Free Plan: 3 answers per day
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upgrade to Pro for unlimited answers and advanced features!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Learning Streak
              </CardTitle>
              <CardDescription>
                Keep your daily study streak alive!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500">
                  <div className="text-center text-white">
                    <Flame className="h-8 w-8 mx-auto" />
                    <p className="text-2xl font-bold mt-1">{profile.streak_days}</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.streak_days} Day Streak</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.streak_days === 0 
                      ? "Start your streak today!" 
                      : "Keep going! Study every day to maintain your streak."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Earned Rewards
              </CardTitle>
              <CardDescription>
                Your achievements and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No rewards yet</p>
                  <p className="text-sm text-muted-foreground">
                    Keep studying to earn your first badge!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="p-4 border rounded-lg bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getMilestoneIcon(reward.milestone)}</span>
                        <div>
                          <p className="font-semibold">{reward.reward_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reward.milestone.replace("_", " ").replace("days", "Day Streak")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Milestone */}
              {profile.streak_days < 90 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Next Milestone:</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {profile.streak_days < 7 && <p>🗓️ 7 Days → "Focused Learner" Badge</p>}
                    {profile.streak_days >= 7 && profile.streak_days < 15 && <p>🏅 15 Days → "Smart Achiever" Badge</p>}
                    {profile.streak_days >= 15 && profile.streak_days < 30 && <p>🏆 30 Days → "Exam Hero" Badge</p>}
                    {profile.streak_days >= 30 && profile.streak_days < 60 && <p>👑 60 Days → "Knowledge Master" Badge</p>}
                    {profile.streak_days >= 60 && profile.streak_days < 90 && <p>⭐ 90 Days → "Learning Legend" Badge</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
};

export default Profile;
