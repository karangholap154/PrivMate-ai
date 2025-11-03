import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Zap, TrendingUp, Crown } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-purple-50 px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Your AI Study Companion</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Learn Smarter with
              <span className="block text-primary mt-2">PrivMate AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Your smart study companion from Private Academy. Get instant, AI-powered answers to your study questions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Start Learning Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              3 free answers daily • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to supercharge your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Ask. Learn. Repeat.</CardTitle>
                <CardDescription>
                  Get instant, accurate answers to any study question. Our AI understands context and provides detailed explanations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Daily Streaks</CardTitle>
                <CardDescription>
                  Build consistent study habits with daily streaks. Track your progress and stay motivated every day.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Pro Plan - $5/month</CardTitle>
                <CardDescription>
                  Unlock unlimited answers, advanced features, and priority support. Cancel anytime, no commitment.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 bg-gradient-to-br from-primary/10 via-background to-purple-50">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center space-y-4 p-8 md:p-12">
              <CardTitle className="text-3xl md:text-4xl">
                Ready to Transform Your Learning?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of students already learning smarter with PrivMate AI
              </CardDescription>
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => navigate("/auth")}
                >
                  Get Started Now
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-semibold">PrivMate AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 PrivMate AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
