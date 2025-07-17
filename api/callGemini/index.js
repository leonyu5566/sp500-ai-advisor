// index.js  (Azure Functions v4, Node 18+)

module.exports = async function (context, req) {
    /** ------------------------------------------------------------------
     *  1. CORS 預檢 (OPTIONS) — 先回 204 + CORS header
     * ----------------------------------------------------------------- */
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
        return;                // ← 預檢不往下執行
    }

    /** ------------------------------------------------------------------
     *  2. 讀取環境變數中的 Gemini API Key
     * ----------------------------------------------------------------- */
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        context.res = {
            status: 500,
            body: 'GEMINI_API_KEY is not configured.'
        };
        return;
    }

    /** ------------------------------------------------------------------
     *  3. 取得前端傳入的 prompt
     * ----------------------------------------------------------------- */
    const userPrompt = req.body?.prompt;
    if (!userPrompt) {
        context.res = {
            status: 400,
            body: 'Request body 必須包含 prompt 欄位。'
        };
        return;
    }

    /** ------------------------------------------------------------------
     *  4. 呼叫 Google Gemini API
     * ----------------------------------------------------------------- */
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const payload = {
        contents: [
            { role: 'user', parts: [{ text: userPrompt }] }
        ]
    };

    try {
        const gRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!gRes.ok) {
            const errText = await gRes.text();              // 讀原始錯誤文字
            throw new Error(`Gemini API ${gRes.status}: ${errText}`);
        }

        const result = await gRes.json();

        /** --------------------------------------------------------------
         *  5. 回傳給前端，並帶 CORS header
         * ------------------------------------------------------------- */
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
            body: `Error calling Google Gemini API: ${err.message}`
        };
    }
};
