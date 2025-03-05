import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Progress,
  SimpleGrid,
  Input,
  Select,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

const BasicInformation = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="gray.900" fontWeight="medium">
        Basic Information
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={6}>
        
        
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
            Date of Expense
          </FormLabel>
          <Input 
            type="date" 
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleChange}
            borderColor="gray.300" 
          />
        </FormControl>
      </SimpleGrid>
    </VStack>
  );
};

const ExpenseDetails = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Heading size="lg" color="gray.900" fontWeight="medium">
          Expense Details
        </Heading>
      </Flex>
      
      <Box bg="gray.50" p={{ base: 4, sm: 6 }} rounded="lg" spacing={4}>
        <VStack spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Expense Category
              </FormLabel>
              <Select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                borderColor="gray.300"
                bg="white"
                shadow="sm"
              >
                <option value="">Select Category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Merchant Name
              </FormLabel>
              <Input 
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                placeholder="Enter merchant name"
                borderColor="gray.300"
                bg="white"
                shadow="sm"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Amount
              </FormLabel>
              <Input 
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                type="number" 
                placeholder="0.00"
                borderColor="gray.300"
                bg="white"
                shadow="sm"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Currency
              </FormLabel>
              <Select 
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                borderColor="gray.300"
                bg="white"
                shadow="sm"
              >
                <option value="">Select Currency</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="AED">AED</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
              Description
            </FormLabel>
            <Textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter expense description" 
              rows={3}
              borderColor="gray.300"
              bg="white"
              shadow="sm"
            />
          </FormControl>
        </VStack>
      </Box>
    </VStack>
  );
};

const CreateExp = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    expenseDate: '',
    category: '',
    merchant: '',
    amount: '',
    currency: '',
    description: '',
  });

  const validateForm = () => {
    const requiredFields = ['merchant', 'amount', 'currency', 'expenseDate'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'You need to be logged in to submit expenses',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/expenses/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          submissionStatus: isDraft ? 'Draft' : 'Submitted'
        })
      });
  
      const data = await response.json();
  
      if (data.success) {
        toast({
          title: isDraft ? 'Draft Saved' : 'Expense Submitted',
          description: isDraft ? 'Your expense has been saved as draft.' : 'Your expense has been submitted for approval.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Reset form after successful submission
        setFormData({
          department: '',
          expenseDate: '',
          category: '',
          merchant: '',
          amount: '',
          currency: '',
          description: '',
        });
      } else {
        // Handle specific validation errors from the backend
        if (data.requiredFields) {
          toast({
            title: 'Missing Required Fields',
            description: `Please fill in: ${data.requiredFields.join(', ')}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (response.status === 409) {
          // Handle duplicate expense error
          toast({
            title: 'Duplicate Expense',
            description: data.message || 'This expense appears to be a duplicate.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while submitting the expense.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      department: '',
      expenseDate: '',
      category: '',
      merchant: '',
      amount: '',
      currency: '',
      description: '',
    });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="4xl" py={10} px={{ base: 4, sm: 6, lg: 8 }}>
        <Box bg="white" shadow="base" rounded="lg">
          <Box p={6} borderBottom="1px" borderColor="gray.200">
            <Flex justify="space-between" align="center">
              <Heading size="2xl" color="gray.900">Expense Submission</Heading>
            </Flex>
          </Box>
          
          <VStack as="form" spacing={8} p={6} align="stretch" w="full">
            <BasicInformation formData={formData} setFormData={setFormData} />
            <ExpenseDetails formData={formData} setFormData={setFormData} />
          </VStack>
          
          <Flex 
            px={6} 
            py={4} 
            bg="gray.50" 
            borderTop="1px" 
            borderColor="gray.200"
            justify="flex-end" 
            gap={4}
          >
            <Button 
              variant="outline" 
              color="gray.700"
              borderColor="gray.300"
              _hover={{ bg: 'gray.50' }}
              onClick={handleClearForm}
              isDisabled={isLoading}
            >
              Clear Form
            </Button>
            <Button 
              variant="outline" 
              color="orange.500"
              borderColor="orange.500"
              _hover={{ bg: 'orange.50' }}
              onClick={() => handleSubmit(true)}
              isDisabled={isLoading}
            >
              Save as Draft
            </Button>
            <Button 
              bg="orange.500"
              color="white"
              _hover={{ bg: 'orange.600' }}
              onClick={() => handleSubmit(false)}
              isLoading={isLoading}
            >
              Submit for Approval
            </Button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateExp;