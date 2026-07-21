const ENDPOINT = '/api/gemini';

export async function generateContent(prompt, options = {}) {
  const { json = false, model } = options;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, json, ...(model ? { model } : {}) }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server Error: ${res.status}`);
  }

  const { text } = await res.json();
  return text;
}

export async function generateJSON(prompt, options = {}) {
  const text = await generateContent(prompt, { ...options, json: true });
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Non-JSON AI response received:', text);
    throw new Error('Response was not valid JSON.');
  }
}