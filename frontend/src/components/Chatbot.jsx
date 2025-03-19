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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  Stack,
} from "@chakra-ui/react";
import { FaComments, FaPaperPlane, FaFileUpload, FaCalendarAlt, FaEdit, FaExpand, FaCompress } from "react-icons/fa";
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
      <Text fontSize="md" whiteSpace="pre-line">{message}</Text>
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

const DateRangeSelector = ({ onSubmit, onCancel }) => {
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    // Reset dates and set isCustom flag when report period changes
    if (reportPeriod === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setDateFrom("");
      setDateTo("");
    }
  }, [reportPeriod]);

  const handleSubmit = () => {
    onSubmit({
      reportPeriod,
      dateFrom: isCustom ? dateFrom : null,
      dateTo: isCustom ? dateTo : null,
    });
  };

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={4}
      mt={4}
      border="1px solid"
      borderColor="gray.200"
    >
      <Text fontWeight="medium" mb={3}>Report Period Options</Text>
      
      <RadioGroup onChange={setReportPeriod} value={reportPeriod} mb={4}>
        <Stack direction="column" spacing={2}>
          <Radio value="weekly">Weekly Report (Current Week)</Radio>
          <Radio value="monthly">Monthly Report (Current Month)</Radio>
          <Radio value="yearly">Yearly Report (Current Year)</Radio>
          <Radio value="custom">Custom Date Range</Radio>
        </Stack>
      </RadioGroup>
      
      {isCustom && (
        <VStack spacing={3} align="stretch" mb={4}>
          <FormControl>
            <FormLabel fontSize="sm">From Date</FormLabel>
            <Input 
              type="date" 
              size="sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel fontSize="sm">To Date</FormLabel>
            <Input 
              type="date" 
              size="sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </FormControl>
        </VStack>
      )}
      
      <HStack spacing={3} justify="flex-end">
        <Button size="sm" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button 
          size="sm" 
          colorScheme="orange"
          onClick={handleSubmit}
          isDisabled={isCustom && (!dateFrom || !dateTo)}
        >
          Generate Report
        </Button>
      </HStack>
    </Box>
  );
};

const ExpenseSubmissionOptions = ({ onOptionSelect, onCancel }) => {
  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={4}
      mt={4}
      border="1px solid"
      borderColor="gray.200"
    >
      <Text fontWeight="medium" mb={3}>Submit an Expense</Text>
      
      <VStack spacing={3} align="stretch" mb={4}>
        <Button 
          leftIcon={<FaFileUpload />}
          colorScheme="orange"
          variant="outline"
          justifyContent="flex-start"
          onClick={() => onOptionSelect('upload')}
        >
          Upload a receipt
        </Button>
        
        <Button 
          leftIcon={<FaEdit />}
          colorScheme="orange"
          variant="outline"
          justifyContent="flex-start"
          onClick={() => onOptionSelect('manual')}
        >
          Enter expense details manually
        </Button>
      </VStack>
      
      <Text fontSize="xs" color="gray.500" mb={3}>
        Receipt upload uses AI OCR to extract details automatically!
      </Text>
      
      <HStack spacing={3} justify="flex-end">
        <Button size="sm" onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </HStack>
    </Box>
  );
};

