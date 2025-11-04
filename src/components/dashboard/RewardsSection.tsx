import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Reward {
  id: string;
  milestone: string;
  reward_name: string;
  created_at: string;
}

interface RewardsSectionProps {
  userId: string;
  currentStreak: number;
}

export const RewardsSection = ({ userId, currentStreak }: RewardsSectionProps) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  const milestones = [
    { days: 7, name: "Focused Learner", emoji: "🗓", milestone: "7_days" },
    { days: 15, name: "Smart Achiever", emoji: "🏅", milestone: "15_days" },
    { days: 30, name: "Exam Hero", emoji: "🏆", milestone: "30_days" },
    { days: 60, name: "Knowledge Master", emoji: "👑", milestone: "60_days" },
    { days: 90, name: "Learning Legend", emoji: "⭐", milestone: "90_days" },
  ];

  useEffect(() => {
    loadRewards();
  }, [userId]);

  const loadRewards = async () => {
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setRewards(data);
    }
    setLoading(false);
  };

  const isUnlocked = (milestone: string) => {
    return rewards.some((r) => r.milestone === milestone);
  };

  const getNextMilestone = () => {
    for (const milestone of milestones) {
      if (currentStreak < milestone.days) {
        return milestone;
      }
    }
    return null;
  };

  const nextMilestone = getNextMilestone();
  const progressPercentage = nextMilestone
    ? (currentStreak / nextMilestone.days) * 100
    : 100;

  if (loading) {
    return <div className="text-center p-4">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Badges
          </CardTitle>
          <CardDescription>Earn badges by maintaining your daily streak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {milestones.map((milestone) => {
              const unlocked = isUnlocked(milestone.milestone);
              return (
                <div
                  key={milestone.milestone}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    unlocked
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-muted/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{milestone.emoji}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {milestone.days} days
                      </p>
                    </div>
                    {unlocked ? (
                      <Badge variant="default">Earned</Badge>
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {nextMilestone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Milestone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress to {nextMilestone.name}
              </span>
              <span className="font-semibold">
                {currentStreak} / {nextMilestone.days} days
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {nextMilestone.days - currentStreak} more days to unlock {nextMilestone.emoji}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};