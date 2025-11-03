import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, FileText, Key, BookMarked, History } from "lucide-react";
import { Message } from "@/pages/Dashboard";
import { useNavigate } from "react-router-dom";

type SidebarProps = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  canAskQuestion: boolean;
  dailyAnswers: number;
  plan: "free" | "pro";
};

export const Sidebar = ({ 
  messages, 
  setMessages, 
  canAskQuestion,
  dailyAnswers,
  plan
}: SidebarProps) => {
  const navigate = useNavigate();
  
  const quickCommands = [
    { icon: Sparkles, label: "Explain", prompt: "Explain this concept:" },
    { icon: FileText, label: "Summarize", prompt: "Summarize:" },
    { icon: Key, label: "Key Points", prompt: "What are the key points of:" },
    { icon: BookMarked, label: "Short Notes", prompt: "Create short notes for:" },
  ];

  const handleQuickCommand = (prompt: string) => {
    if (canAskQuestion) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: prompt,
      };
      setMessages([...messages, newMessage]);
    }
  };

  return (
    <aside className="hidden md:flex w-64 border-r bg-muted/30 flex-col p-4 gap-4">
      <Card className="p-4">
        <h2 className="font-semibold mb-3 text-sm text-muted-foreground">Quick Commands</h2>
        <div className="space-y-2">
          {quickCommands.map((cmd) => (
            <Button
              key={cmd.label}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handleQuickCommand(cmd.prompt)}
              disabled={!canAskQuestion}
            >
              <cmd.icon className="h-4 w-4 mr-2" />
              {cmd.label}
            </Button>
          ))}
        </div>
      </Card>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => navigate("/history")}
      >
        <History className="h-4 w-4 mr-2" />
        View History
      </Button>

      <Card className="p-4">
        <h3 className="font-semibold mb-2 text-sm">Daily Usage</h3>
        {plan === "free" ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Answers today:</span>
              <span className="font-medium">{dailyAnswers}/3</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(dailyAnswers / 3) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            ✨ Unlimited answers
          </div>
        )}
      </Card>
    </aside>
  );
};
