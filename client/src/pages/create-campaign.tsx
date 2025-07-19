import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/navigation";
import PlatformSelector from "@/components/platform-selector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCampaignSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Clock, 
  Target,
  Lightbulb,
  Heart,
  Smile,
  X,
  Zap,
  Bot,
  Plus,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { SiInstagram, SiLinkedin, SiFacebook, SiX } from "react-icons/si";
import { z } from "zod";

const campaignFormSchema = insertCampaignSchema.omit({ userId: true }).extend({
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  postInstantly: z.boolean().optional(),
  enhancedAI: z.boolean().optional(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

const CONTENT_STYLES = [
  {
    id: "professional",
    name: "Professional",
    description: "Expert insights and industry knowledge",
    icon: Lightbulb,
  },
  {
    id: "inspirational", 
    name: "Inspirational",
    description: "Motivational and uplifting content",
    icon: Heart,
  },
  {
    id: "casual",
    name: "Casual", 
    description: "Friendly and conversational tone",
    icon: Smile,
  },
];

export default function CreateCampaign() {
  const [step, setStep] = useState(0); // Start with step 0 for social connection check
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle OAuth success/error messages from URL parameters
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');
    const message = urlParams.get('message');

    if (connected) {
      toast({
        title: `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected!`,
        description: "Your account has been successfully connected. You can now create campaigns.",
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      toast({
        title: "Connection failed",
        description: message || "There was an error connecting your account. Please try again.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  // Fetch connected social accounts
  const { data: socialAccountsData, isLoading: socialAccountsLoading } = useQuery({
    queryKey: ["/api/social-accounts"],
  });

  const accounts = socialAccountsData?.accounts || [];
  const availablePlatforms = accounts.filter(account => account.isActive);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      prompt: "",
      description: "",
      platforms: [],
      duration: 30,
      postingTime: "15:00",
      postInstantly: false,
      enhancedAI: false,
      contentStyle: "professional",
      status: "active",
      isActive: true,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created!",
        description: "Your AI is now generating amazing content for your campaign.",
      });
      setLocation("/campaigns");
    },
    onError: () => {
      toast({
        title: "Failed to create campaign",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate({
      ...data,
      platforms: selectedPlatforms,
    });
  };

  const nextStep = () => {
    if (step === 0) {
      // Check if user has connected accounts
      if (availablePlatforms.length === 0) {
        toast({
          title: "Connect social media accounts first",
          description: "You need to connect at least one social platform to create campaigns.",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 1) {
      // Validate step 1 fields
      const { prompt, title, duration, postingTime, contentStyle } = form.getValues();
      if (!prompt || !title) {
        toast({
          title: "Please fill in all required fields",
          description: "Campaign prompt and title are required.",
          variant: "destructive",
        });
        return;
      }
    } else if (step === 2) {
      // Validate step 2 fields
      if (selectedPlatforms.length === 0) {
        toast({
          title: "Select at least one platform",
          description: "Choose where you want to publish your content.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(step + 1);
  };

  // OAuth connection functions
  const connectInstagram = () => {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || "your-instagram-client-id";
    const redirectUri = `${window.location.origin}/auth/instagram/callback`;
    const scope = "user_profile,user_media";
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    window.open(authUrl, "_blank", "width=600,height=600");
  };

  const connectLinkedIn = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID || "your-linkedin-client-id";
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
    const scope = "r_liteprofile r_emailaddress w_member_social";
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.open(authUrl, "_blank", "width=600,height=600");
  };

  const connectFacebook = () => {
    const clientId = import.meta.env.VITE_FACEBOOK_CLIENT_ID || "your-facebook-client-id";
    const redirectUri = `${window.location.origin}/auth/facebook/callback`;
    const scope = "pages_manage_posts,pages_read_engagement";
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    window.open(authUrl, "_blank", "width=600,height=600");
  };

  const connectTwitter = () => {
    const clientId = import.meta.env.VITE_TWITTER_CLIENT_ID || "your-twitter-client-id";
    const redirectUri = `${window.location.origin}/auth/twitter/callback`;
    const scope = "tweet.read tweet.write users.read";
    const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=state`;
    window.open(authUrl, "_blank", "width=600,height=600");
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/campaigns">
            <Button variant="ghost" className="mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">✨ Create New Campaign</h1>
            <p className="text-slate-600">Turn your ideas into engaging social media content</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8 overflow-x-auto">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              step >= 0 ? "gradient-electric-violet" : "bg-slate-200"
            }`}>
              1
            </div>
            <span className={`ml-2 font-semibold text-sm ${step >= 0 ? "text-slate-900" : "text-slate-500"}`}>
              Connect Accounts
            </span>
          </div>
          <div className={`w-8 h-1 rounded-full ${step >= 1 ? "gradient-electric-violet" : "bg-slate-200"}`}></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              step >= 1 ? "gradient-electric-violet" : "bg-slate-200"
            }`}>
              2
            </div>
            <span className={`ml-2 font-semibold text-sm ${step >= 1 ? "text-slate-900" : "text-slate-500"}`}>
              Campaign Details
            </span>
          </div>
          <div className={`w-8 h-1 rounded-full ${step >= 2 ? "gradient-electric-violet" : "bg-slate-200"}`}></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              step >= 2 ? "gradient-electric-violet" : "bg-slate-200"
            }`}>
              3
            </div>
            <span className={`ml-2 font-medium text-sm ${step >= 2 ? "text-slate-900" : "text-slate-500"}`}>
              Platforms
            </span>
          </div>
          <div className={`w-8 h-1 rounded-full ${step >= 3 ? "gradient-electric-violet" : "bg-slate-200"}`}></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
              step >= 3 ? "gradient-electric-violet" : "bg-slate-200"
            }`}>
              4
            </div>
            <span className={`ml-2 font-medium text-sm ${step >= 3 ? "text-slate-900" : "text-slate-500"}`}>
              Review
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="sparkwave-card">
            <CardHeader className="gradient-electric-violet text-white">
              <CardTitle className="text-2xl flex items-center">
                {step === 0 && (
                  <>
                    <ExternalLink className="w-6 h-6 mr-2" />
                    Connect Your Social Media Accounts
                  </>
                )}
                {step === 1 && (
                  <>
                    <Target className="w-6 h-6 mr-2" />
                    What do you want to share with the world?
                  </>
                )}
                {step === 2 && (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    Choose Your Platforms
                  </>
                )}
                {step === 3 && (
                  <>
                    <Calendar className="w-6 h-6 mr-2" />
                    Review & Launch
                  </>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Step 0: Social Account Connection */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      Connect your social media accounts to get started
                    </h3>
                    <p className="text-slate-600 text-lg">
                      We'll use OAuth to securely connect your accounts so we can post content automatically.
                    </p>
                  </div>

                  {socialAccountsLoading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-gray-200 rounded-xl"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Instagram Connection */}
                      <Card className="border-2 border-dashed border-gray-300 hover:border-pink-400 transition-colors cursor-pointer" onClick={connectInstagram}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                                <SiInstagram className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">Instagram</h4>
                                <p className="text-sm text-slate-500">Connect your Instagram account</p>
                              </div>
                            </div>
                            {availablePlatforms.some(p => p.platform === 'instagram') ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Plus className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* LinkedIn Connection */}
                      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer" onClick={connectLinkedIn}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                                <SiLinkedin className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">LinkedIn</h4>
                                <p className="text-sm text-slate-500">Connect your LinkedIn account</p>
                              </div>
                            </div>
                            {availablePlatforms.some(p => p.platform === 'linkedin') ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Plus className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Facebook Connection */}
                      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-600 transition-colors cursor-pointer" onClick={connectFacebook}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                                <SiFacebook className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">Facebook</h4>
                                <p className="text-sm text-slate-500">Connect your Facebook page</p>
                              </div>
                            </div>
                            {availablePlatforms.some(p => p.platform === 'facebook') ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Plus className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Twitter Connection */}
                      <Card className="border-2 border-dashed border-gray-300 hover:border-slate-800 transition-colors cursor-pointer" onClick={connectTwitter}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mr-4">
                                <SiX className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">Twitter/X</h4>
                                <p className="text-sm text-slate-500">Connect your Twitter account</p>
                              </div>
                            </div>
                            {availablePlatforms.some(p => p.platform === 'twitter') ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Plus className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {availablePlatforms.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">
                          {availablePlatforms.length} account{availablePlatforms.length > 1 ? 's' : ''} connected
                        </span>
                      </div>
                    </div>
                  )}

                  {availablePlatforms.length === 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-medium text-orange-800">
                          Please connect at least one social media account to continue
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Campaign Details */}
              {step === 1 && (
                <>
                  {/* Campaign Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg font-bold text-slate-900">
                      📝 Campaign Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Daily AI Innovation Tips"
                      {...form.register("title")}
                      className="sparkwave-input"
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  {/* Campaign Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-lg font-bold text-slate-900">
                      🎯 Content Theme
                    </Label>
                    <Textarea
                      id="prompt"
                      rows={4}
                      placeholder="Describe your content theme... e.g., 'Daily productivity tips for remote workers' or 'Inspirational quotes about entrepreneurship'"
                      {...form.register("prompt")}
                      className="sparkwave-input resize-none"
                    />
                    <p className="text-sm text-slate-500">💡 Tip: Be specific! Better prompts create more engaging content.</p>
                    {form.formState.errors.prompt && (
                      <p className="text-red-500 text-sm">{form.formState.errors.prompt.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-lg font-bold text-slate-900">
                      📄 Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      rows={2}
                      placeholder="Brief description of your campaign goals..."
                      {...form.register("description")}
                      className="sparkwave-input resize-none"
                    />
                  </div>

                  {/* Campaign Settings */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-lg font-bold text-slate-900">
                        📅 Campaign Duration
                      </Label>
                      <Select onValueChange={(value) => form.setValue("duration", parseInt(value))}>
                        <SelectTrigger className="sparkwave-input">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Post instantly</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postingTime" className="text-lg font-bold text-slate-900">
                        ⏰ Posting Time
                      </Label>
                      <Select 
                        onValueChange={(value) => {
                          form.setValue("postingTime", value);
                          form.setValue("postInstantly", value === "instant");
                        }}
                      >
                        <SelectTrigger className="sparkwave-input">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-yellow-500" />
                              Post instantly
                            </div>
                          </SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="15:00">3:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* AI Enhancement Options */}
                  <div className="space-y-4">
                    <Label className="text-lg font-bold text-slate-900">
                      🤖 AI Enhancement Options
                    </Label>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <Bot className="h-6 w-6 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-slate-900">Enhanced AI Content Generation</h4>
                            <p className="text-sm text-slate-600 mt-1">
                              Use advanced GitHub AI models for higher quality, more creative content generation with better context understanding.
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={form.watch("enhancedAI")}
                          onCheckedChange={(checked) => form.setValue("enhancedAI", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Style */}
                  <div className="space-y-4">
                    <Label className="text-lg font-bold text-slate-900">
                      🎨 Content Style
                    </Label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {CONTENT_STYLES.map((style) => {
                        const Icon = style.icon;
                        return (
                          <div
                            key={style.id}
                            className={`border-2 p-4 rounded-2xl cursor-pointer transition-all ${
                              form.watch("contentStyle") === style.id
                                ? "border-electric-blue bg-blue-50"
                                : "border-slate-200 bg-white hover:border-electric-blue"
                            }`}
                            onClick={() => form.setValue("contentStyle", style.id)}
                          >
                            <div className="text-center">
                              <Icon className={`text-2xl mb-2 mx-auto ${
                                form.watch("contentStyle") === style.id ? "text-electric-blue" : "text-slate-400"
                              }`} />
                              <h6 className="font-bold text-slate-900">{style.name}</h6>
                              <p className="text-sm text-slate-600">{style.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Platform Selection */}
              {step === 2 && (
                <PlatformSelector
                  selectedPlatforms={selectedPlatforms}
                  onPlatformsChange={setSelectedPlatforms}
                />
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Campaign Summary</h3>
                    
                    <div className="grid gap-4">
                      <div>
                        <Label className="font-semibold text-slate-700">Title:</Label>
                        <p className="text-slate-900">{form.watch("title")}</p>
                      </div>
                      
                      <div>
                        <Label className="font-semibold text-slate-700">Content Theme:</Label>
                        <p className="text-slate-900">{form.watch("prompt")}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold text-slate-700">Duration:</Label>
                          <p className="text-slate-900">
                            {form.watch("postInstantly") || form.watch("postingTime") === "instant" 
                              ? "Post instantly" 
                              : `${form.watch("duration")} days`}
                          </p>
                        </div>
                        <div>
                          <Label className="font-semibold text-slate-700">Posting Time:</Label>
                          <p className="text-slate-900">
                            {form.watch("postingTime") === "instant" 
                              ? "Instant publishing" 
                              : form.watch("postingTime")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-semibold text-slate-700">Enhanced AI:</Label>
                          <p className="text-slate-900">
                            {form.watch("enhancedAI") ? (
                              <span className="text-purple-600 font-medium">✓ Enabled</span>
                            ) : (
                              <span className="text-slate-500">Disabled</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="font-semibold text-slate-700">Content Style:</Label>
                          <p className="text-slate-900 capitalize">{form.watch("contentStyle")}</p>
                        </div>
                      </div>
                      

                      
                      <div>
                        <Label className="font-semibold text-slate-700">Platforms:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPlatforms.map((platform) => (
                            <Badge key={platform} className="bg-electric-blue text-white">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <h4 className="text-lg font-bold text-emerald-900 mb-2">🚀 What happens next?</h4>
                    <ul className="space-y-2 text-emerald-800">
                      <li>• {form.watch("enhancedAI") ? "Enhanced GitHub AI" : "AI"} will generate unique posts based on your theme</li>
                      <li>• Content will be optimized for each selected platform</li>
                      <li>• {form.watch("postInstantly") || form.watch("postingTime") === "instant" 
                           ? "Posts will be published immediately after generation" 
                           : "Posts will be scheduled according to your time preferences"}</li>
                      <li>• Posts will be scheduled automatically at your chosen time</li>
                      <li>• You can review and edit any post before it goes live</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="font-semibold"
                >
                  {step > 1 && <ArrowLeft className="w-4 h-4 mr-2" />}
                  {step === 1 ? "Cancel" : "Previous"}
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="sparkwave-button-primary"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createCampaignMutation.isPending}
                    className="sparkwave-button-primary"
                  >
                    {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
