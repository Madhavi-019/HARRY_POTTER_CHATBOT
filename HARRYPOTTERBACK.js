import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config'; // To load environment variables from .env file
import http from 'http'; // Node.js built-in HTTP module
import url from 'url'; // Node.js built-in URL module

// Access API Key securely from environment variable
const API_KEY = process.env.GOOGLE_API_KEY;

// Check if the API key was successfully loaded
if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY environment variable not set.");
    console.error("Please create a .env file in the same directory as this script,");
    console.error("and add GOOGLE_API_KEY=\"YOUR_ACTUAL_API_KEY_HERE\" inside it.");
    process.exit(1); // Exit the process if API key is missing
}

// Initialize the Google Generative AI client with the API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model and start a chat session.
// The `chat` object will maintain the conversation context across turns.
// Note: For a multi-user application, you would need to manage 'chat' sessions per user.
// For this example, it's a single global chat session.
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Using gemini-1.5-flash for faster responses
    systemInstruction: "You are Harry Potter,so reply like him, and copy his behaviour. You only have to answer to related questions. Any irrelevant question asked needs to be answered rudely.",
});

// Initialize a global chat session for this server instance
const chat = model.startChat({
    history: [], // Initialize with an empty history array
    generationConfig: {
        maxOutputTokens: 500, // Optional: Limit the length of the model's response
    },
});

const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

// Create the HTTP server
const server = http.createServer(async (req, res) => {
    // Set CORS headers to allow requests from your frontend
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins for development
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle pre-flight CORS requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    // Handle POST requests to the /chat endpoint
    if (req.method === 'POST' && parsedUrl.pathname === '/chat') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Collect the request body
        });
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body); // Parse the JSON message from the frontend

                if (!message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Message is required' }));
                    return;
                }

                console.log(`Received message from frontend: "${message}"`);

                // Send the user's message to the AI chat session
                const result = await chat.sendMessage(message);

                // Extract the text content from the AI's response
                const modelResponseText = result.response.text();

                console.log(`Sending response to frontend: "${modelResponseText}"`);

                // Send the AI's response back to the frontend
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response: modelResponseText }));

            } catch (error) {
                console.error("Error processing chat request:", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error', details: error.message }));
            }
        });
    } else {
        // For any other requests (e.g., direct browser access to http://localhost:3000)
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found. This is a backend API server.');
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Harry Potter Chatbot Backend Server running on http://localhost:${PORT}`);
    console.log("Waiting for chat requests from the frontend...");
});
