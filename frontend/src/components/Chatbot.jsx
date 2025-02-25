import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Input,
  IconButton,
  Text,
  Flex,
  useDisclosure,
  CloseButton,
  InputGroup,
  InputRightElement,
  Spinner,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { FaComments, FaPaperPlane, FaFileUpload } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatMessage = ({ message, isUser }) => (
  <Flex justify={isUser ? "flex-end" : "flex-start"} mb={4}>
    <Box
      maxW="80%"
      bg={isUser ? "orange.500" : "gray.100"}
      color={isUser ? "white" : "gray.800"}
      px={4}
      py={2}
      borderRadius="lg"
    >
      <Text fontSize="sm" whiteSpace="pre-line">{message}</Text>
    </Box>
  </Flex>
);

const QuickOption = ({ text, onClick }) => (
  <Tag
    size="md"
    variant="solid"
    colorScheme="orange"
    cursor="pointer"
    py={2}
    px={3}
    borderRadius="full"
    onClick={onClick}
    _hover={{ opacity: 0.8 }}
  >
    {text}
  </Tag>
);

const Chatbot = () => {
  const { isOpen, onToggle } = useDisclosure();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Predefined responses for common expense-related questions
  const predefinedResponses = {
    'how do i submit an expense': `You have two options for submitting an expense:

1. Manual submission:
   - Go to the 'Create Expense' page
   - Fill in all required details
   - Submit for approval or save as draft

2. Receipt Upload:
   - Go to the 'Dashboard' page
   - Click 'Upload Expense' from quick actions
   - Upload a receipt
   - Fill in any additional details
   - Submit for approval or save as draft`,

    'upload a receipt': `To upload a receipt:

1. Click on the file upload button that appears below
2. Select your receipt image
3. The system will automatically extract information
4. Review the details on the draft expenses page
5. Save as draft or submit for approval

Would you like to upload a receipt now?`
  };

  // Quick options that users can click on
  const quickOptions = [
    "How do I submit an expense?",
    "Upload a receipt"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hide quick options once user has interacted with the chatbot
  useEffect(() => {
    if (messages.length > 0) {
      setShowQuickOptions(false);
    }
  }, [messages]);

  // Display welcome message without adding it to conversation history
  const displayedMessages = [
    { text: "Hello! How can I help you with your expenses today?", isUser: false },
    ...messages
  ];

  // Check if the user's message matches any predefined responses
  const checkPredefinedResponse = (message) => {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check for exact matches or contains key phrases
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (normalizedMessage === key || normalizedMessage.includes(key)) {
        return response;
      }
    }
    
    return null;
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: `Uploading receipt: ${file.name}...`, isUser: false }]);
      
      const token = localStorage.getItem('token');
      
      // Call the saveReceiptAsDraft endpoint instead of extractReceiptText
      const response = await axios.post('http://localhost:5000/api/auth/extract-receipt-text', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          text: "Receipt uploaded successfully! Redirecting to draft expenses page...", 
          isUser: false 
        }]);
        
        // Redirect to draft page after a short delay
        setTimeout(() => {
          navigate('/draft');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setMessages(prev => [...prev, { 
        text: `Error uploading receipt: ${error.response?.data?.message || error.message}`, 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleQuickOptionClick = async (option) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text: option, isUser: true }]);
    
    // Check if this is the upload receipt option
    if (option.toLowerCase().includes("upload a receipt")) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['upload a receipt'], 
          isUser: false 
        }]);
        
        // Show file upload button after a brief delay
        setTimeout(() => {
          // Trigger file input click programmatically
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }, 500);
      }, 500);
      return;
    }
    
    // Get corresponding predefined response based on the option text
    const response = checkPredefinedResponse(option.toLowerCase());
    
    if (response) {
      // Add bot response after a small delay for a more natural feel
      setTimeout(() => {
        setMessages(prev => [...prev, { text: response, isUser: false }]);
      }, 500);
    } else {
      // If somehow no predefined response exists, send to Gemini
      await sendMessageToGemini(option);
    }
  };

  const sendMessageToGemini = useCallback(async (message) => {
    try {
      setIsLoading(true);
      
      // Check for "upload" related keywords to trigger upload flow
      if (message.toLowerCase().includes("upload") && message.toLowerCase().includes("receipt")) {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['upload a receipt'], 
          isUser: false 
        }]);
        
        // Show file upload button after a brief delay
        setTimeout(() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }, 500);
        
        setIsLoading(false);
        return;
      }
      
      // Check for predefined responses first
      const predefinedResponse = checkPredefinedResponse(message);
      
      if (predefinedResponse) {
        // Use predefined response instead of calling the API
        setMessages(prev => [...prev, { text: predefinedResponse, isUser: false }]);
        setIsLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/auth/chat/gemini', {
        message,
        conversationHistory: messages,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { text: response.data.message, isUser: false }]);
      } else {
        throw new Error(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Chat Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = "I'm sorry, I encountered an error. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error.response?.data?.details && process.env.NODE_ENV === 'development') {
        errorMessage = `Error: ${error.response.data.details}`;
      }

      setMessages(prev => [...prev, { 
        text: errorMessage,
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage = inputValue.trim();
      setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
      setInputValue("");
      await sendMessageToGemini(userMessage);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  // Show quick options again if user clears chat
  const handleReset = () => {
    setMessages([]);
    setShowQuickOptions(true);
  };

  return (
    <Box position="fixed" bottom={4} right={4} zIndex={100}>
      {/* Hidden file input element */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {!isOpen && (
        <IconButton
          icon={<FaComments />}
          colorScheme="orange"
          rounded="full"
          size="lg"
          onClick={onToggle}
          shadow="md"
        />
      )}

      {isOpen && (
        <Box
          w="300px"
          h="400px"
          bg="white"
          rounded="lg"
          shadow="xl"
          display="flex"
          flexDirection="column"
        >
          <Flex
            align="center"
            justify="space-between"
            p={4}
            borderBottom="1px"
            borderColor="gray.200"
          >
            <Text fontWeight="medium">AI Support Chat</Text>
            <Flex>
              {messages.length > 0 && (
                <Button 
                  size="xs" 
                  mr={2} 
                  onClick={handleReset}
                  colorScheme="gray"
                >
                  Reset
                </Button>
              )}
              <CloseButton onClick={onToggle} />
            </Flex>
          </Flex>

          <VStack
            flex={1}
            overflowY="auto"
            p={4}
            spacing={4}
            align="stretch"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'gray.200',
                borderRadius: '24px',
              },
            }}
          >
            {displayedMessages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.text}
                isUser={message.isUser}
              />
            ))}
            
            {/* Quick Options */}
            {showQuickOptions && displayedMessages.length <= 1 && (
              <Box mt={2}>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Popular questions:
                </Text>
                <VStack align="stretch" spacing={2}>
                  {quickOptions.map((option, index) => (
                    <QuickOption
                      key={index}
                      text={option}
                      onClick={() => handleQuickOptionClick(option)}
                    />
                  ))}
                </VStack>
              </Box>
            )}
            
            {/* File upload button - appears after upload request */}
            {messages.length > 0 && 
             messages[messages.length-1].text === predefinedResponses['upload a receipt'] && (
              <Flex justify="center" mt={2}>
                <Button
                  leftIcon={<FaFileUpload />}
                  colorScheme="orange"
                  size="sm"
                  onClick={() => fileInputRef.current.click()}
                  isLoading={isLoading}
                >
                  Choose Receipt Image
                </Button>
              </Flex>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>

          <Box p={4} borderTop="1px" borderColor="gray.200">
            <InputGroup size="md">
              <Input
                pr="3.5rem"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                isDisabled={isLoading}
              />
              <InputRightElement width="3.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  icon={isLoading ? <Spinner size="sm" /> : <FaPaperPlane />}
                  onClick={handleSend}
                  colorScheme="orange"
                  variant="ghost"
                  isDisabled={isLoading}
                />
              </InputRightElement>
            </InputGroup>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chatbot;