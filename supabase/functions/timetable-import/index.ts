import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `You are a timetable extraction assistant. You receive an image or document of a college/school weekly timetable. Extract ALL lectures and return them as structured JSON.

Return ONLY a JSON object with this exact shape (no markdown, no explanation):
{
  "subjects": [
    { "name": "Subject Name", "code": "CS101" (or null), "type": "theory" | "practical" | "lab", "color": "#10b981" }
  ],
  "entries": [
    { "subject_name": "Subject Name", "day_of_week": 0-6 (0=Sunday), "start_time": "HH:MM", "end_time": "HH:MM", "room": "A-101" (or null), "faculty_name": "Dr. Smith" (or null) }
  ],
  "working_days": [0,1,2,3,4,5]
}

Rules:
- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
- times must be 24-hour HH:MM format
- If the timetable mentions labs/practicals, mark those subjects as type "lab" or "practical"
- Assign each subject a distinct color from this palette: #10b981, #3b82f6, #f59e0b, #ef4444, #8b5cf6, #ec4899, #14b8a6, #f97316, #06b6d4, #84cc16
- If you cannot read something clearly, set it to null
- If the image is not a timetable, return: { "error": "Not a timetable" }`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let imageBase64: string | null = null;
    let mediaType: string = "image/jpeg";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      imageBase64 = body.image_base64 || null;
      mediaType = body.media_type || "image/jpeg";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (file && file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        mediaType = file.type || "image/jpeg";
      }
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided. Send an image via multipart form-data (field: 'file') or JSON ({ image_base64, media_type })." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "Groq API key not configured on the server. Add GROQ_API_KEY as a secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isPdf = mediaType === "application/pdf";
    const contentPart: any = isPdf
      ? { type: "text", text: "Please extract the timetable from this PDF document." }
      : {
          type: "image_url",
          image_url: {
            url: `data:${mediaType};base64,${imageBase64}`,
          },
        };

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          contentPart,
          { type: "text", text: "Extract the complete weekly timetable from this image. Return ONLY the JSON object." },
        ],
      },
    ];

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      return new Response(
        JSON.stringify({ error: groqData.error?.message || "Groq Vision request failed." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rawContent = groqData.choices?.[0]?.message?.content || "";

    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return new Response(
          JSON.stringify({ error: "Could not parse AI response as JSON.", raw: rawContent }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (parsed.error) {
      return new Response(
        JSON.stringify({ error: parsed.error }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
