const apiKey = process.env.VITE_GEMINI_API_KEY || "AIzaSyCxZpKT6BApME1vN5ZYjPQRifMXfR2VJ-w";
const model = "gemini-2.0-flash";

async function testModel() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    console.log(`Testing: ${model}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCCESS: ${model}`);
        } else {
            const err = await response.json();
            console.log(`❌ FAILED: ${model} - ${response.status} - ${err.error?.message}`);
        }
    } catch (e) {
        console.log(`❌ ERROR: ${model} - ${e.message}`);
    }
}

testModel();
