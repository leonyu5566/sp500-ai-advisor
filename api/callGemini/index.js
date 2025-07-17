module.exports = async function (context, req) {
  // ── CORS 預檢 ──
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    };
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    context.res = { status: 500, body: "GEMINI_API_KEY is not configured." };
    return;
  }

  const prompt = req.body?.prompt;
  if (!prompt) {
    context.res = { status: 400, body: "Request body must include 'prompt'." };
    return;
  }

  const apiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  };

  try {
    const gRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!gRes.ok) {
      const errText = await gRes.text();
      throw new Error(`Gemini API ${gRes.status}: ${errText}`);
    }

    const result = await gRes.json();
    context.res = {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: result
    };
  } catch (err) {
    context.log(err);
    context.res = {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: `Error calling Gemini: ${err.message}`
    };
  }
};


