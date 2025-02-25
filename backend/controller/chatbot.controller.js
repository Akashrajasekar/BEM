// chatbot.controller.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const generateChatResponse = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    // Validate inputs
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Ensure conversationHistory is properly formatted
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: msg.text
    }));

    // Log for debugging
    //console.log('Formatted History:', formattedHistory);
    //console.log('Current Message:', message);

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      }
    });
    
    // Create chat
    const chat = model.startChat();

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    // Log successful response
    //console.log('Gemini Response:', response.text());

    res.json({
      success: true,
      message: response.text()
    });

  } catch (error) {
    // Detailed error logging
    console.error('Detailed Gemini API Error:', {
      message: error.message,
      stack: error.stack,
      details: error.details || 'No additional details'
    });

    // Send appropriate error response
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

