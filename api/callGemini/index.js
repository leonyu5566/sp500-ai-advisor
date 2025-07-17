const fetch = require('node-fetch');

module.exports = async function (context, req) {
    // 從 Azure 環境變數讀取 Gemini API 金鑰
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        context.res = { status: 500, body: "GEMINI_API_KEY is not configured." };
        return;
    }

    // 從前端請求的 body 中取得 prompt
    const userPrompt = req.body?.prompt;

    if (!userPrompt) {
        context.res = { status: 400, body: "Please provide a prompt in the request body." };
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: userPrompt }]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Google Gemini API responded with ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        context.res = { status: 200, body: result };

    } catch (error) {
        context.log(error);
        context.res = { status: 500, body: `Error calling Google Gemini API: ${error.message}` };
    }
};