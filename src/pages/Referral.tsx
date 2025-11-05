import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Copy, Users, Check } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  plan: "free" | "pro";
  referral_code: string;
  bonus_answers: number;
};

type Referral = {
  id: string;
  referred_id: string;
  reward_given: boolean;
  referred_user_login_days: number;
  created_at: string;
};

const Referral = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
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

    // Load referrals
    const { data: referralsData, error: referralsError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    if (referralsError) {
      console.error("Error loading referrals:", referralsError);
    } else {
      setReferrals(referralsData || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const copyReferralLink = () => {
    if (!profile) return;
    
    const referralLink = `${window.location.origin}/auth?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
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

  const referralLink = `${window.location.origin}/auth?ref=${profile.referral_code}`;
  const pendingRewards = referrals.filter(r => !r.reward_given && r.referred_user_login_days >= 3).length;

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
              <h1 className="text-3xl font-bold">Invite & Earn</h1>
              <p className="text-muted-foreground">Share PrivMate AI and get rewards!</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>

          {/* Referral Link Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with friends and earn bonus answers!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {referralLink}
                </div>
                <Button onClick={copyReferralLink} size="icon" variant="outline">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-sm text-muted-foreground">Your Referral Code</p>
                  <p className="text-2xl font-bold text-primary">{profile.referral_code}</p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <p className="text-sm text-muted-foreground">Bonus Answers</p>
                  <p className="text-2xl font-bold text-green-600">+{profile.bonus_answers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Referrals Work</CardTitle>
              <CardDescription>Earn rewards for every friend you invite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl mb-2">1️⃣</div>
                  <p className="font-semibold mb-1">Share Link</p>
                  <p className="text-xs text-muted-foreground">
                    Send your unique referral link to friends
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl mb-2">2️⃣</div>
                  <p className="font-semibold mb-1">They Sign Up</p>
                  <p className="text-xs text-muted-foreground">
                    Your friend creates an account using your link
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl mb-2">3️⃣</div>
                  <p className="font-semibold mb-1">Earn Rewards</p>
                  <p className="text-xs text-muted-foreground">
                    Get 3 bonus answers after they study for 3 days
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium mb-2">🎁 Reward Details</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Each friend who studies for 3 days = +3 bonus answers for you</li>
                  <li>• Bonus answers never expire</li>
                  <li>• Stack unlimited referrals</li>
                  <li>• Works even if you're a Pro user!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Referrals Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Referrals
              </CardTitle>
              <CardDescription>
                Track your invited friends and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No referrals yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start sharing your link to earn rewards!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{referrals.length}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                      <p className="text-2xl font-bold text-green-600">
                        {referrals.filter(r => r.reward_given).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Rewards Earned</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 rounded-lg text-center border border-orange-500/20">
                      <p className="text-2xl font-bold text-orange-600">{pendingRewards}</p>
                      <p className="text-xs text-muted-foreground">Pending Rewards</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Friend Referred</p>
                            <p className="text-xs text-muted-foreground">
                              {referral.referred_user_login_days} days active
                            </p>
                          </div>
                        </div>
                        {referral.reward_given ? (
                          <Badge className="bg-green-500">Rewarded</Badge>
                        ) : referral.referred_user_login_days >= 3 ? (
                          <Badge className="bg-orange-500">Pending</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {3 - referral.referred_user_login_days} days left
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Referral;
