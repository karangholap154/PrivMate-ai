import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Sparkles } from "lucide-react";

interface RewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: {
    days: number;
    reward: string;
  } | null;
}

export const RewardModal = ({ open, onOpenChange, milestone }: RewardModalProps) => {
  if (!milestone) return null;

  const getEmoji = (days: number) => {
    if (days === 7) return "🗓";
    if (days === 15) return "🏅";
    if (days === 30) return "🏆";
    if (days === 60) return "👑";
    if (days === 90) return "⭐";
    return "🎉";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Award className="h-20 w-20 text-primary" />
              <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Congratulations! {getEmoji(milestone.days)}
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {milestone.days}-Day Streak Achieved!
            </p>
            <p className="text-base">
              You've earned the <span className="font-bold text-primary">"{milestone.reward}"</span> badge!
            </p>
            <p className="text-sm text-muted-foreground">
              Keep up the amazing work and continue your learning journey! 🚀
            </p>
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
};