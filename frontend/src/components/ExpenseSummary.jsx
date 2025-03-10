import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
  Flex,
  Select,
  Spinner,
  Center,
  useToast
} from "@chakra-ui/react";
import axios from 'axios';

const ExpenseSummary = () => {
  // States
  const [expenses, setExpenses] = useState([]);
  const [timeRange, setTimeRange] = useState('7');
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // API configuration
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/auth/expenses', config);
      
      // Filter expenses based on the selected time range
      const filteredExpenses = filterExpensesByTimeRange(response.data, timeRange);
      setExpenses(filteredExpenses);
    } catch (error) {
      toast({
        title: 'Error fetching expenses',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter expenses based on time range
  const filterExpensesByTimeRange = (allExpenses, days) => {
    const daysInMilliseconds = parseInt(days) * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - daysInMilliseconds);
    
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= cutoffDate;
    });
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Get badge color based on status
  const getBadgeColor = (status) => {
    switch(status) {
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      case 'AutoFlagged': return 'orange';
      default: return 'yellow';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const symbols = {
      'USD': '$',
      'INR': '₹',
      'AED': 'د.إ'
    };
    
    return `${symbols[currency] || ''}${parseFloat(amount).toFixed(2)}`;
  };

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);
  
  // Filter expenses when timeRange changes
  useEffect(() => {
    if (expenses.length > 0) {
      fetchExpenses();
    }
  }, [timeRange]);

  return (
    <Box bg="white" rounded="lg" shadow="base" p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Expense Summary</Heading>
        <Select 
          w="auto" 
          size="sm" 
          maxW="200px" 
          value={timeRange}
          onChange={handleTimeRangeChange}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </Flex>
      
      <Box overflowX="auto">
        {isLoading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Merchant</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <Tr key={expense._id}>
                    <Td>{formatDate(expense.expenseDate)}</Td>
                    <Td>{expense.merchant}</Td>
                    <Td>{expense.category}</Td>
                    <Td>{formatCurrency(expense.amount, expense.currency)}</Td>
                    <Td>
                      <Badge
                        colorScheme={getBadgeColor(expense.approvalStatus)}
                        rounded="full"
                        px={2}
                        py={1}
                      >
                        {expense.approvalStatus}
                      </Badge>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center">No expenses found</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default ExpenseSummary;