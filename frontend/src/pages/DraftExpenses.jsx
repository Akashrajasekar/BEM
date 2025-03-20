import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Badge,
  Image,
  Grid,
  GridItem,
  Flex,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaCalendar, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaChevronLeft, 
  FaChevronRight, 
  FaPaperPlane, 
  FaFileImage 
} from 'react-icons/fa';
import { FormControl, FormLabel } from '@chakra-ui/react';
import { useNotifications } from '../components/NotificationContext';

const DraftExpenses = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [apiUrl, setApiUrl] = useState('https://bem-47rp.onrender.com');
  const toast = useToast();
  const { addNotification } = useNotifications();

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

  // State management
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [departmentCategories, setDepartmentCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [expensesPerPage] = useState(5);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
        merchant: '',
        amount: '',
        expenseDate: ''
    });
  
  // Add this useEffect to update filtered expenses when original expenses array or filter values change
useEffect(() => {
  let result = [...expenses];
  
  // Apply text search filter on merchant
  if (searchQuery) {
    result = result.filter(expense => 
      expense.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply category filter
  if (selectedCategory) {
    result = result.filter(expense => expense.category === selectedCategory);
  }
  
  // Apply date filter
  if (selectedDate) {
    const filterDate = new Date(selectedDate).setHours(0, 0, 0, 0);
    result = result.filter(expense => {
      const expenseDate = new Date(expense.expenseDate).setHours(0, 0, 0, 0);
      return expenseDate === filterDate;
    });
  }
  
  setFilteredExpenses(result);
  // If current selected expense is filtered out, select the first visible expense or null
  if (selectedExpense && !result.find(exp => exp._id === selectedExpense._id)) {
    setSelectedExpense(result[0] || null);
  }
  
  // Only reset the page when filters actually change, not on every data refresh
  if (searchQuery || selectedCategory || selectedDate) {
    setCurrentPage(1);
  }
  
}, [expenses, searchQuery, selectedCategory, selectedDate]);

   // Initialize edit form
  const handleEditClick = (expense) => {
    setEditForm({
        merchant: expense.merchant,
        amount: expense.amount,
        category: expense.category,
        expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0]
    });
    setIsEditing(true);
  };
  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
        ...prev,
        [name]: value
    }));
};

// Handle form submission
const handleEditSubmit = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/auth/expenses/${selectedExpense._id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editForm)
        });

        if (!response.ok) {
            throw new Error('Failed to update expense');
        }

        const updatedExpense = await response.json();

        // Update local state
        setExpenses(prevExpenses => 
            prevExpenses.map(exp => 
                exp._id === selectedExpense._id ? updatedExpense.data : exp
            )
        );
        setSelectedExpense(updatedExpense.data);
        setIsEditing(false);

        toast({
            title: 'Success',
            description: 'Expense updated successfully',
            status: 'success',
            duration: 3000,
        });
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to update expense',
            status: 'error',
            duration: 3000,
        });
    }
};

