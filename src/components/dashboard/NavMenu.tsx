import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, Gift, Award, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type NavMenuProps = {
  isAdmin?: boolean;
  onNavigate?: () => void;
};

export const NavMenu = ({ isAdmin = false, onNavigate }: NavMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/referral", icon: Gift, label: "Referrals" },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Button
            key={item.path}
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "justify-start gap-3",
              isActive && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
            onClick={() => handleNavigation(item.path)}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
};
