import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/navigation";
import CampaignCard from "@/components/campaign-card";
import { Link } from "wouter";
import { 
  Plus, 
  Rocket, 
  Users, 
  Heart, 
  FileText,
  TrendingUp,
  Clock,
  Link2,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const campaigns = campaignsData?.campaigns || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="gradient-electric-violet p-6 rounded-3xl text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-blue-100">You have {campaigns.filter(c => c.status === 'active').length} active campaigns generating amazing content</p>
            </div>
            <Link href="/campaigns/new">
              <Button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-xl font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-semibold">Posts Generated</p>
                  <p className="text-3xl font-black text-emerald-900">
                    {statsLoading ? "..." : stats?.stats?.postsGenerated || 0}
                  </p>
                </div>
                <FileText className="text-emerald-500 text-2xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-semibold">Active Campaigns</p>
                  <p className="text-3xl font-black text-blue-900">
                    {statsLoading ? "..." : stats?.stats?.activeCampaigns || 0}
                  </p>
                </div>
                <Rocket className="text-blue-500 text-2xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-semibold">Total Reach</p>
                  <p className="text-3xl font-black text-purple-900">
                    {statsLoading ? "..." : `${(stats?.stats?.totalReach || 0) / 1000}K`}
                  </p>
                </div>
                <Users className="text-purple-500 text-2xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-semibold">Engagement</p>
                  <p className="text-3xl font-black text-orange-900">
                    {statsLoading ? "..." : `${Math.round((stats?.stats?.totalEngagement || 0) / 100)}%`}
                  </p>
                </div>
                <Heart className="text-orange-500 text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Active Campaigns</h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">All</Button>
              <Button variant="ghost" size="sm">Running</Button>
              <Button variant="ghost" size="sm">Paused</Button>
            </div>
          </div>

          {campaignsLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="p-12 text-center">
              <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first campaign to start generating amazing content with AI.</p>
              <Link href="/campaigns/new">
                <Button className="sparkwave-button-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Campaign
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/campaigns/new">
            <Card className="gradient-electric-violet text-white p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-0 text-left">
                <Plus className="text-2xl mb-3" />
                <h3 className="font-bold text-lg mb-2">Create Campaign</h3>
                <p className="text-blue-100 text-sm">Start a new AI-powered content series</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="gradient-emerald-teal text-white p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
            <CardContent className="p-0 text-left">
              <Link2 className="text-2xl mb-3" />
              <h3 className="font-bold text-lg mb-2">Connect Platform</h3>
              <p className="text-emerald-100 text-sm">Link your social media accounts</p>
            </CardContent>
          </Card>
          
          <Link href="/analytics">
            <Card className="gradient-orange-yellow text-white p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-0 text-left">
                <BarChart3 className="text-2xl mb-3" />
                <h3 className="font-bold text-lg mb-2">View Analytics</h3>
                <p className="text-orange-100 text-sm">Deep dive into your performance</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
