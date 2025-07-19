import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { FaGoogle, FaLinkedin } from "react-icons/fa";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });
  const { toast } = useToast();
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; username: string; fullName: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Account created!",
        description: "Welcome to SparkWave. Let's get started!",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      registerMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSocialAuth = (provider: string) => {
    // This would integrate with actual OAuth providers
    toast({
      title: "Coming Soon!",
      description: `${provider} authentication will be available soon.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-electric-blue opacity-10 rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-spark-violet opacity-10 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>

        <Card className="sparkwave-card">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 gradient-electric-violet rounded-xl flex items-center justify-center">
                <Zap className="text-white text-xl" />
              </div>
              <span className="text-2xl font-black text-slate-900">SparkWave</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isLogin ? "Welcome back!" : "Join SparkWave"}
            </CardTitle>
            <p className="text-slate-600">
              {isLogin 
                ? "Sign in to continue your content creation journey" 
                : "Start creating amazing social media content with AI"
              }
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Auth Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full py-3 border-2 hover:bg-red-50 hover:border-red-200"
                onClick={() => handleSocialAuth("Google")}
              >
                <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full py-3 border-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => handleSocialAuth("LinkedIn")}
              >
                <FaLinkedin className="w-5 h-5 mr-3 text-blue-600" />
                Continue with LinkedIn
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-slate-500">or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 font-semibold">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="pl-10 sparkwave-input"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700 font-semibold">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="pl-10 sparkwave-input"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 sparkwave-input"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 sparkwave-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full sparkwave-button-primary py-3"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {(loginMutation.isPending || registerMutation.isPending) 
                  ? "Loading..." 
                  : (isLogin ? "Sign In" : "Create Account")
                }
              </Button>
            </form>

            {/* Toggle between login/register */}
            <div className="text-center pt-4">
              <p className="text-slate-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-electric-blue font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Free features reminder */}
            {!isLogin && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                <p className="text-emerald-700 font-semibold text-sm">
                  🎉 Free forever plan includes 3 campaigns, 2 platforms, and open-source AI!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
