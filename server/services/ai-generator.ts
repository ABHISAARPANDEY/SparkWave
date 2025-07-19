import { storage } from "../storage";
import { Campaign, Post } from "@shared/schema";

interface AIModelConfig {
  name: string;
  endpoint: string;
  apiKey?: string;
  isFree: boolean;
  maxTokens: number;
}

// Free AI models available on Hugging Face Inference API
const AI_MODELS: AIModelConfig[] = [
  {
    name: "GPT-2",
    endpoint: "https://api-inference.huggingface.co/models/gpt2",
    isFree: true,
    maxTokens: 150,
  },
  {
    name: "GPT-Neo 2.7B",
    endpoint: "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B", 
    isFree: true,
    maxTokens: 200,
  },
  {
    name: "FLAN-T5",
    endpoint: "https://api-inference.huggingface.co/models/google/flan-t5-large",
    isFree: true,
    maxTokens: 100,
  },
];

class AIContentGenerator {
  private async callHuggingFaceAPI(model: AIModelConfig, prompt: string): Promise<string> {
    try {
      const apiKey = process.env.HUGGINGFACE_API_KEY;
      
      if (!apiKey) {
        console.warn("HUGGINGFACE_API_KEY not found, using fallback generation");
        throw new Error("No API key available");
      }

      const response = await fetch(model.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: model.maxTokens,
            temperature: 0.8,
            do_sample: true,
            top_p: 0.9,
            repetition_penalty: 1.1,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Hugging Face API error (${response.status}):`, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle different response formats
      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      } else if (result.generated_text) {
        return result.generated_text;
      } else if (Array.isArray(result) && result[0]?.text) {
        return result[0].text;
      } else if (typeof result === 'string') {
        return result;
      }
      
      console.warn("Unexpected API response format:", result);
      throw new Error("Unexpected response format");
      
    } catch (error) {
      console.error("Hugging Face API call failed:", error);
      throw error;
    }
  }

  private generateFallbackContent(prompt: string, platform: string, style: string, dayNumber: number): string {
    const templates = {
      professional: [
        `💼 Day ${dayNumber}: ${prompt} - Here's a professional perspective on this crucial topic for industry leaders.`,
        `🎯 Professional insight #${dayNumber}: ${prompt}. Key strategies every expert should consider.`,
        `📊 Industry analysis - Day ${dayNumber}: ${prompt}. Data-driven insights for business growth.`,
        `🚀 Strategic focus for Day ${dayNumber}: ${prompt}. Best practices from industry pioneers.`,
      ],
      inspirational: [
        `✨ Day ${dayNumber} inspiration: ${prompt} - Remember, every master was once a disaster!`,
        `🌟 Daily motivation #${dayNumber}: ${prompt}. Your potential is limitless!`,
        `💪 Inspiration for Day ${dayNumber}: ${prompt} - Every step forward counts.`,
        `🎉 Day ${dayNumber} reminder: ${prompt}. You're capable of amazing things!`,
      ],
      casual: [
        `Hey everyone! 👋 Day ${dayNumber} thoughts on ${prompt}... what's your take?`,
        `Day ${dayNumber} coffee chat: ${prompt} ☕ Love to hear everyone's perspective!`,
        `Just thinking about ${prompt} today (Day ${dayNumber})... anyone else? 🤔`,
        `Day ${dayNumber} casual convo: ${prompt} - drop your thoughts below! 💭`,
      ],
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.casual;
    const selectedTemplate = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
    
    return this.optimizeForPlatform(selectedTemplate, platform);
  }

  private optimizeForPlatform(content: string, platform: string): string {
    let optimized = content.trim();
    
    // Remove any AI artifacts
    optimized = optimized.replace(/^(AI:|Bot:|Response:|Post:)/i, "").trim();
    
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        // Twitter character limit and hashtag optimization
        if (optimized.length > 270) {
          optimized = optimized.substring(0, 267) + "...";
        }
        if (!optimized.includes("#") && optimized.length < 250) {
          optimized += " #innovation #growth";
        }
        break;
        
      case "linkedin":
        // LinkedIn professional formatting
        if (optimized.length > 100 && !optimized.includes("\n\n")) {
          optimized = optimized.replace(/\. ([A-Z])/g, ".\n\n$1");
        }
        if (!optimized.includes("#") && optimized.length < 2900) {
          optimized += "\n\n#professional #networking #growth";
        }
        break;
        
      case "instagram":
        // Instagram visual engagement with emojis
        if (!/[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u.test(optimized)) {
          const emojis = ["📸", "✨", "🎨", "💫", "🌟"];
          optimized = `${emojis[Math.floor(Math.random() * emojis.length)]} ${optimized}`;
        }
        if (!optimized.includes("#")) {
          optimized += "\n\n#creative #inspiration #content #daily";
        }
        break;
        
      case "facebook":
        // Facebook community engagement
        if (!optimized.match(/[?!]$/) && optimized.length > 50) {
          const questions = [
            " What are your thoughts?",
            " How do you approach this?",
            " Share your experience below!",
            " Would love to hear your perspective!"
          ];
          optimized += questions[Math.floor(Math.random() * questions.length)];
        }
        break;
    }
    
    return optimized;
  }

  private createPrompt(campaign: Campaign, platform: string, dayNumber: number, previousPosts: string[] = []): string {
    const { prompt, contentStyle } = campaign;
    
    let styleInstructions = "";
    switch (contentStyle) {
      case "professional":
        styleInstructions = "Write in a professional, authoritative tone. Include actionable insights and industry expertise.";
        break;
      case "inspirational":
        styleInstructions = "Write in an uplifting, motivational tone that inspires action and builds confidence.";
        break;
      case "casual":
        styleInstructions = "Write in a friendly, conversational tone that's relatable and approachable.";
        break;
    }

    let platformInstructions = "";
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        platformInstructions = "Create a concise Twitter post under 280 characters. Include 1-2 relevant hashtags.";
        break;
      case "linkedin":
        platformInstructions = "Create a professional LinkedIn post. Can be longer with detailed insights. Include professional hashtags.";
        break;
      case "instagram":
        platformInstructions = "Create an engaging Instagram caption with emojis and relevant hashtags for discovery.";
        break;
      case "facebook":
        platformInstructions = "Create a Facebook post that encourages community discussion and engagement.";
        break;
    }

    const uniquenessInstruction = previousPosts.length > 0 
      ? "Make this content unique and avoid repeating themes from previous posts."
      : "Create fresh, original content.";

    return `${styleInstructions} ${platformInstructions} ${uniquenessInstruction}

Topic: ${prompt}
Day: ${dayNumber}

Create an engaging social media post:`;
  }

