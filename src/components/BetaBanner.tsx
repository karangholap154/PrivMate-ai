import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const BetaBanner = () => {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-500/10 border-yellow-500/50">
      <div className="container mx-auto flex items-center justify-center gap-2 py-1">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <AlertDescription className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          ⚠️ This website is in BETA phase - Please DO NOT make any payments at this time
        </AlertDescription>
      </div>
    </Alert>
  );
};
