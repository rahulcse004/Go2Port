const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyCGZB3pQppfnx1yBeDjUjUNFdyY-w13P5U';
const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

async function testKey() {
    console.log("?? Testing API Key connectivity...");
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Is this API key working?" }] }]
        });
        console.log("? SUCCESS! AI says:", response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.log("? FAILED!");
        if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Message:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log("Error:", error.message);
        }
    }
}

testKey();
