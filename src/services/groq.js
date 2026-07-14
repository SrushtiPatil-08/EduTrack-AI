const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGroq(prompt, context = {}) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return { error: 'Groq API key not configured.', reply: null };

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: context.model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: context.system || 'You are a helpful study assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error?.message || 'Groq request failed.' };
    return { reply: data.choices[0].message.content, error: null };
  } catch (e) {
    return { error: e.message, reply: null };
  }
}

export async function parseTimetableImage(file) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return { error: 'Supabase not configured.' };

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/timetable-import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Timetable import failed.' };
    return { result: data, error: null };
  } catch (e) {
    return { error: e.message, result: null };
  }
}

export default { askGroq, parseTimetableImage };