// Modify your existing useEffect for fetching expenses
useEffect(() => {
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/auth/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      
   
      setExpenses(data);
      if (data.length > 0 && !selectedExpense) {
        setSelectedExpense(data[0]);
      }
      setFilteredExpenses(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchExpenses();
  // Set up polling to regularly check for updates
  const interval = setInterval(fetchExpenses, 5000);
    
  return () => clearInterval(interval);
}, [toast, addNotification]); // Add addNotification to dependencies

// Fetch department categories
    useEffect(() => {
      const fetchDepartmentCategories = async () => {
        try {
          const token = localStorage.getItem('token');
          const departmentId = localStorage.getItem('department_id');
          
          if (!departmentId) {
            console.error('Department ID not found in local storage');
            return;
          }
          
          const response = await fetch(`${apiUrl}/api/auth/departments/${departmentId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch department data');
          }
  
          const data = await response.json();

          if (data && data.categories) {
            setDepartmentCategories(data.categories);
          } else {
            setDepartmentCategories(['Others']);
          }
        } catch (error) {
          console.error('Failed to load department categories:', error);
          toast({
            title: 'Warning',
            description: 'Failed to load department categories. Using default categories.',
            status: 'warning',
            duration: 3000,
          });
          setDepartmentCategories(['Others']);
        }
      };
  
      fetchDepartmentCategories();
    }, [toast]);

  // Handle row selection
  const handleRowClick = (expense) => {
    setSelectedExpense(expense);
  };

  // Handle expense submission
  const handleSubmitExpense = async (expenseId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/auth/expenses/${expenseId}/submit`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to submit expense');
        }

        const result = await response.json();

        // Update local state
        setExpenses(prevExpenses => 
            prevExpenses.map(exp => 
                exp._id === expenseId ? result.data : exp
            )
        );

        // Update selected expense if it's the one being submitted
        if (selectedExpense?._id === expenseId) {
            setSelectedExpense(result.data);
        }

        toast({
            title: 'Success',
            description: 'Expense submitted successfully',
            status: 'success',
            duration: 3000,
        });
        addNotification('Expense successfully submitted for approval', 'success');
    } catch (error) {
        console.error('Submit expense error:', error);
        toast({
            title: 'Error',
            description: 'Failed to submit expense',
            status: 'error',
            duration: 3000,
        });
        addNotification('Failed to submit expense', 'error');
    }
};

  // Helper function to get status badge color
  const getStatusBadgeColor = (submissionStatus, approvalStatus) => {
    if (submissionStatus === 'Draft') return 'gray';
    if (approvalStatus === 'Approved') return 'green';
    if (approvalStatus === 'Rejected') return 'red';
    return 'orange'; // For Pending status
  };
  
  // Function to handle expense deletion
  const handleDeleteExpense = async (expenseId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/auth/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }

        // Update local state by removing the deleted expense
        const updatedExpenses = expenses.filter(exp => exp._id !== expenseId);
        setExpenses(updatedExpenses);
        
        // If the deleted expense was selected, clear the selection or select another expense
        if (selectedExpense?._id === expenseId) {
            setSelectedExpense(updatedExpenses[0] || null);
        }

        toast({
            title: 'Success',
            description: 'Expense deleted successfully',
            status: 'success',
            duration: 3000,
        });
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to delete expense',
            status: 'error',
            duration: 3000,
        });
    }
  };
  
  // Pagination logic
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredExpenses.length / expensesPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="8xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="xl">Expenses</Heading>
          </Flex>

          <Box bg={bgColor} rounded="lg" shadow="base" overflow="hidden">
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6}>
            <GridItem>
              <Flex>
                <Input 
                  placeholder="Search merchant..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <IconButton 
                    icon={<FaTimes />} 
                    aria-label="Clear search" 
                    ml={2}
                    onClick={() => setSearchQuery('')}
                  />
                )}
              </Flex>
            </GridItem>
            <GridItem>
              <Flex>
                <Select 
                  placeholder="All Categories"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {departmentCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
                {selectedCategory && (
                  <IconButton 
                    icon={<FaTimes />} 
                    aria-label="Clear category" 
                    ml={2}
                    onClick={() => setSelectedCategory('')}
                  />
                )}
              </Flex>
            </GridItem>
            <GridItem>
              <Flex>
                <Input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                  <IconButton 
                    icon={<FaTimes />} 
                    aria-label="Clear date" 
                    ml={2}
                    onClick={() => setSelectedDate('')}
                  />
                )}
              </Flex>
            </GridItem>
          </Grid>
            </Box>

            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Merchant</Th>
                    <Th>Amount</Th>
                    <Th>Category</Th>
                    <Th>Submission Status</Th>
                    <Th>Approval Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentExpenses.map((expense) => (
                    <Tr 
                      key={expense._id}
                      onClick={() => handleRowClick(expense)}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      bg={selectedExpense?._id === expense._id ? 'gray.50' : 'inherit'}
                    >
                      <Td>{new Date(expense.expenseDate).toLocaleDateString()}</Td>
                      <Td>{expense.merchant}</Td>
                      <Td>{expense.currency} {expense.amount.toFixed(2)}</Td>
                      <Td>{expense.category}</Td>
                      <Td>
                        <Badge colorScheme={expense.submissionStatus === 'Draft' ? 'gray' : 'green'}>
                          {expense.submissionStatus}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusBadgeColor(expense.submissionStatus, expense.approvalStatus)}>
                          {expense.approvalStatus}
                        </Badge>
                      </Td>
                      <Td>
                        {expense.submissionStatus === 'Draft' && (
                          <>
                            <IconButton 
                              icon={<FaEdit />} 
                              aria-label="Edit" 
                              colorScheme="orange" 
                              variant="ghost" 
                              mr={2}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row selection
                                handleEditClick(expense);
                                setSelectedExpense(expense); // Ensure the expense is selected
                              }}
                            />
                            <IconButton 
                              icon={<FaTrash />} 
                              aria-label="Delete" 
                              colorScheme="red" 
                              variant="ghost"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExpense(expense._id);
                              }}
                          />
                          </>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Flex justifyContent="space-between" alignItems="center" p={4} borderTop="1px" borderColor={borderColor}>
              <Text>Showing {indexOfFirstExpense + 1}-{Math.min(indexOfLastExpense, filteredExpenses.length)} of {filteredExpenses.length} results</Text>
              <HStack>
                <IconButton 
                  icon={<FaChevronLeft />} 
                  onClick={prevPage} 
                  isDisabled={currentPage === 1}
                  aria-label="Previous page"
                />
                {totalPages <= 5 ? (
                  // If we have 5 or fewer pages, show all page numbers
                  pageNumbers.map(number => (
                    <Button 
                      key={number}
                      colorScheme={currentPage === number ? "orange" : "gray"}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </Button>
                  ))
                ) : (
                  // If we have more than 5 pages, show a subset with ellipsis
                  <>
                    {currentPage > 2 && (
                      <Button colorScheme="gray" onClick={() => paginate(1)}>1</Button>
                    )}
                    {currentPage > 3 && <Text>...</Text>}
                    
                    {/* Show current page and neighbors */}
                    {currentPage > 1 && (
                      <Button colorScheme="gray" onClick={() => paginate(currentPage - 1)}>
                        {currentPage - 1}
                      </Button>
                    )}
                    <Button colorScheme="orange">{currentPage}</Button>
                    {currentPage < totalPages && (
                      <Button colorScheme="gray" onClick={() => paginate(currentPage + 1)}>
                        {currentPage + 1}
                      </Button>
                    )}
                    
                    {currentPage < totalPages - 2 && <Text>...</Text>}
                    {currentPage < totalPages - 1 && (
                      <Button colorScheme="gray" onClick={() => paginate(totalPages)}>
                        {totalPages}
                      </Button>
                    )}
                  </>
                )}
                <IconButton 
                  icon={<FaChevronRight />} 
                  onClick={nextPage} 
                  isDisabled={currentPage === totalPages || totalPages === 0}
                  aria-label="Next page"
                />
              </HStack>
            </Flex>
          </Box>

          {selectedExpense && (
  <Box bg={bgColor} rounded="lg" shadow="base">
    <Box p={6} borderBottom="1px" borderColor={borderColor}>
      <Heading size="md">Expense Details</Heading>
    </Box>
    <Box p={6}>
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <VStack align="stretch" spacing={4}>
            <Heading size="sm" color="gray.500">Expense Information</Heading>
            {isEditing ? (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Merchant</FormLabel>
                  <Input
                    name="merchant"
                    value={editForm.merchant}
                    onChange={handleEditFormChange}
                  />
                </FormControl>
                <FormControl>
                            <FormLabel>Category</FormLabel>
                            <Select
                              name="category"
                              value={editForm.category}
                              onChange={handleEditFormChange}
                            >
                              {departmentCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </Select>
                  </FormControl>
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    name="amount"
                    type="number"
                    value={editForm.amount}
                    onChange={handleEditFormChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    name="expenseDate"
                    type="date"
                    value={editForm.expenseDate}
                    onChange={handleEditFormChange}
                  />
                </FormControl>
                <HStack spacing={4}>
                  <Button onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" onClick={handleEditSubmit}>
                    Save Changes
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <VStack align="start">
                  <Text fontSize="sm" fontWeight="medium">Expense Date</Text>
                  <Text fontSize="sm">{new Date(selectedExpense.expenseDate).toLocaleDateString()}</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" fontWeight="medium">Merchant</Text>
                  <Text fontSize="sm">{selectedExpense.merchant}</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" fontWeight="medium">Category</Text>
                  <Text fontSize="sm">{selectedExpense.category}</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" fontWeight="medium">Amount</Text>
                  <Text fontSize="sm">{selectedExpense.currency} {selectedExpense.amount.toFixed(2)}</Text>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" fontWeight="medium">Submission Status</Text>
                  <Badge colorScheme={selectedExpense.submissionStatus === 'Draft' ? 'gray' : 'green'}>
                    {selectedExpense.submissionStatus}
                  </Badge>
                </VStack>
                <VStack align="start">
                  <Text fontSize="sm" fontWeight="medium">Approval Status</Text>
                  <Badge colorScheme={getStatusBadgeColor(selectedExpense.submissionStatus, selectedExpense.approvalStatus)}>
                    {selectedExpense.approvalStatus}
                  </Badge>
                </VStack>
              </Grid>
            )}
          </VStack>
        </GridItem>
        <GridItem>
          <VStack align="stretch" spacing={4}>
            <Heading size="sm" color="gray.500">Receipt</Heading>
            <Box border="1px" borderColor={borderColor} rounded="lg" p={4}>
              {selectedExpense.receiptUrl ? (
                <Image
                  src={selectedExpense.receiptUrl}
                  alt="Receipt"
                  maxH="200px"
                  objectFit="contain"
                />
              ) : (
                <Flex align="center" justify="center" h="200px">
                  <Text color="gray.500">No receipt available</Text>
                </Flex>
              )}
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
    <Flex justifyContent="flex-end" p={4} bg="gray.50" borderTop="1px" borderColor={borderColor}>
      {selectedExpense.submissionStatus === 'Draft' && (
        <>
          {!isEditing && (
            <Button leftIcon={<FaEdit />} variant="outline" mr={2} onClick={() => handleEditClick(selectedExpense)}>
              Edit Draft
            </Button>
          )}
          <Button 
            leftIcon={<FaTrash />} 
            colorScheme="red" 
            variant="outline" 
            mr={2}
            onClick={() => handleDeleteExpense(selectedExpense._id)}
          >
            Delete Draft
          </Button>
          {!isEditing && (
            <Button 
              leftIcon={<FaPaperPlane />} 
              colorScheme="orange"
              onClick={() => handleSubmitExpense(selectedExpense._id)}
            >
              Submit for Approval
            </Button>
          )}
        </>
      )}
    </Flex>
  </Box>
)}
        </VStack>
      </Container>
    </Box>
  );
};

export default DraftExpenses;
