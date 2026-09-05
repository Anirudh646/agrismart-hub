import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { question, language, history } = await req.json();

    if (!question || typeof question !== "string" || question.length > 2000) {
      return new Response(JSON.stringify({ error: "A valid question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language === "hi" ? "Hindi (Devanagari script)" : "English";

    const messages = [
      {
        role: "system",
        content: `You are KrishiSathi, a friendly farming assistant for Indian farmers. Answer in ${lang}.
Keep answers short, practical and easy to understand for a farmer with limited literacy: 3-6 short sentences or bullets.
Cover crops, soil, fertilizer doses, pests, irrigation, weather planning, market selling and government schemes.
If a question is not about farming or rural life, politely steer back to farming. Never give medical or legal advice.`,
      },
      ...(Array.isArray(history)
        ? history.slice(-8).map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content ?? "").slice(0, 2000),
          }))
        : []),
      { role: "user", content: question },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-3.7-flash", messages }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("AI gateway error", res.status, text);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? "Sorry, I could not answer that.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("voice-assistant error", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
