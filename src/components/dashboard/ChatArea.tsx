import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { Message } from "@/pages/Dashboard";
import { ChatMessage } from "./ChatMessage";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ChatAreaProps = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  userId: string;
  canAskQuestion: boolean;
  dailyAnswers: number;
  onLimitReached: () => void;
  onAnswerSuccess: () => void;
};

export const ChatArea = ({
  messages,
  setMessages,
  userId,
  canAskQuestion,
  dailyAnswers,
  onLimitReached,
  onAnswerSuccess,
}: ChatAreaProps) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    if (!canAskQuestion) {
      onLimitReached();
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: { question: input.trim() },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
      };

      setMessages([...messages, userMessage, assistantMessage]);
      onAnswerSuccess();

      // Show streak notifications
      const streakInfo = data.streakInfo;
      if (streakInfo) {
        if (streakInfo.newMilestone) {
          // Milestone achievement will be shown by parent component
        } else if (streakInfo.streakMaintained) {
          toast({
            title: "🔥 Streak maintained!",
            description: `You're on a ${streakInfo.streakDays}-day streak. Keep it up!`,
          });
        } else if (streakInfo.streakReset) {
          toast({
            title: "⚡ Let's start again today!",
            description: "Your streak has been reset. Time to build a new one!",
          });
        }
      }
    } catch (error: any) {
      console.error("Error getting answer:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-semibold">Welcome to PrivMate AI</h2>
              <p className="text-muted-foreground">
                Your smart study companion from Private Academy. Ask me anything about your studies and I'll provide detailed, helpful answers.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t bg-card p-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={canAskQuestion ? "Ask a question..." : "Daily limit reached. Upgrade to Pro for unlimited answers."}
              className="min-h-[60px] resize-none"
              disabled={loading || !canAskQuestion}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px]"
              disabled={loading || !canAskQuestion || !input.trim()}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          {!canAskQuestion && (
            <div className="mt-3 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                You've used all 3 free answers today.
              </p>
              <Button 
                onClick={onLimitReached}
                variant="default"
                className="w-full sm:w-auto"
              >
                Upgrade to Pro - $5/month
              </Button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
};
