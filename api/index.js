// api/index.js
// This file will be deployed as a Vercel Serverless Function

// Import necessary modules
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config'; // To load environment variables from .env file
import express from 'express'; // Import Express.js
import cors from 'cors'; // Import CORS middleware for cross-origin requests

// Access API Key securely from environment variable
const API_KEY = process.env.GOOGLE_API_KEY;

// Check if the API key was successfully loaded
if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY environment variable not set.");
    console.error("Please set the GOOGLE_API_KEY environment variable in Vercel.");
    // In a Vercel serverless function, process.exit(1) is less common,
    // but we'll throw an error to indicate misconfiguration.
    throw new Error("GOOGLE_API_KEY environment variable is not set.");
}

// Initialize the Google Generative AI client with the API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model and start a chat session.
// The `chat` object will maintain the conversation context across turns.
// IMPORTANT: In a production multi-user scenario, you'd need to manage
// chat sessions per user (e.g., using a database or session management)
// rather than a single global `chat` object. For this demo, it's fine.
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are Harry Potter. You only have to answer to related questions. Any question asked which is irrelevant needs to be answered in a polite but firm tone, like 'I'm afraid that's not a magical topic I can discuss.'",
});

// Initialize a global chat session for this serverless instance
// This history will reset with each new serverless invocation if not managed externally.
const chat = model.startChat({
    history: [],
    generationConfig: {
        maxOutputTokens: 500,
    },
});

// Create an Express application
const app = express();

// Use CORS middleware to allow requests from your frontend
// For production, replace '*' with your Vercel frontend domain (e.g., 'https://your-frontend-app.vercel.app')
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());

// Define the chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body; // Get the message from the request body

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`Received message from frontend: "${message}"`);

        // Send the user's message to the AI chat session
        const result = await chat.sendMessage(message);

        // Extract the text content from the AI's response
        const modelResponseText = result.response.text();

        console.log(`Sending response to frontend: "${modelResponseText}"`);

        // Send the AI's response back to the frontend
        res.status(200).json({ response: modelResponseText });

    } catch (error) {
        console.error("Error processing chat request:", error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// For Vercel, you export the app instance. Vercel handles the server listening.
export default app;

// Optional: For local testing, you can still listen on a port
// if (!process.env.VERCEL) { // Only listen if not on Vercel
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//         console.log(`Harry Potter Chatbot Backend Server running on http://localhost:${PORT}`);
//         console.log("Waiting for chat requests from the frontend...");
//     });
// }
