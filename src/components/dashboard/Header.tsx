import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, Crown, User, Menu, Gift, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavMenu } from "./NavMenu";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type HeaderProps = {
  userEmail: string;
  plan: "free" | "pro";
  onSignOut: () => void;
};

export const Header = ({ userEmail, plan, onSignOut }: HeaderProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);
    };

    checkAdminStatus();
  }, []);

  return (
    <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold cursor-pointer" onClick={() => navigate("/dashboard")}>
            PrivMate AI
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/referral")}>
            <Gift className="h-4 w-4 mr-2" />
            Referrals
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            {plan === "pro" ? (
              <Badge className="bg-primary">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            ) : (
              <Badge variant="secondary">Free</Badge>
            )}
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-6">
                <div className="pb-4 border-b">
                  <p className="text-sm font-medium truncate">{userEmail}</p>
                  {plan === "pro" ? (
                    <Badge className="bg-primary mt-2">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-2">Free</Badge>
                  )}
                </div>
                <NavMenu isAdmin={isAdmin} onNavigate={() => setMobileMenuOpen(false)} />
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignOut();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSignOut}
            className="hidden md:flex"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};
