import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/progress-bar";
import PostPreview from "@/components/post-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Campaign, Post } from "@shared/schema";
import { format, isAfter } from "date-fns";
import { 
  Play, 
  Pause, 
  Edit, 
  MoreHorizontal, 
  Clock, 
  ThumbsUp, 
  MessageCircle, 
  Share,
  CheckCircle,
  Calendar,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CampaignCardProps {
  campaign: Campaign;
  showActions?: boolean;
}

export default function CampaignCard({ campaign, showActions = false }: CampaignCardProps) {
  const { toast } = useToast();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/campaigns", campaign.id, "posts"],
  });

  const posts = postsData?.posts || [];
  const publishedPosts = posts.filter((p: Post) => p.status === "published");
  const failedPosts = posts.filter((p: Post) => p.status === "failed");
  const scheduledPosts = posts.filter((p: Post) => p.status === "scheduled");
  
  const totalPosts = campaign.duration;
  const completedPosts = publishedPosts.length;
  const progress = totalPosts > 0 ? (completedPosts / totalPosts) * 100 : 0;

  // Find the next scheduled post
  const upcomingPosts = scheduledPosts
    .filter((p: Post) => isAfter(new Date(p.scheduledAt), new Date()))
    .sort((a: Post, b: Post) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  
  const nextPost = upcomingPosts[0];

  const updateCampaignMutation = useMutation({
    mutationFn: async (updates: Partial<Campaign>) => {
      const response = await apiRequest("PATCH", `/api/campaigns/${campaign.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign updated",
        description: "Your campaign status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Unable to update campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = () => {
    if (updateCampaignMutation.isPending) return;
    
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateCampaignMutation.mutate({ status: newStatus });
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white";
      case "linkedin":
        return "bg-blue-600 text-white";
      case "twitter":
      case "x":
        return "bg-black text-white";
      case "facebook":
        return "bg-blue-500 text-white";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "paused":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-4 h-4" />;
      case "paused":
        return <Pause className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const totalEngagement = publishedPosts.reduce((sum: number, post: Post) => {
    const engagement = post.engagement as any;
    return sum + (engagement?.likes || 0) + (engagement?.comments || 0) + (engagement?.shares || 0);
  }, 0);

  const avgEngagement = publishedPosts.length > 0 ? Math.round(totalEngagement / publishedPosts.length) : 0;

  return (
    <Card className="sparkwave-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900">{campaign.title}</h3>
              <Badge className={`${getStatusColor(campaign.status || "active")} flex items-center space-x-1`}>
                {getStatusIcon(campaign.status || "active")}
                <span className="capitalize">{campaign.status || "active"}</span>
              </Badge>
              {failedPosts.length > 0 && (
                <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{failedPosts.length} failed</span>
                </Badge>
              )}
            </div>
            <p className="text-slate-600 mb-4 line-clamp-2">{campaign.description || campaign.prompt}</p>
            
            {/* Platform badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {campaign.platforms.map((platform) => (
                <Badge key={platform} className={`${getPlatformBadgeColor(platform)} text-xs`}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Badge>
              ))}
            </div>

            {/* Campaign stats */}
            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{campaign.duration} days</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{campaign.postingTime}</span>
              </div>
              {avgEngagement > 0 && (
                <div className="flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  <span>{avgEngagement} avg engagement</span>
                </div>
              )}
            </div>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={updateCampaignMutation.isPending}>
                  {updateCampaignMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="w-4 h-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {campaign.status === "active" ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Campaign
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Campaign
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
            <span>Progress: {completedPosts} of {totalPosts} posts published</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <ProgressBar 
            progress={progress} 
            color={campaign.status === "completed" ? "emerald" : 
                   campaign.status === "paused" ? "orange" : "blue"} 
          />
          
          {/* Progress details */}
          {posts.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <div className="flex space-x-4">
                <span>✅ {publishedPosts.length} published</span>
                <span>⏰ {scheduledPosts.length} scheduled</span>
                {failedPosts.length > 0 && (
                  <span className="text-red-600">❌ {failedPosts.length} failed</span>
                )}
              </div>
              <span>Created {format(new Date(campaign.createdAt), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Campaign Status Content */}
        {postsLoading ? (
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="animate-pulse flex space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : campaign.status === "completed" ? (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 gradient-electric-violet rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-white text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-600 mb-1">Campaign Completed Successfully! 🎉</p>
                <p className="text-slate-600 text-sm mb-2">
                  Generated {posts.length} posts across {campaign.duration} days with {avgEngagement > 0 ? `${avgEngagement} average engagement per post.` : 'great results!'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span className="flex items-center">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {publishedPosts.reduce((sum: number, p: Post) => sum + ((p.engagement as any)?.likes || 0), 0)} total likes
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {publishedPosts.reduce((sum: number, p: Post) => sum + ((p.engagement as any)?.comments || 0), 0)} comments
                  </span>
                  <span className="flex items-center">
                    <Share className="w-4 h-4 mr-1" />
                    {publishedPosts.reduce((sum: number, p: Post) => sum + ((p.engagement as any)?.shares || 0), 0)} shares
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : nextPost ? (
          <PostPreview post={nextPost} showActions={showActions} />
        ) : posts.length === 0 ? (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              <div>
                <p className="text-blue-600 font-medium">Generating AI content...</p>
                <p className="text-sm text-slate-500">Our AI is creating unique posts for your campaign. This may take a few moments.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-slate-600 font-medium">
                  {campaign.status === "paused" ? "Campaign paused" : "No upcoming posts"}
                </p>
                <p className="text-sm text-slate-500">
                  {campaign.status === "paused" 
                    ? "Resume the campaign to continue publishing" 
                    : "All posts have been published or are being processed"
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
