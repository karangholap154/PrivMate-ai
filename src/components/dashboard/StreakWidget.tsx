import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StreakWidgetProps {
  streakDays: number;
}

export const StreakWidget = ({ streakDays }: StreakWidgetProps) => {
  return (
    <Card className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            {streakDays} Day Streak
          </p>
          <p className="text-xs text-muted-foreground">
            Keep learning daily!
          </p>
        </div>
      </div>
    </Card>
  );
};