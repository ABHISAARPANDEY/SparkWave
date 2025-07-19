import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  FileText,
  Eye,
  MessageCircle,
  Share,
  Calendar,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  Bot,
  Github,
  Zap,
  Globe
} from "lucide-react";

export default function Analytics() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const campaigns = campaignsData?.campaigns || [];
  const dashboardStats = stats?.stats || {};

  const topPerformingCampaigns = campaigns
    .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
    .slice(0, 5);

  const engagementTrend = "+12.5%"; // This would come from actual analytics
  const reachTrend = "+8.3%";
  const postsTrend = "+25%";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">📊 Analytics Dashboard</h1>
          <p className="text-slate-600">Track your social media performance and campaign success</p>
        </div>

        {/* AI & OAuth Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="sparkwave-card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Github className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-purple-800">GitHub AI Integration</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">Enhanced Mode</p>
                  <p className="text-sm text-purple-700 mt-1">Using advanced AI models for content generation</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sparkwave-card bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-800">Connected Platforms</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">4 Platforms</p>
                  <p className="text-sm text-emerald-700 mt-1">Instagram, LinkedIn, Facebook, Twitter</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="sparkwave-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Reach</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : `${Math.round((dashboardStats.totalReach || 0) / 1000)}K`}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">{reachTrend}</span>
                    <span className="text-sm text-slate-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sparkwave-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Engagement</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : dashboardStats.totalEngagement || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">{engagementTrend}</span>
                    <span className="text-sm text-slate-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sparkwave-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Posts Published</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : dashboardStats.postsPublished || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">{postsTrend}</span>
                    <span className="text-sm text-slate-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sparkwave-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Campaigns</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {statsLoading ? "..." : dashboardStats.activeCampaigns || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    <Activity className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">Running now</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Breakdown */}
          <Card className="sparkwave-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Engagement Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-pink-500 mr-3" />
                    <span className="font-medium">Likes</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">1,247</div>
                    <div className="text-sm text-slate-500">65%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{width: "65%"}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="font-medium">Comments</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">342</div>
                    <div className="text-sm text-slate-500">18%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: "18%"}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Share className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="font-medium">Shares</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">156</div>
                    <div className="text-sm text-slate-500">8%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: "8%"}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-orange-500 mr-3" />
                    <span className="font-medium">Views</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">89</div>
                    <div className="text-sm text-slate-500">5%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: "5%"}}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Performance */}
          <Card className="sparkwave-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Platform Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-lg mr-3"></div>
                    <div>
                      <div className="font-medium">Instagram</div>
                      <div className="text-sm text-slate-500">654 engagements</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">+15.2%</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
                    <div>
                      <div className="font-medium">LinkedIn</div>
                      <div className="text-sm text-slate-500">423 engagements</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">+8.7%</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-black rounded-lg mr-3"></div>
                    <div>
                      <div className="font-medium">Twitter/X</div>
                      <div className="text-sm text-slate-500">298 engagements</div>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">-2.1%</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg mr-3"></div>
                    <div>
                      <div className="font-medium">Facebook</div>
                      <div className="text-sm text-slate-500">178 engagements</div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">+5.3%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Performance & Real-time Analytics */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="sparkwave-card bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-purple-600" />
                AI Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Github className="w-5 h-5 text-gray-700 mr-3" />
                    <div>
                      <div className="font-medium">GitHub GPT-2</div>
                      <div className="text-sm text-slate-500">Primary model</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">98.5%</div>
                    <div className="text-sm text-slate-500">Success rate</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <div className="font-medium">Enhanced AI Mode</div>
                      <div className="text-sm text-slate-500">Advanced features</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">Enabled</div>
                    <div className="text-sm text-slate-500">Active</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium">Content Quality Score</div>
                      <div className="text-sm text-slate-500">AI-generated content</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">9.2/10</div>
                    <div className="text-sm text-slate-500">Average rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sparkwave-card bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-emerald-600" />
                Instant Publishing Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                    <div>
                      <div className="font-medium">Instant Posts Today</div>
                      <div className="text-sm text-slate-500">Published immediately</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">12</div>
                    <div className="text-sm text-slate-500">posts</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-emerald-500 mr-3" />
                    <div>
                      <div className="font-medium">Avg. Response Time</div>
                      <div className="text-sm text-slate-500">From creation to publish</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">2.3s</div>
                    <div className="text-sm text-slate-500">seconds</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium">Instant vs Scheduled</div>
                      <div className="text-sm text-slate-500">Post type ratio</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">65/35</div>
                    <div className="text-sm text-slate-500">percent split</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Campaigns */}
        <Card className="sparkwave-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Top Performing Campaigns
              </div>
              <Link href="/campaigns">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : topPerformingCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-4">Create your first campaign to see performance analytics.</p>
                <Link href="/campaigns/new">
                  <Button className="sparkwave-button-primary">Create Campaign</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topPerformingCampaigns.map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 gradient-electric-violet rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{campaign.title}</h4>
                        <p className="text-sm text-slate-600">{campaign.platforms.join(", ")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {Math.floor(Math.random() * 1000 + 500)} engagements
                      </div>
                      <div className="text-sm text-emerald-600">+{Math.floor(Math.random() * 20 + 5)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="sparkwave-card cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Schedule Report</h3>
              <p className="text-slate-600 text-sm mb-4">Get weekly analytics delivered to your email</p>
              <Button variant="outline" className="w-full">Set Up</Button>
            </CardContent>
          </Card>

          <Card className="sparkwave-card cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Export Data</h3>
              <p className="text-slate-600 text-sm mb-4">Download your analytics data as CSV or PDF</p>
              <Button variant="outline" className="w-full">Export</Button>
            </CardContent>
          </Card>

          <Card className="sparkwave-card cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Best Times</h3>
              <p className="text-slate-600 text-sm mb-4">Optimize your posting schedule for maximum reach</p>
              <Button variant="outline" className="w-full">Analyze</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