  async generateContentForCampaign(campaign: Campaign): Promise<void> {
    try {
      console.log(`Starting AI content generation for campaign: ${campaign.title}`);
      
      const { platforms, duration } = campaign;
      const model = AI_MODELS.find(m => m.name === "GPT-2") || AI_MODELS[0];
      
      // Track generated content to ensure uniqueness
      const generatedContent = new Map<string, string[]>();
      
      for (const platform of platforms) {
        console.log(`Generating content for ${platform}...`);
        generatedContent.set(platform, []);
        
        for (let day = 1; day <= duration; day++) {
          try {
            const previousPosts = generatedContent.get(platform) || [];
            const promptText = this.createPrompt(campaign, platform, day, previousPosts);
            let content: string;
            
            try {
              // Try AI generation first
              const aiResponse = await this.callHuggingFaceAPI(model, promptText);
              content = aiResponse.trim();
              
              // Clean up the response
              if (content.startsWith(promptText)) {
                content = content.substring(promptText.length).trim();
              }
              
              if (!content || content.length < 10) {
                throw new Error("Generated content too short");
              }
              
            } catch (aiError) {
              console.warn(`AI generation failed for ${platform} day ${day}, using fallback:`, aiError);
              content = this.generateFallbackContent(campaign.prompt, platform, campaign.contentStyle, day);
            }
            
            // Optimize content for the specific platform
            const optimizedContent = this.optimizeForPlatform(content, platform);
            
            // Add to tracking for uniqueness
            generatedContent.get(platform)?.push(optimizedContent);
            
            // Calculate scheduled time
            const scheduledAt = new Date();
            scheduledAt.setDate(scheduledAt.getDate() + day - 1);
            const [hours, minutes] = campaign.postingTime.split(":");
            scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Create post record
            await storage.createPost({
              campaignId: campaign.id,
              content: optimizedContent,
              platform,
              scheduledAt,
              status: "scheduled",
            });
            
            console.log(`Generated post for ${platform} day ${day}: ${optimizedContent.substring(0, 50)}...`);
            
            // Small delay to avoid overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (postError) {
            console.error(`Failed to generate post for ${platform} day ${day}:`, postError);
            
            // Create a fallback post even if generation completely fails
            try {
              const fallbackContent = this.generateFallbackContent(campaign.prompt, platform, campaign.contentStyle, day);
              const scheduledAt = new Date();
              scheduledAt.setDate(scheduledAt.getDate() + day - 1);
              const [hours, minutes] = campaign.postingTime.split(":");
              scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              
              await storage.createPost({
                campaignId: campaign.id,
                content: fallbackContent,
                platform,
                scheduledAt,
                status: "scheduled",
              });
              
              console.log(`Created fallback post for ${platform} day ${day}`);
            } catch (fallbackError) {
              console.error(`Failed to create fallback post:`, fallbackError);
            }
          }
        }
      }
      
      console.log(`Successfully completed content generation for campaign: ${campaign.title}`);
      
    } catch (error) {
      console.error(`Campaign content generation failed for campaign ${campaign.id}:`, error);
      throw new Error(`Failed to generate content for campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

const aiGenerator = new AIContentGenerator();

export async function generateAIContent(campaign: Campaign): Promise<void> {
  return aiGenerator.generateContentForCampaign(campaign);
}
