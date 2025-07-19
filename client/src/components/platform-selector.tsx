import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Plus } from "lucide-react";
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook 
} from "lucide-react";

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
}

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Stories, posts, and Reels optimized for engagement",
    icon: Instagram,
    color: "from-purple-400 via-pink-500 to-red-500",
    connected: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn", 
    description: "Professional content that builds your network",
    icon: Linkedin,
    color: "from-blue-600 to-blue-700",
    connected: true,
  },
  {
    id: "twitter",
    name: "Twitter/X",
    description: "Threads and tweets that spark conversations", 
    icon: Twitter,
    color: "from-slate-700 to-black",
    connected: false,
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Reach your community with targeted posts",
    icon: Facebook, 
    color: "from-blue-500 to-blue-600",
    connected: false,
  },
];

export default function PlatformSelector({ selectedPlatforms, onPlatformsChange }: PlatformSelectorProps) {
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platformId));
    } else {
      onPlatformsChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Platforms</h3>
        <p className="text-slate-600">Select where you want to publish your AI-generated content</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatforms.includes(platform.id);
          
          return (
            <Card 
              key={platform.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? "ring-2 ring-electric-blue bg-blue-50" 
                  : "hover:border-electric-blue"
              }`}
              onClick={() => platform.connected && togglePlatform(platform.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 mb-1">{platform.name}</h4>
                      <p className="text-sm text-slate-600 mb-3">{platform.description}</p>
                      
                      {platform.connected ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600">
                          Not Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {platform.connected ? (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? "bg-electric-blue border-electric-blue" 
                        : "border-slate-300"
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlatforms.length > 0 && (
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <h4 className="font-semibold text-emerald-900 mb-2">
            ✨ Selected Platforms ({selectedPlatforms.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((platformId) => {
              const platform = PLATFORMS.find(p => p.id === platformId);
              return (
                <Badge key={platformId} className="bg-emerald-100 text-emerald-700">
                  {platform?.name}
                </Badge>
              );
            })}
          </div>
          <p className="text-sm text-emerald-700 mt-2">
            Your AI-generated content will be automatically optimized for each platform's audience and format.
          </p>
        </div>
      )}
    </div>
  );
}
