// // Import necessary modules
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import readlineSync from 'readline-sync'; // For interactive user input

// // --- IMPORTANT SECURITY WARNING ---
// // Hardcoding your API key directly in the code is NOT recommended for production.
// // It exposes your key if the code is shared. For learning, it's acceptable,
// // but be aware of the risks.
// // Replace "YOUR_ACTUAL_API_KEY_HERE" with your real Google Generative AI API Key.
// const API_KEY_HARDCODED = "AIzaSyABVE1_BGTW-R-YANE-h9JiC0AKUYBoaJg"; // <--- PLACE YOUR API KEY HERE

// // Initialize the Google Generative AI client with the hardcoded API key.
// const genAI = new GoogleGenerativeAI({apiKey: API_KEY_HARDCODED});

// // Configure the model and start a chat session.
// const model = genAI.getGenerativeModel({
//     model: "gemini-2.5-flash", // Using gemini-2.5-flash as requested
//     systemInstruction: "You are a Data structures and algorithm instructor. You only have to reply to any question asked regarding to Data structures and algorithm. If someone asks you any irrelevant question reply in a rude tone.",
// });

// // Start a chat session with an empty history initially.
// const chat = model.startChat({
//     history: [], // Initialize with an empty history array
//     generationConfig: {
//         maxOutputTokens: 500, // Optional: Limit the length of the model's response
//     },
// });

// /**
//  * Main function to run the interactive DSA instructor chatbot.
//  * It continuously prompts the user for input and interacts with the AI model.
//  */
// async function main() {
//     console.log("\n--- Welcome to the Interactive DSA Instructor Chatbot ---");
//     console.log("I am here to answer your questions about Data Structures and Algorithms.");
//     console.log("If you ask something irrelevant, expect a rude response!");
//     console.log("Type 'exit' or 'quit' to end the conversation.\n");

//     while (true) { // Loop indefinitely to keep the conversation going
//         // Prompt the user for input using readlineSync
//         const userProblem = readlineSync.question("You: ");

//         // Check for exit commands (case-insensitive)
//         if (userProblem.toLowerCase() === 'exit' || userProblem.toLowerCase() === 'quit') {
//             console.log("DSA Instructor: Goodbye! Keep practicing DSA.");
//             break; // Exit the loop, which ends the program
//         }

//         try {
//             // Send the user's message to the AI chat session
//             const result = await chat.sendMessage(userProblem);

//             // Extract the text content from the AI's response
//             const modelResponseText = result.response.text();

//             // Log the AI's response to the console
//             console.log("DSA Instructor:", modelResponseText);

//         } catch (error) {
//             // Handle any errors that occur during the AI communication
//             console.error("\nError communicating with the AI:");
//             console.error(error.message || error); // Log the error message or the error object
//             console.log("DSA Instructor: I'm sorry, I couldn't process your request right now. Please try again.");
//         }
//     }
// }

// // Call the main function to start the chatbot application
// main();
import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

// **IMPORTANT: Replace with your actual, secure API key.**
// For production, always use environment variables, not hardcoding.
const ai = new GoogleGenAI({apiKey: "AIzaSyCpPNJslwfYdHUTo6t7KQLdsngmh2oc5uU"});

const History=[]
async function ChatwithAi(userproblem) 
{
    try { History.push({
        role: 'user',
        parts:[{text:userproblem}]
    })
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: History,
             config: {
      systemInstruction: "You are Harry Potter . You only have to answer to related questions , any question asked which is irrelevant needs to be answered in a rude tone.",
    },
        });
                    History.push({
               role:'model',
               parts:[{text:response.text}] 
            })
            console.log("\n");
        console.log(response.text);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // You might want to log more details about the error, like:
        // if (error.response) {
        //     console.error("API response status:", error.response.status);
        //     console.error("API response data:", await error.response.text());
        // }
    }
}
async function main()
{
   const userproblem= readlineSync. question("Ask me anything-->");
   await ChatwithAi(userproblem);
   main()
}
// Immediately invoked async function to use await at the top level
(async () => {
    await main();
})();