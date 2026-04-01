import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export interface AIAnalysisResult {
  is_buyer_lead: boolean;
  buyer_intent_level: "high" | "medium" | "low";
  property_type: "house" | "condo" | "townhouse" | "duplex" | "land" | "investment";
  bedrooms: number;
  bathrooms: number;
  location_city: string;
  location_area: string;
  budget_min: number;
  budget_max: number;
  budget_currency: string;
  timeline: string;
  buyer_type: "first_time" | "upgrader" | "investor" | "downsizer";
  mortgage_status: "pre_approved" | "not_yet" | "not_sure";
  must_haves: string[];
  nice_to_haves: string[];
  family_size: number;
  school_district: string;
  commute_location: string;
  summary: string;
  follow_up_questions: string[];
  estimated_value: number;
  priority_score: number;
  
  // Phase 19 Advanced AI Features
  buyer_persona?: {
    persona_name: string;
    buyer_stage: string;
    primary_motivation: string;
    pain_points: string[];
    lifestyle_factors: string[];
    decision_factors: string[];
    communication_preference: string;
    suggested_approach: string;
  };
  price_prediction?: {
    predicted_price: number;
    price_range_low: number;
    price_range_high: number;
    confidence_score: number;
    reasoning: string;
  };
  closing_probability?: {
    probability_30_days: number;
    probability_60_days: number;
    probability_90_days: number;
    key_factors: string[];
    recommended_next_steps: string[];
  };
  ideal_property?: {
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    square_footage: string;
    must_have_features: string[];
    nice_to_have_features: string[];
    neighborhood_type: string;
    listing_price_range: string;
  };
  best_contact_time?: {
    best_time_of_day: string;
    best_day_of_week: string;
    preferred_channel: string;
    urgency_level: string;
    suggested_script: string;
  };
  predicted_objections?: {
    likely_objections: string[];
    objection_handling: { [key: string]: string };
    hidden_concerns: string[];
    trust_builders: string[];
  };
  market_timing?: {
    recommendation: string;
    reasoning: string;
    market_conditions: string;
    risk_factors: string[];
    opportunity_factors: string[];
  };
  competitor_analysis?: {
    mentioned_agents: string[];
    competitor_strategies: string[];
    gaps: string[];
    advantage_opportunities: string[];
    unique_value_proposition: string;
  };
  negotiation_tips?: {
    negotiation_leverage: string[];
    price_strategy: string;
    concessions_to_ask: string[];
    closing_tactics: string[];
    fallback_options: string[];
  };
  communication_style?: {
    style: string;
    tone: string;
    detail_level: string;
    responsiveness_likelihood: string;
    follow_up_frequency: string;
    message_style: string;
  };

  // Compatibility fields for existing UI
  is_lead: boolean;
  intent: string;
  urgency_score: number;
  quality_score: number;
  sentiment: string;
  location: string;
  budget: string;
}

export class AILeadProcessor {
  private openai: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.AI_API_KEY || "sk-64ffc8c8acd247ea866191d9a3ea6a88";
    const baseURL = process.env.AI_API_URL || "https://api.openai.com/v1";
    this.model = process.env.AI_MODEL || "gpt-3.5-turbo";

