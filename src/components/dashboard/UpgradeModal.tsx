import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, ExternalLink } from "lucide-react";

type UpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  const LEMON_SQUEEZY_CHECKOUT_URL = "https://privmate.lemonsqueezy.com/buy/e4ef55b9-2654-464f-b3eb-713550902e25";

  const proFeatures = [
    "Unlimited AI answers",
    "Priority support",
    "Advanced study tools",
    "No daily limits",
    "Cancel anytime",
  ];

  const handleUpgrade = () => {
    window.open(LEMON_SQUEEZY_CHECKOUT_URL, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          </div>
          <DialogDescription>
            You've reached your daily limit of 3 answers. Upgrade to Pro for unlimited access!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-3xl font-bold">₹400<span className="text-lg font-normal text-muted-foreground">/month</span></p>
          </div>

          <div className="space-y-3">
            {proFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleUpgrade} className="w-full" size="lg">
            Upgrade to Pro
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure checkout powered by Lemon Squeezy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
