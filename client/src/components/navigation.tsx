import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Home, 
  Rocket, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  Menu,
  X,
  HelpCircle
} from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: () => {
      // Force logout even if API call fails
      logout();
      toast({
        title: "Logged out",
        description: "Session ended.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/campaigns", label: "Campaigns", icon: Rocket },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard" && location === "/") return false;
    return location === href || location.startsWith(href + "/");
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 gradient-electric-violet rounded-xl flex items-center justify-center">
                  <Zap className="text-white text-lg" />
                </div>
                <span className="text-2xl font-black text-slate-900">SparkWave</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                      isActive(item.href)
                        ? "text-electric-blue bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} />
                      <AvatarFallback className="bg-electric-blue text-white">
                        {user?.fullName?.[0] || user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.fullName || user?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600" 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="text-slate-600 text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 md:hidden">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <span className="text-2xl font-black text-slate-900">Menu</span>
                <button onClick={toggleMobileMenu}>
                  <X className="text-slate-600 text-2xl" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center space-x-3 mb-8 p-4 bg-slate-50 rounded-xl">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar} alt={user?.fullName || user?.username} />
                  <AvatarFallback className="bg-electric-blue text-white">
                    {user?.fullName?.[0] || user?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{user?.fullName || user?.username}</p>
                  <p className="text-sm text-slate-600 truncate w-48">{user?.email}</p>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <div 
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                          isActive(item.href)
                            ? "text-electric-blue bg-blue-50"
                            : "text-slate-700 hover:text-electric-blue hover:bg-slate-50"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                  <User className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>App Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                  <span>Help & Support</span>
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