    this.openai = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async analyzeLeadComplete(postText: string, platform: string, author: string): Promise<AIAnalysisResult | null> {
    try {
      const prompt = `
        You are an AI real estate lead analyst. Analyze this post and extract buyer intelligence:

        Post Content: ${postText}
        Platform: ${platform}
        Author: ${author}

        Return a JSON with:
        1. is_buyer_lead: true/false - Is this a genuine home buyer?
        2. buyer_intent_level: high/medium/low - How ready are they to buy?
        3. property_type: house/condo/townhouse/duplex/land/investment
        4. bedrooms: number needed
        5. bathrooms: number needed
        6. location_city: city name
        7. location_area: neighborhood/area
        8. budget_min: minimum budget
        9. budget_max: maximum budget
        10. budget_currency: CAD/USD/GBP
        11. timeline: immediate/1-3 months/3-6 months/6+ months
        12. buyer_type: first_time/upgrader/investor/downsizer
        13. mortgage_status: pre_approved/not_yet/not_sure
        14. must_haves: list of non-negotiable features
        15. nice_to_haves: list of desired features
        16. family_size: number of people
        17. school_district: mentioned or not
        18. commute_location: work location if mentioned
        19. summary: 2-sentence buyer summary
        20. follow_up_questions: 3 specific questions
        21. estimated_value: estimated property value based on budget
        22. priority_score: 0-100 based on intent, timeline, budget
        
        PHASE 19 ADVANCED AI FEATURES:
        23. buyer_persona: { persona_name, buyer_stage, primary_motivation, pain_points[], lifestyle_factors[], decision_factors[], communication_preference, suggested_approach }
        24. price_prediction: { predicted_price, price_range_low, price_range_high, confidence_score, reasoning }
        25. closing_probability: { probability_30_days, probability_60_days, probability_90_days, key_factors[], recommended_next_steps[] }
        26. ideal_property: { property_type, bedrooms, bathrooms, square_footage, must_have_features[], nice_to_have_features[], neighborhood_type, listing_price_range }
        27. best_contact_time: { best_time_of_day, best_day_of_week, preferred_channel, urgency_level, suggested_script }
        28. predicted_objections: { likely_objections[], objection_handling: { key: value }, hidden_concerns[], trust_builders[] }
        29. market_timing: { recommendation, reasoning, market_conditions, risk_factors[], opportunity_factors[] }
        30. competitor_analysis: { mentioned_agents[], competitor_strategies[], gaps[], advantage_opportunities[], unique_value_proposition }
        31. negotiation_tips: { negotiation_leverage[], price_strategy, concessions_to_ask[], closing_tactics[], fallback_options[] }
        32. communication_style: { style, tone, detail_level, responsiveness_likelihood, follow_up_frequency, message_style }

        Also include these compatibility fields:
        - is_lead: (same as is_buyer_lead)
        - intent: (same as buyer_intent_level)
        - urgency_score: (1-10 based on timeline)
        - quality_score: (0-100 based on completeness)
        - sentiment: (positive/neutral/urgent)
        - location: (location_city + location_area)
        - budget: (budget_currency + budget_max)

        Return ONLY valid JSON.
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty response from AI");

      const result = JSON.parse(content) as AIAnalysisResult;
      
      // Calculate priority score
      if (!result.priority_score) {
        result.priority_score = this.calculatePriority(
          result.urgency_score || 5,
          result.quality_score || 50,
          result.budget || ""
        );
      }

      return result;
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Fallback result
      return {
        is_buyer_lead: true,
        is_lead: true,
        buyer_intent_level: "medium",
        intent: "medium",
        urgency_score: 5,
        quality_score: 50,
        sentiment: "neutral",
        location: "Unknown",
        location_city: "Unknown",
        location_area: "",
        property_type: "house",
        bedrooms: 0,
        bathrooms: 0,
        budget_min: 0,
        budget_max: 0,
        budget_currency: "USD",
        budget: "Unknown",
        timeline: "Unknown",
        buyer_type: "first_time",
        mortgage_status: "not_sure",
        must_haves: [],
        nice_to_haves: [],
        family_size: 0,
        school_district: "",
        commute_location: "",
        summary: "AI analysis failed, manual review recommended.",
        follow_up_questions: ["Could you provide more details about your property search?"],
        estimated_value: 0,
        priority_score: 50
      } as any;
    }
  }

  private calculatePriority(urgencyScore: number, qualityScore: number, budget: string): number {
    let priority = (urgencyScore * 0.4) + (qualityScore * 0.4);
    
    if (budget) {
      const budgetLower = budget.toLowerCase();
      if (budgetLower.includes("100000") || budgetLower.includes("100k") || budgetLower.includes("million")) {
        priority += 20;
      } else if (budgetLower.includes("50000") || budgetLower.includes("50k")) {
        priority += 10;
      }
    }
    
    return Math.min(Math.round(priority), 100);
  }
}
