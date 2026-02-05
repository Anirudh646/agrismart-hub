import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropName, soilType, location, season, area, currentCrops } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an expert agricultural advisor for Indian farmers. Provide comprehensive crop advisory based on:

**Farmer's Details:**
- Crop: ${cropName || 'Not specified'}
- Soil Type: ${soilType || 'Not specified'}
- Location: ${location || 'India'}
- Season: ${season || 'Current'}
- Farm Area: ${area || 'Not specified'} acres
- Current Crops: ${currentCrops?.join(', ') || 'None specified'}

Provide advice in the following structured format:

## 🌾 Crop Recommendations
- Best varieties for this soil and season
- Alternative crops to consider
- Crop rotation suggestions

## 🌱 Soil & Fertilizer Management
- Soil preparation tips
- Recommended fertilizers with quantities (per acre)
- Organic alternatives
- Application schedule

## 💧 Irrigation Schedule
- Water requirements
- Best irrigation times
- Water-saving techniques

## 🐛 Pest & Disease Management
- Common pests to watch for
- Preventive measures
- Safe pesticide recommendations
- Organic pest control options

## 📅 Activity Timeline
- Sowing window
- Key growth stages
- Fertilizer application dates
- Expected harvest time

## 📊 Expected Yield & Economics
- Expected yield per acre
- Estimated costs
- Potential revenue
- Break-even analysis

## ⚠️ Risk Factors
- Weather-related risks
- Market price volatility
- Pest/disease alerts for this season

Keep the advice practical, actionable, and suitable for Indian farming conditions. Use simple language that farmers can understand.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert Indian agricultural advisor. Provide practical, actionable advice." },
          { role: "user", content: prompt }
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ advice }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
