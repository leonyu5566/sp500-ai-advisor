// Node 18+ 版，Azure Functions v4
module.exports = async function (context, req) {

    /* ----------  CORS 預檢  ---------- */
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
        return;
    }

    /* ----------  讀取 API Key  ---------- */
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        context.res = { status: 500, body: 'GEMINI_API_KEY is not configured.' };
        return;
    }

    /* ----------  驗證前端輸入  ---------- */
    const userPrompt = req.body?.prompt;
    if (!userPrompt) {
        context.res = { status: 400, body: 'Body 需包含 prompt 欄位。' };
        return;
    }

    /* ----------  呼叫 Gemini  ---------- */
    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    };

    try {
        const gRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!gRes.ok) {
            const errText = await gRes.text();
            throw new Error(`Gemini API ${gRes.status}: ${errText}`);
        }

        const result = await gRes.json();

        context.res = {
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: result
        };
    } catch (err) {
        context.log(err);
        context.res = {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: `Error calling Google Gemini API: ${err.message}`
        };
    }
};

