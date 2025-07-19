import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import CampaignCard from "@/components/campaign-card";
import { Link } from "wouter";
import { Plus, Search, Filter, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const campaigns = campaignsData?.campaigns || [];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Campaigns</h1>
            <p className="text-slate-600">Manage your AI-powered content campaigns</p>
          </div>
          <Link href="/campaigns/new">
            <Button className="sparkwave-button-primary mt-4 sm:mt-0">
              <Plus className="w-5 h-5 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "paused" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("paused")}
                >
                  Paused
                </Button>
                <Button
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="sparkwave-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-slate-900">{campaigns.length}</div>
              <div className="text-sm text-slate-600">Total Campaigns</div>
            </CardContent>
          </Card>
          <Card className="sparkwave-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {campaigns.filter(c => c.status === "active").length}
              </div>
              <div className="text-sm text-slate-600">Active</div>
            </CardContent>
          </Card>
          <Card className="sparkwave-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {campaigns.filter(c => c.status === "paused").length}
              </div>
              <div className="text-sm text-slate-600">Paused</div>
            </CardContent>
          </Card>
          <Card className="sparkwave-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {campaigns.filter(c => c.status === "completed").length}
              </div>
              <div className="text-sm text-slate-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        {isLoading ? (
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
        ) : filteredCampaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {campaigns.length === 0 ? "No campaigns yet" : "No campaigns match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {campaigns.length === 0 
                ? "Create your first campaign to start generating amazing content with AI."
                : "Try adjusting your search terms or filters."
              }
            </p>
            {campaigns.length === 0 && (
              <Link href="/campaigns/new">
                <Button className="sparkwave-button-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Campaign
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} showActions />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
