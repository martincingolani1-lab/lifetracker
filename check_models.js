const apiKey = process.env.VITE_GEMINI_API_KEY || "AIzaSyCxZpKT6BApME1vN5ZYjPQRifMXfR2VJ-w";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        console.log("--- Available Models containing 'flash' or 'pro' ---");
        const models = data.models || [];
        const filtered = models.filter(m =>
            m.name.includes("flash") || m.name.includes("pro")
        );

        filtered.forEach(m => console.log(m.name));

        if (filtered.length === 0) {
            console.log("No matching models found. Listing ALL names:");
            models.forEach(m => console.log(m.name));
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
