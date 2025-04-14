
import { API_KEYS } from "@/config/api-config";
import { ChatMessage, FileInfo, WebSearchResult } from "@/types/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with the API key from our config
const genAI = new GoogleGenerativeAI(API_KEYS.GEMINI_API_KEY);

// Helper to get the Gemini model
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

// Send a message to the Gemini API and get a response
export const sendMessageToGemini = async (
  messages: ChatMessage[],
  files: FileInfo[] = [],
  searchResults: WebSearchResult[] = []
): Promise<string> => {
  try {
    const model = getGeminiModel();
    
    // Format the conversation history for the API
    const formattedMessages = formatMessages(messages);
    
    // Add context from files if available
    if (files.length > 0) {
      formattedMessages.push(`Context from uploaded files:\n${formatFilesContent(files)}`);
    }
    
    // Add web search results if available
    if (searchResults.length > 0) {
      formattedMessages.push(`Web search results:\n${formatSearchResults(searchResults)}`);
    }
    
    // Create a chat session
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1).map(msg => ({
        role: "user",
        parts: [{ text: msg }],
      })),
    });
    
    // Send the latest message
    const result = await chat.sendMessage(formattedMessages[formattedMessages.length - 1]);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

// Format the chat messages for the API
const formatMessages = (messages: ChatMessage[]): string[] => {
  return messages.map(msg => msg.content);
};

// Format the content of uploaded files
const formatFilesContent = (files: FileInfo[]): string => {
  return files.map(file => `File: ${file.name}\nContent: ${file.content}\n`).join("\n");
};

// Format web search results
const formatSearchResults = (results: WebSearchResult[]): string => {
  return results.map(result => 
    `Title: ${result.title}\nLink: ${result.link}\nSnippet: ${result.snippet}`
  ).join("\n\n");
};

// Simulated web search function (replace with actual implementation)
export const searchWeb = async (query: string): Promise<WebSearchResult[]> => {
  // Simulate web search results
  console.log(`Searching the web for: ${query}`);
  
  // This would be replaced with an actual API call in production
  return [
    {
      title: "Example Search Result 1",
      link: "https://example.com/result1",
      snippet: "This is an example search result snippet that would match the query."
    },
    {
      title: "Example Search Result 2",
      link: "https://example.com/result2",
      snippet: "Another example search result with information related to the query."
    }
  ];
};
