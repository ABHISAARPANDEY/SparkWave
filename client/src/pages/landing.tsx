import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  Zap, 
  Rocket, 
  Play, 
  CheckCircle, 
  Lightbulb, 
  Calendar, 
  TrendingUp,
  Plus,
  BarChart3,
  Users,
  Heart,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Clock,
  Target,
  Smile,
  Check,
  ChevronRight,
  Menu,
  X,
  FileText,
  Eye,
  MessageCircle,
  Share,
  Edit,
  Pause,
  ArrowUp
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set());

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedElements(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections for animations
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-electric-violet rounded-xl flex items-center justify-center">
                <Zap className="text-white text-lg" />
              </div>
              <span className="text-2xl font-black text-slate-900">SparkWave</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <Link href="/auth" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Sign In</Link>
              <Link href="/auth">
                <Button className="sparkwave-button-primary">
                  Get Started Free
                </Button>
              </Link>
            </div>

            <button className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="text-slate-600 text-xl" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl font-black text-slate-900">Menu</span>
              <button onClick={toggleMobileMenu}>
                <X className="text-slate-600 text-2xl" />
              </button>
            </div>
            <nav className="space-y-6">
              <a href="#features" className="block text-lg font-semibold text-slate-900 hover:text-electric-blue transition-colors" onClick={toggleMobileMenu}>Features</a>
              <a href="#pricing" className="block text-lg font-semibold text-slate-900 hover:text-electric-blue transition-colors" onClick={toggleMobileMenu}>Pricing</a>
              <Link href="/auth" className="block text-lg font-semibold text-slate-900 hover:text-electric-blue transition-colors" onClick={toggleMobileMenu}>Sign In</Link>
              <Link href="/auth" onClick={toggleMobileMenu}>
                <Button className="w-full sparkwave-button-primary">
                  Get Started Free
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden sparkwave-hero min-h-screen flex items-center" data-animate id="hero">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse-slow"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white opacity-10 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`${animatedElements.has('hero') ? 'animate-fade-in' : 'opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Ignite Your Social.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">One Prompt.</span><br />
              Days of Content.
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform a single idea into weeks of engaging social media posts. AI-powered automation for Instagram, LinkedIn, Facebook, and Twitter/X.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/auth">
                <Button className="bg-white text-spark-violet px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>Start Creating Free</span>
                </Button>
              </Link>
              <Button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-spark-violet transition-all duration-300 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-wrap justify-center items-center gap-4 text-blue-100 text-sm md:text-base">
                <div className="flex items-center">
                  <CheckCircle className="text-spark-emerald w-5 h-5 mr-2" />
                  <span>100% Free to Start</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-spark-emerald w-5 h-5 mr-2" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-spark-emerald w-5 h-5 mr-2" />
                  <span>Open Source AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section id="features" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Your Creative Workflow,
              <span className="text-transparent bg-clip-text gradient-electric-violet"> Supercharged</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From idea to published posts in minutes. See how SparkWave transforms your social media strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <Card className="sparkwave-card bg-gradient-to-br from-blue-50 to-violet-50 border-blue-100">
              <CardContent className="pt-6">
                <div className="w-16 h-16 gradient-electric-violet rounded-2xl flex items-center justify-center mb-6">
                  <Lightbulb className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Generation</h3>
                <p className="text-slate-600 mb-6">
                  One prompt becomes 30 unique posts. Our free AI models create engaging, platform-optimized content that never repeats.
                </p>
                <div className="flex items-center text-spark-violet font-semibold">
                  <span>Powered by open-source AI</span>
                  <ChevronRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="sparkwave-card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <CardContent className="pt-6">
                <div className="w-16 h-16 gradient-emerald-teal rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Scheduling</h3>
                <p className="text-slate-600 mb-6">
                  Set your posting times once. SparkWave automatically publishes to all your connected platforms at optimal moments.
                </p>
                <div className="flex items-center text-spark-emerald font-semibold">
                  <span>Automate everything</span>
                  <ChevronRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="sparkwave-card bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-100">
              <CardContent className="pt-6">
                <div className="w-16 h-16 gradient-orange-yellow rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Campaign Tracking</h3>
                <p className="text-slate-600 mb-6">
                  Monitor your campaigns with beautiful progress tracking, engagement metrics, and performance insights.
                </p>
                <div className="flex items-center text-spark-orange font-semibold">
                  <span>Track your success</span>
                  <ChevronRight className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50" data-animate id="dashboard-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Your Command Center
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A beautiful, intuitive dashboard that makes content creation feel effortless.
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Dashboard header */}
            <div className="gradient-electric-violet p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Welcome back, Creator! 👋</h3>
                  <p className="text-blue-100">You have 3 active campaigns generating amazing content</p>
                </div>
                <Button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl font-semibold transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  New Campaign
                </Button>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6">
              {/* Stats cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-emerald-50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 text-sm font-semibold">Posts Generated</p>
                      <p className="text-3xl font-black text-emerald-900">847</p>
                    </div>
                    <FileText className="text-emerald-500 text-2xl" />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-semibold">Active Campaigns</p>
                      <p className="text-3xl font-black text-blue-900">12</p>
                    </div>
                    <Rocket className="text-blue-500 text-2xl" />
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-semibold">Total Reach</p>
                      <p className="text-3xl font-black text-purple-900">24.5K</p>
                    </div>
                    <Users className="text-purple-500 text-2xl" />
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-semibold">Engagement</p>
                      <p className="text-3xl font-black text-orange-900">+23%</p>
                    </div>
                    <Heart className="text-orange-500 text-2xl" />
                  </div>
                </div>
              </div>

              {/* Sample Campaign Cards */}
              <div className="mb-8">
                <h4 className="text-2xl font-bold text-slate-900 mb-6">Active Campaigns</h4>
                
                <div className="grid gap-6">
                  {/* Campaign 1 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h5 className="text-xl font-bold text-slate-900 mb-2">💡 Daily AI Innovation Tips</h5>
                        <p className="text-slate-600 mb-4">Educational content about AI trends and innovations for tech professionals</p>
                        
                        <div className="flex space-x-2 mb-4">
                          <Badge className="bg-blue-100 text-blue-800">LinkedIn</Badge>
                          <Badge className="bg-purple-100 text-purple-800">Twitter</Badge>
                          <Badge className="bg-pink-100 text-pink-800">Facebook</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Pause className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress: 8 of 30 days</span>
                        <span>26% complete</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-3">
                        <div className="gradient-electric-violet h-3 rounded-full" style={{width: "26%"}}></div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 gradient-electric-violet rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 mb-1">Next post in 4 hours</p>
                          <p className="text-slate-800">"🚀 Did you know? The latest AI models can now understand context across multiple languages simultaneously. This breakthrough is revolutionizing global communication tools! What's your favorite AI innovation this year? #AI #Innovation #TechTrends"</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />Est. 45 views</span>
                            <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />8 comments</span>
                            <span className="flex items-center"><Share className="w-4 h-4 mr-1" />12 shares</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campaign 2 - Completed */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h5 className="text-xl font-bold text-slate-900 mb-2">🌟 Motivational Monday Series</h5>
                        <p className="text-slate-600 mb-4">Weekly inspirational quotes and stories to boost follower engagement</p>
                        
                        <div className="flex space-x-2 mb-4">
                          <Badge className="bg-pink-100 text-pink-800">Instagram</Badge>
                          <Badge className="bg-blue-100 text-blue-800">Facebook</Badge>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress: 12 of 12 weeks</span>
                        <span>100% complete</span>
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-3">
                        <div className="gradient-emerald-teal h-3 rounded-full" style={{width: "100%"}}></div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 gradient-emerald-teal rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="text-white text-sm" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-emerald-600 mb-1">Campaign Completed Successfully!</p>
                          <p className="text-slate-600 text-sm">Generated 84 posts across 12 weeks with an average engagement rate of 4.2%</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />15.2K total views</span>
                            <span className="flex items-center"><Heart className="w-4 h-4 mr-1" />642 total likes</span>
                            <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" />89 comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="gradient-electric-violet text-white p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <Plus className="text-2xl mb-3" />
                  <h6 className="font-bold text-lg mb-2">Create Campaign</h6>
                  <p className="text-blue-100 text-sm">Start a new AI-powered content series</p>
                </div>
                
                <div className="gradient-emerald-teal text-white p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <Plus className="text-2xl mb-3" />
                  <h6 className="font-bold text-lg mb-2">Connect Platform</h6>
                  <p className="text-emerald-100 text-sm">Link your social media accounts</p>
                </div>
                
                <div className="gradient-orange-yellow text-white p-6 rounded-2xl cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <BarChart3 className="text-2xl mb-3" />
                  <h6 className="font-bold text-lg mb-2">View Analytics</h6>
                  <p className="text-orange-100 text-sm">Deep dive into your performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Platform Integration */}
      <section className="py-20 bg-white" data-animate id="platforms">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              One Dashboard,
              <span className="text-transparent bg-clip-text gradient-electric-violet"> All Platforms</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Connect your social media accounts and publish everywhere with a single click.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Instagram */}
            <Card className="sparkwave-card bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100 text-center">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Instagram className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Instagram</h4>
                <p className="text-slate-600 text-sm mb-4">Stories, posts, and Reels optimized for engagement</p>
                <Badge className="bg-spark-emerald text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready to Connect
                </Badge>
              </CardContent>
            </Card>

            {/* LinkedIn */}
            <Card className="sparkwave-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 text-center">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Linkedin className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">LinkedIn</h4>
                <p className="text-slate-600 text-sm mb-4">Professional content that builds your network</p>
                <Badge className="bg-spark-emerald text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready to Connect
                </Badge>
              </CardContent>
            </Card>

            {/* Twitter/X */}
            <Card className="sparkwave-card bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 text-center">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-700 to-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Twitter className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Twitter/X</h4>
                <p className="text-slate-600 text-sm mb-4">Threads and tweets that spark conversations</p>
                <Badge className="bg-spark-emerald text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready to Connect
                </Badge>
              </CardContent>
            </Card>

            {/* Facebook */}
            <Card className="sparkwave-card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 text-center">
              <CardContent className="pt-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Facebook className="text-white text-3xl" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Facebook</h4>
                <p className="text-slate-600 text-sm mb-4">Reach your community with targeted posts</p>
                <Badge className="bg-spark-emerald text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready to Connect
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Coming soon banner */}
          <div className="gradient-orange-yellow p-8 rounded-3xl text-center text-white">
            <h3 className="text-3xl font-bold mb-4">🚀 Coming Soon: Video & Image Automation!</h3>
            <p className="text-xl text-orange-100 mb-6">
              We're working on AI-generated visuals and video content to take your social media to the next level.
            </p>
            <Button className="bg-white text-spark-orange px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Start Free,
              <span className="text-transparent bg-clip-text gradient-electric-violet"> Scale as You Grow</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built on free, open-source AI technology. Upgrade when you're ready for premium features and support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 p-8 rounded-3xl border-2 border-slate-200">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Spark</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black text-slate-900">$0</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-slate-600">Perfect for getting started</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>3 active campaigns</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>2 social platforms</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Open-source AI models</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Community support</span>
                  </li>
                </ul>

                <Link href="/auth" className="block">
                  <Button className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-4 px-6 rounded-2xl transition-all">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="gradient-electric-violet p-8 rounded-3xl text-white relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-spark-orange text-white px-6 py-2 rounded-full text-sm font-bold">
                  Most Popular
                </Badge>
              </div>
              
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Wave</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black">$19</span>
                    <span className="text-blue-200">/month</span>
                  </div>
                  <p className="text-blue-100">For growing creators</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Unlimited campaigns</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>All social platforms</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Premium AI models</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Custom scheduling</span>
                  </li>
                </ul>

                <Button className="w-full bg-white text-electric-blue font-bold py-4 px-6 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                  Start Wave Plan
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 p-8 rounded-3xl border-2 border-slate-200">
              <CardContent className="p-0">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Thunder</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-black text-slate-900">$49</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <p className="text-slate-600">For agencies and teams</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Everything in Wave</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>White-label options</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center text-slate-700">
                    <Check className="text-spark-emerald mr-3 w-5 h-5" />
                    <span>Dedicated support</span>
                  </li>
                </ul>

                <Button className="w-full sparkwave-button-primary">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Note about open source */}
          <div className="text-center mt-12">
            <div className="gradient-emerald-teal text-white p-6 rounded-2xl inline-block">
              <p className="font-semibold">
                <span className="mr-2">🔧</span>
                Built on open-source AI technology - start completely free and upgrade when you need premium features
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 gradient-electric-violet rounded-xl flex items-center justify-center">
                  <Zap className="text-white text-xl" />
                </div>
                <span className="text-3xl font-black">SparkWave</span>
              </div>
              <p className="text-slate-300 text-lg mb-6 max-w-md">
                Ignite your social media presence with AI-powered content creation. One prompt becomes weeks of engaging posts.
              </p>
              <div className="flex space-x-4">
                <Button className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center">
                  <Twitter className="text-xl" />
                </Button>
                <Button className="w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center">
                  <Linkedin className="text-xl" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h5 className="font-bold text-xl mb-6">Product</h5>
              <ul className="space-y-3 text-slate-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-bold text-xl mb-6">Support</h5>
              <ul className="space-y-3 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 mb-4 md:mb-0">
                © 2024 SparkWave. Made with ❤️ for creators everywhere.
              </p>
              <div className="flex space-x-6 text-slate-400 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