const Chatbot = () => {
  // Add state for expanded view
  const [showPopup, setShowPopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen, onToggle, onOpen } = useDisclosure({ defaultIsOpen: false });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userAccess, setUserAccess] = useState(null);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showExpenseSubmissionOptions, setShowExpenseSubmissionOptions] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showFollowUpOptions, setShowFollowUpOptions] = useState(false);

  // Get API URL with Vite-specific environment variables
    useEffect(() => {
      // For Vite apps, environment variables must be prefixed with VITE_
      const envApiUrl = import.meta.env.VITE_API_URL;
      
      if (envApiUrl) {
        setApiUrl(envApiUrl);
        console.log('Using API URL from environment:', envApiUrl);
      } else {
        console.log('No VITE_API_URL found, using default:', apiUrl);
        console.log('Available environment variables:', import.meta.env);
      }
    }, []);

  const PopupNotification = () => (
    <Box
      position="fixed"
      bottom="80px"
      right="20px"
      bg="white"
      p={3}
      borderRadius="md"
      boxShadow="md"
      zIndex={101}
    >
      <Text>Hi! How can I help you manage your expense?✨</Text>
    </Box>
  );
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000); // Show popup after 2 seconds
  
    return () => clearTimeout(timer);
  }, []);
  
  const handleFollowUpOption = (option) => {
    setShowFollowUpOptions(false);
    
    if (option === 'yes') {
      // Step-by-step guidance
      setMessages(prev => [...prev, { 
        text: "Great! Let me break down the process into simple steps:", 
        isUser: false 
      }]);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "Step 1: Choose your submission method (upload receipt or manual entry)\nStep 2: Fill in required details\nStep 3: Review for accuracy\nStep 4: Submit for approval\n\nWould you like to start the process now?", 
          isUser: false 
        }]);
        
        // Show expense submission options after explanation
        setTimeout(() => {
          setShowExpenseSubmissionOptions(true);
        }, 1000);
      }, 1000);
    } else {
      // Quick access links
      // setMessages(prev => [...prev, { 
      //   text: "Here's quick access to expense submission options:", 
      //   isUser: false 
      // }]);
      
      // // Show expense submission options immediately
      // setTimeout(() => {
      //   setShowExpenseSubmissionOptions(true);
      // }, 500);
    }
  };

  // Check user access level when component mounts
  useEffect(() => {
    const access = localStorage.getItem('access');
    setUserAccess(access);
    // Force chat to open on initial load
    //onOpen();
  }, []);

  // Predefined responses for common expense-related questions
  const predefinedResponses = {
    'submit an expense': `Got it! Would you like to upload a receipt or enter details manually?`,

    'expense submission flow': `There are two ways to submit an expense:

1. Upload a receipt:
   - I can extract details from your receipt automatically using AI OCR
   - You can review and adjust before submitting

2. Enter details manually:
   - You'll fill in all expense information yourself
   - Great for expenses without receipts

Want me to walk you through submitting your first expense?`,

    'whats the status of my last expense claim': `Let me check your most recent expense claim...`,

    'generate ai expense report': `I'll help you generate an AI expense report. Please select a report period:

- Weekly: Analysis of the current week's expenses
- Monthly: Comprehensive monthly expense analysis
- Yearly: Annual expense trends and patterns
- Custom: Select your own date range

Please select an option below.`
  };

  // Quick options that users can click on
  const quickOptions = [
    "Submit an expense",
    "What's the status of my last expense claim?",
    "Generate AI expense report",
    "How does expense submission work?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, showReportOptions, showExpenseSubmissionOptions]);

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
    
    // Special case for "how does expense submission work"
    if (
      normalizedMessage.includes("how") && 
      normalizedMessage.includes("expense") && 
      (normalizedMessage.includes("work") || normalizedMessage.includes("submit"))
    ) {
      return predefinedResponses['expense submission flow'];
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
      const response = await axios.post(`${apiUrl}/api/auth/extract-receipt-text`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          text: "Receipt uploaded successfully! Extracting details and redirecting to the review page...", 
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

  // Get last expense status
  const getLastExpenseStatus = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${apiUrl}/api/auth/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.data && response.data.length > 0) {
        // Sort expenses by creation date (newest first)
        const sortedExpenses = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const lastExpense = sortedExpenses[0];
        
        // Format the response with expense details
        const statusMessage = `Your latest expense for ${lastExpense.currency} ${lastExpense.amount.toFixed(2)} on '${lastExpense.category}' (${lastExpense.merchant}) is currently '${lastExpense.submissionStatus === 'Draft' ? 'Saved as Draft' : lastExpense.approvalStatus}'. ${lastExpense.submissionStatus === 'Draft' ? "You need to submit it for approval." : ""}`;
        
        setMessages(prev => [...prev, { text: statusMessage, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "You don't have any expense claims in the system yet. Would you like to create one?", 
          isUser: false 
        }]);
        
        // After a short delay, show expense submission options
        setTimeout(() => {
          setShowExpenseSubmissionOptions(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Get expenses error:', error);
      setMessages(prev => [...prev, { 
        text: `Error retrieving expense status: ${error.response?.data?.message || error.message}`, 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI report with period options
  const generateAIReport = async (reportOptions) => {
    try {
      setIsLoading(true);
      setShowReportOptions(false);
      
      const { reportPeriod, dateFrom, dateTo } = reportOptions;
      
      let reportTypeMessage = "";
      if (reportPeriod === "weekly") {
        reportTypeMessage = "weekly (current week)";
      } else if (reportPeriod === "monthly") {
        reportTypeMessage = "monthly (current month)";
      } else if (reportPeriod === "yearly") {
        reportTypeMessage = "yearly (current year)";
      } else {
        const fromDate = new Date(dateFrom).toLocaleDateString();
        const toDate = new Date(dateTo).toLocaleDateString();
        reportTypeMessage = `custom (${fromDate} to ${toDate})`;
      }
      
      setMessages(prev => [...prev, { 
        text: `Initiating ${reportTypeMessage} expense report generation...`, 
        isUser: false 
      }]);
      
      const token = localStorage.getItem('token');
      
      // Prepare query parameters
      let queryParams = new URLSearchParams();
      queryParams.append('reportPeriod', reportPeriod);
      
      if (reportPeriod === 'custom' && dateFrom && dateTo) {
        queryParams.append('dateFrom', dateFrom);
        queryParams.append('dateTo', dateTo);
      }
      
      // Call the report generation API
      const response = await axios.get(`${apiUrl}/api/auth/user-reports/generate?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.data.success) {
        setMessages(prev => [...prev, { 
          text: `${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} AI report generation initiated successfully! Redirecting to reports page...`, 
          isUser: false 
        }]);
        
        // Redirect to reports page after a short delay
        setTimeout(() => {
          navigate('/report');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Report generation failed');
      }
    } catch (error) {
      console.error('Report Generation Error:', error);
      setMessages(prev => [...prev, { 
        text: `Error generating AI report: ${error.response?.data?.message || error.message}`, 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle expense submission method selection
  const handleExpenseSubmissionOption = (option) => {
    setShowExpenseSubmissionOptions(false);
    
    if (option === 'upload') {
      // Show receipt upload message and trigger file input
      setMessages(prev => [...prev, { 
        text: "I can extract details from your receipt automatically—just upload it!", 
        isUser: false 
      }]);
      
      // Show file upload button after a brief delay
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 500);
    } else if (option === 'manual') {
      // Show message for manual entry and redirect
      setMessages(prev => [...prev, { 
        text: "Redirecting you to the manual expense entry form...", 
        isUser: false 
      }]);
      
      // Redirect to manual expense page after a short delay
      setTimeout(() => {
        navigate('/manual_expense');
      }, 1500);
    }
  };
  
  // Handle expense submission option cancellation
  const handleExpenseSubmissionCancel = () => {
    setShowExpenseSubmissionOptions(false);
    setMessages(prev => [...prev, { 
      text: "Expense submission cancelled. Is there anything else I can help you with?", 
      isUser: false 
    }]);
  };

  const handleQuickOptionClick = async (option) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text: option, isUser: true }]);
    
    // Handle expense status option
    if (option.toLowerCase().includes("status of my last expense")) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['whats the status of my last expense claim'], 
          isUser: false 
        }]);
        
        // Call the function to get and display expense status
        getLastExpenseStatus();
      }, 500);
      return;
    }
    
    // Check if this is the submit expense option
    if (option.toLowerCase().includes("submit an expense")) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['submit an expense'], 
          isUser: false 
        }]);
        
        // Show expense submission options after a brief delay
        setTimeout(() => {
          setShowExpenseSubmissionOptions(true);
        }, 500);
      }, 500);
      return;
    }
    
    // Inside handleQuickOptionClick function, in the "how does expense submission work" section:
    if (option.toLowerCase().includes("how does expense submission work")) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['expense submission flow'], 
          isUser: false 
        }]);
        
        // Add follow-up options after a brief delay
        setTimeout(() => {
          setShowFollowUpOptions(true);  // You'll need to add this state
        }, 500);
      }, 500);
      return;
    }
    
    // Check if this is the generate report option
    if (option.toLowerCase().includes("generate ai expense report")) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['generate ai expense report'], 
          isUser: false 
        }]);
        
        // Show report options after a brief delay
        setTimeout(() => {
          setShowReportOptions(true);
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
      
      // Check for expense status related keywords
      if (message.toLowerCase().includes("status") && message.toLowerCase().includes("expense")) {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['whats the status of my last expense claim'], 
          isUser: false 
        }]);
        
        // Get and display expense status
        await getLastExpenseStatus();
        
        setIsLoading(false);
        return;
      }
      
      // Check for expense submission related keywords
      if ((message.toLowerCase().includes("submit") || message.toLowerCase().includes("create") || 
           message.toLowerCase().includes("add") || message.toLowerCase().includes("new")) && 
          message.toLowerCase().includes("expense")) {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['submit an expense'], 
          isUser: false 
        }]);
        
        // Show expense submission options after a brief delay
        setTimeout(() => {
          setShowExpenseSubmissionOptions(true);
        }, 500);
        
        setIsLoading(false);
        return;
      }
      
      // Check for expense submission flow related keywords
      if (message.toLowerCase().includes("how") && 
          message.toLowerCase().includes("expense") && 
          (message.toLowerCase().includes("work") || message.toLowerCase().includes("submit"))) {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['expense submission flow'], 
          isUser: false 
        }]);
        
        setIsLoading(false);
        return;
      }
      
      // Check for report generation keywords
      if (message.toLowerCase().includes("generate") && 
          (message.toLowerCase().includes("report") || message.toLowerCase().includes("analysis"))) {
        setMessages(prev => [...prev, { 
          text: predefinedResponses['generate ai expense report'], 
          isUser: false 
        }]);

        // Show report options after a brief delay
        setTimeout(() => {
          setShowReportOptions(true);
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
      
      const response = await axios.post(`${apiUrl}/api/auth/chat/gemini`, {
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
    setShowReportOptions(false);
    setShowExpenseSubmissionOptions(false);
  };

  // Toggle expanded/compact view
  const toggleExpandView = () => {
    setIsExpanded(!isExpanded);
  };

  // Function to determine if we should show the upload button for receipt
  const shouldShowUploadButton = () => {
    return messages.length > 0 && 
           messages[messages.length-1].text === "I can extract details from your receipt automatically—just upload it!";
  };

  // Function to check if we should show quick options based on user's access level
  const shouldShowQuickOptions = () => {
    // Only show quick options for employees
    return userAccess === 'employee' && 
           displayedMessages.length > 0 && 
           !displayedMessages[displayedMessages.length - 1].isUser &&
           !shouldShowUploadButton() &&
           !showReportOptions &&
           !showExpenseSubmissionOptions;
           !showFollowUpOptions;  // Add this condition
  };

  const handleReportSubmit = (options) => {
    generateAIReport(options);
  };

  const handleReportCancel = () => {
    setShowReportOptions(false);
    setMessages(prev => [...prev, { 
      text: "Report generation cancelled. Is there anything else I can help you with?", 
      isUser: false 
    }]);
  };

  const FollowUpOptions = ({ onOptionSelect, onCancel }) => {
    return (
      <Box
        bg="white"
        borderRadius="md"
        boxShadow="md"
        p={4}
        mt={4}
        border="1px solid"
        borderColor="gray.200"
      >
        <VStack spacing={3} >
          <Button 
            colorScheme="orange"
            width="full"
            onClick={() => onOptionSelect('yes')}
          >
            Yes, walk me through it
          </Button>
          <Button 
            variant="outline"
            width="full"
            onClick={() => onOptionSelect('no')}
          >
            No, just quick access
          </Button>
        </VStack>
      </Box>
    );
  };

  const handleToggle = () => {
    onToggle();
    setShowPopup(false);
  };
  

  return (
    <Box
      position="fixed"
      bottom={0}
      right={0}
      zIndex={100}
      width={isExpanded ? "450px" : "350px"}
      height={isExpanded ? "100vh" : isOpen ? "550px" : "auto"}
      transition="all 0.3s ease"
    >
      {!isOpen && showPopup && <PopupNotification />}

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
          onClick={handleToggle}
          shadow="md"
          position="fixed"
          bottom="20px"
          right="20px"
        />
      )}

      {isOpen && (
        <Box
          height="100%"
          bg="white"
          rounded={isExpanded ? "0" : "lg"}
          shadow="xl"
          display="flex"
          flexDirection="column"
          border="1px solid"
          borderColor="gray.200"
        >
          <Flex
            align="center"
            justify="space-between"
            p={4}
            borderBottom="1px"
            borderColor="gray.200"
            bg="orange.500"
            color="white"
            roundedTop={isExpanded ? "0" : "lg"}
          >
            <Text fontWeight="bold" fontSize="lg">Expense AI Assistant</Text>
            <Flex>
              <IconButton
                icon={isExpanded ? <FaCompress /> : <FaExpand />}
                aria-label={isExpanded ? "Compact view" : "Expanded view"}
                size="sm"
                onClick={toggleExpandView}
                variant="ghost"
                color="white"
                _hover={{ bg: "orange.600" }}
                mr={2}
              />
              {messages.length > 0 && (
                <Button 
                  size="sm" 
                  mr={2} 
                  onClick={handleReset}
                  colorScheme="orange"
                  variant="outline"
                  color="white"
                  _hover={{ bg: "orange.600" }}
                  borderColor="white"
                >
                  Reset
                </Button>
              )}
              <CloseButton onClick={onToggle} color="white" _hover={{ bg: "orange.600" }} />
            </Flex>
          </Flex>

          <VStack
            flex={1}
            overflowY="auto"
            p={4}
            spacing={4}
            align="stretch"
            bg="gray.50"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                width: '8px',
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '24px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
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
            
            {/* Show follow-up options */}
            {userAccess === 'employee' && showFollowUpOptions && (
              <FollowUpOptions 
                onOptionSelect={handleFollowUpOption}
                onCancel={() => setShowFollowUpOptions(false)}
              />
            )}

            {/* Show expense submission options */}
            {userAccess === 'employee' && showExpenseSubmissionOptions && (
              <ExpenseSubmissionOptions 
                onOptionSelect={handleExpenseSubmissionOption}
                onCancel={handleExpenseSubmissionCancel}
              />
            )}
            
            {/* Show report period selector */}
            {userAccess === 'employee' && showReportOptions && (
              <DateRangeSelector 
                onSubmit={handleReportSubmit}
                onCancel={handleReportCancel}
              />
            )}
            
            {/* Show quick options only for employees */}
            {shouldShowQuickOptions() && (
              <Box mt={2}>
                <Text fontSize="sm" color="gray.600" mb={2} fontWeight="medium">
                  Common questions:
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
            {userAccess === 'employee' && shouldShowUploadButton() && (
              <Flex justify="center" mt={2}>
                <Button
                  leftIcon={<FaFileUpload />}
                  colorScheme="orange"
                  size="md"
                  onClick={() => fileInputRef.current.click()}
                  isLoading={isLoading}
                >
                  Choose Receipt Image
                </Button>
              </Flex>
            )}
            
            <div ref={messagesEndRef} />
          </VStack>

          <Box p={4} borderTop="1px" borderColor="gray.200" bg="white">
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                isDisabled={isLoading || showReportOptions || showExpenseSubmissionOptions}
                fontSize="md"
                bg="white"
                focusBorderColor="orange.400"
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  icon={isLoading ? <Spinner size="sm" /> : <FaPaperPlane />}
                  onClick={handleSend}
                  colorScheme="orange"
                  isDisabled={isLoading || showReportOptions || showExpenseSubmissionOptions || !inputValue.trim()}
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