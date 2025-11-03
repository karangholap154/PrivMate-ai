import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatArea } from "@/components/dashboard/ChatArea";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { Header } from "@/components/dashboard/Header";

export type UserProfile = {
  id: string;
  email: string;
  plan: "free" | "pro";
  streak_days: number;
  last_answer_date: string | null;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dailyAnswers, setDailyAnswers] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load user profile
      await loadUserProfile(session.user.id);
      setLoading(false);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setProfile(data);
      // Count today's answers
      await countTodayAnswers(userId);
    }
  };

  const countTodayAnswers = async (userId: string) => {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("answers")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`);

    if (!error && data) {
      setDailyAnswers(data.length);
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

  if (!user || !profile) {
    return null;
  }

  const canAskQuestion = profile.plan === "pro" || dailyAnswers < 3;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        userEmail={user.email || ""} 
        plan={profile.plan}
        onSignOut={handleSignOut}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          messages={messages}
          setMessages={setMessages}
          canAskQuestion={canAskQuestion}
          dailyAnswers={dailyAnswers}
          plan={profile.plan}
        />
        
        <ChatArea
          messages={messages}
          setMessages={setMessages}
          userId={user.id}
          canAskQuestion={canAskQuestion}
          dailyAnswers={dailyAnswers}
          onLimitReached={() => setShowUpgradeModal(true)}
          onAnswerSuccess={() => {
            setDailyAnswers(dailyAnswers + 1);
            loadUserProfile(user.id);
          }}
        />
      </div>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
};

export default Dashboard;
