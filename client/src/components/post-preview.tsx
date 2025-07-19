import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Post } from "@shared/schema";
import { 
  Clock, 
  Edit, 
  Check, 
  ThumbsUp, 
  MessageCircle, 
  Share,
  Eye,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostPreviewProps {
  post: Post;
  showActions?: boolean;
}

export default function PostPreview({ post, showActions = true }: PostPreviewProps) {
  const { toast } = useToast();

  const updatePostMutation = useMutation({
    mutationFn: async (updates: Partial<Post>) => {
      const response = await apiRequest("PATCH", `/api/posts/${post.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Unable to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approvePostMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/approve`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Post approved!",
        description: "Your post has been scheduled for publishing.",
      });
    },
    onError: () => {
      toast({
        title: "Approval failed",
        description: "Unable to approve post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    approvePostMutation.mutate();
  };

  const handleEdit = () => {
    // This would open an edit modal/form
    toast({
      title: "Edit functionality",
      description: "Post editing will be available soon.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-purple-100 text-purple-800";
      case "draft":
        return "bg-slate-100 text-slate-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "📷";
      case "linkedin":
        return "💼";
      case "twitter":
      case "x":
        return "🐦";
      case "facebook":
        return "📘";
      default:
        return "📱";
    }
  };

  const timeToPost = post.scheduledAt 
    ? formatDistanceToNow(new Date(post.scheduledAt), { addSuffix: true })
    : "";

  const engagement = post.engagement as any;

  return (
    <Card className="sparkwave-card">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 gradient-electric-violet rounded-full flex items-center justify-center flex-shrink-0">
            {post.status === "published" ? (
              <Check className="text-white text-sm" />
            ) : (
              <Clock className="text-white text-sm" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                <Badge className={getStatusColor(post.status || "draft")}>
                  {post.status || "draft"}
                </Badge>
                <span className="text-sm text-slate-500 capitalize">{post.platform}</span>
              </div>
              
              {post.scheduledAt && (
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {post.status === "published" ? "Published" : "Posts"} {timeToPost}
                </div>
              )}
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3">
              <p className="text-slate-800 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {/* Engagement metrics for published posts */}
            {post.status === "published" && engagement && (
              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                <span className="flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {engagement.likes || 0}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {engagement.comments || 0}
                </span>
                <span className="flex items-center">
                  <Share className="w-4 h-4 mr-1" />
                  {engagement.shares || 0}
                </span>
                {engagement.reach && (
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {engagement.reach}
                  </span>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            {showActions && post.status === "scheduled" && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleApprove}
                  disabled={approvePostMutation.isPending}
                  className="sparkwave-button-primary text-sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  {approvePostMutation.isPending ? "Approving..." : "Approve"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleEdit}
                  className="text-sm"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
            
            {/* Error message for failed posts */}
            {post.status === "failed" && post.errorMessage && (
              <div className="bg-red-50 p-2 rounded-lg border border-red-200 mt-2">
                <p className="text-red-600 text-sm">{post.errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
