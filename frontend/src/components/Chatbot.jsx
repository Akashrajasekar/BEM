// components/Chatbot.jsx
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
  } from "@chakra-ui/react";
  import { FaComments, FaPaperPlane } from "react-icons/fa";
  import { useState } from "react";
  
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
        <Text fontSize="sm">{message}</Text>
      </Box>
    </Flex>
  );
  
  const Chatbot = () => {
    const { isOpen, onToggle } = useDisclosure();
    const [messages, setMessages] = useState([
      { text: "Hello! How can I help you with your expenses today?", isUser: false },
    ]);
    const [inputValue, setInputValue] = useState("");
  
    const handleSend = () => {
      if (inputValue.trim()) {
        setMessages([...messages, { text: inputValue, isUser: true }]);
        // Simulate bot response
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { text: "Thanks for your message. Our support team will get back to you soon.", isUser: false }
          ]);
        }, 1000);
        setInputValue("");
      }
    };
  
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        handleSend();
      }
    };
  
    return (
      <Box position="fixed" bottom={4} right={4} zIndex={100}>
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
            {/* Chat Header */}
            <Flex
              align="center"
              justify="space-between"
              p={4}
              borderBottom="1px"
              borderColor="gray.200"
            >
              <Text fontWeight="medium">Support Chat</Text>
              <CloseButton onClick={onToggle} />
            </Flex>
  
            {/* Chat Messages */}
            <VStack
              flex={1}
              overflowY="auto"
              p={4}
              spacing={4}
              align="stretch"
            >
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isUser={message.isUser}
                />
              ))}
            </VStack>
  
            {/* Chat Input */}
            <Box p={4} borderTop="1px" borderColor="gray.200">
              <InputGroup size="md">
                <Input
                  pr="3.5rem"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <InputRightElement width="3.5rem">
                  <IconButton
                    h="1.75rem"
                    size="sm"
                    icon={<FaPaperPlane />}
                    onClick={handleSend}
                    colorScheme="orange"
                    variant="ghost"
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