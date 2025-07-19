export interface AIModel {
  id: string;
  name: string;
  endpoint: string;
  isFree: boolean;
  isActive: boolean;
}

export interface ContentGenerationRequest {
  prompt: string;
  platform: string;
  contentStyle: "professional" | "inspirational" | "casual";
  previousPosts?: string[];
}

export interface GeneratedContent {
  content: string;
  platform: string;
  confidence: number;
}

class AIService {
  private async callAIModel(model: AIModel, prompt: string): Promise<string> {
    try {
      // For free models like Hugging Face, we'll use their Inference API
      const response = await fetch(model.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use environment variable for API key if available
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY || ""}`,
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 280, // Twitter-friendly default
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`AI model request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle different response formats from various models
      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      } else if (result.generated_text) {
        return result.generated_text;
      } else if (typeof result === "string") {
        return result;
      }
      
      throw new Error("Unexpected response format from AI model");
    } catch (error) {
      console.error("AI model call failed:", error);
      // Fallback to a simple template-based generation
      return this.generateFallbackContent(prompt);
    }
  }

  private generateFallbackContent(prompt: string): string {
    // Simple template-based fallback when AI models are unavailable
    const templates = [
      `🌟 ${prompt} - What are your thoughts on this?`,
      `💡 Here's an interesting perspective on ${prompt}. Let's discuss!`,
      `🚀 Today's focus: ${prompt}. How do you approach this?`,
      `✨ Sharing some insights about ${prompt}. What's your experience?`,
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    // Get available AI models (this would normally come from the API)
    const models: AIModel[] = [
      {
        id: "gpt2",
        name: "GPT-2",
        endpoint: "https://api-inference.huggingface.co/models/gpt2",
        isFree: true,
        isActive: true,
      },
      {
        id: "gpt-neo",
        name: "GPT-Neo",
        endpoint: "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B",
        isFree: true,
        isActive: false,
      },
    ];

    const activeModel = models.find(m => m.isActive) || models[0];

    // Create platform-specific prompt
    const platformPrompt = this.createPlatformPrompt(request);
    
    try {
      const content = await this.callAIModel(activeModel, platformPrompt);
      const cleanedContent = this.cleanAndOptimizeContent(content, request.platform);
      
      return {
        content: cleanedContent,
        platform: request.platform,
        confidence: 0.8, // Would be calculated based on model response
      };
    } catch (error) {
      console.error("Content generation failed:", error);
      // Return fallback content
      return {
        content: this.generateFallbackContent(request.prompt),
        platform: request.platform,
        confidence: 0.3,
      };
    }
  }

  private createPlatformPrompt(request: ContentGenerationRequest): string {
    const { prompt, platform, contentStyle } = request;
    
    let styleInstructions = "";
    switch (contentStyle) {
      case "professional":
        styleInstructions = "Write in a professional, authoritative tone with industry expertise.";
        break;
      case "inspirational":
        styleInstructions = "Write in an uplifting, motivational tone that inspires action.";
        break;
      case "casual":
        styleInstructions = "Write in a friendly, conversational tone that's approachable.";
        break;
    }

    let platformInstructions = "";
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        platformInstructions = "Keep it under 280 characters. Use relevant hashtags.";
        break;
      case "linkedin":
        platformInstructions = "Professional network post, can be longer. Include professional insights.";
        break;
      case "instagram":
        platformInstructions = "Engaging caption with emojis. Include relevant hashtags.";
        break;
      case "facebook":
        platformInstructions = "Community-focused post that encourages engagement.";
        break;
    }

    return `${styleInstructions} ${platformInstructions} Create a social media post about: ${prompt}`;
  }

  private cleanAndOptimizeContent(content: string, platform: string): string {
    // Remove any unwanted prefixes or suffixes from AI generation
    let cleaned = content.trim();
    
    // Remove common AI generation artifacts
    cleaned = cleaned.replace(/^(AI:|Bot:|Response:|Post:)/i, "");
    cleaned = cleaned.replace(/\n+/g, "\n").trim();
    
    // Platform-specific optimizations
    switch (platform.toLowerCase()) {
      case "twitter":
      case "x":
        // Ensure it fits Twitter's character limit
        if (cleaned.length > 280) {
          cleaned = cleaned.substring(0, 275) + "...";
        }
        break;
      case "linkedin":
        // Add professional formatting
        if (!cleaned.includes("\n") && cleaned.length > 100) {
          // Add line breaks for readability
          cleaned = cleaned.replace(/\. /g, ".\n\n");
        }
        break;
      case "instagram":
        // Ensure good emoji usage
        if (!/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(cleaned)) {
          // Add some emojis if none present
          cleaned = `✨ ${cleaned}`;
        }
        break;
    }
    
    return cleaned;
  }

  async generateMultiplePosts(
    request: ContentGenerationRequest, 
    count: number
  ): Promise<GeneratedContent[]> {
    const posts: GeneratedContent[] = [];
    const previousContents: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const enhancedRequest = {
        ...request,
        previousPosts: previousContents,
      };
      
      const post = await this.generateContent(enhancedRequest);
      posts.push(post);
      previousContents.push(post.content);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return posts;
  }
}

export const aiService = new AIService();
