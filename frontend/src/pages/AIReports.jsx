import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Grid,
  useColorModeValue,
  Divider,
  Spinner,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormHelperText
} from '@chakra-ui/react';
import { FaSave, FaFilePdf, FaTrash, FaCheckCircle, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa';

const AIReports = () => {
  const token = localStorage.getItem('token');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("https://bem-47rp.onrender.com");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('custom');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  // Add state for custom date range
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Get API URL with Vite-specific environment variables
  useEffect(() => {
    // For Vite apps, environment variables must be prefixed with VITE_
    const envApiUrl = import.meta.env.VITE_API_URL;

    if (envApiUrl) {
      setApiUrl(envApiUrl);
      console.log("Using API URL from environment:", envApiUrl);
    } else {
      console.log("No VITE_API_URL found, using default:", apiUrl);
      console.log("Available environment variables:", import.meta.env);
    }
  }, []);

  // Create a helper function for date formatting (add this near your other utility functions)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };
  
  // Set default date range values for the custom period
  const setDefaultDateRange = () => {
    const today = new Date();
    
    // Default to last 30 days
    const endDate = today.toISOString().split('T')[0]; // Today in YYYY-MM-DD format
    
    const startDate = new Date();
    startDate.setDate(today.getDate() - 30);
    const formattedStartDate = startDate.toISOString().split('T')[0]; // 30 days ago
    
    setCustomDateRange({
      startDate: formattedStartDate,
      endDate: endDate
    });
  };
  
  // Fetch reports
  const fetchReports = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/user-reports`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (data.success) {
        // Ensure all reports have a reportPeriod
      const reportsWithPeriod = data.data.map(report => ({
        ...report,
        reportPeriod: report.reportPeriod || 'custom'
      }));
        setReports(reportsWithPeriod);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  // Handle report selection and fetch details
  const handleReportSelect = async (report) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/user-reports/${report.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (data.success) {
        setSelectedReport({
          ...report,
          summary: data.data.summary,
          aiReport: data.data.aiReport,
          reportPeriod: data.data.reportPeriod || 'custom',
          dateRange: data.data.dateRange || report.dateRange
        });
      }
    } catch (err) {
      console.error('Failed to fetch report details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Open generate report modal
  const handleOpenGenerateModal = () => {
    //console.log('Modal open function called');
    setReportPeriod('custom');
    setDefaultDateRange(); // Set default date range when opening the modal
    onOpen();
  };

  // Validate date range
  const isDateRangeValid = () => {
    if (reportPeriod !== 'custom') return true;
    
    return (
      customDateRange.startDate && 
      customDateRange.endDate && 
      new Date(customDateRange.startDate) <= new Date(customDateRange.endDate)
    );
  };

  // Generate new report
  const generateReport = async () => {
    // Validate date range for custom period
    if (reportPeriod === 'custom' && !isDateRangeValid()) {
      alert('Please select a valid date range');
      return;
    }
    
    setLoading(true);
    setIsGeneratingReport(true);
    onClose();
    
    try {
      const url = new URL(`${apiUrl}/api/auth/user-reports/generate`);
      
      // Add parameters based on report period
      if (reportPeriod !== 'custom') {
        url.searchParams.append('reportPeriod', reportPeriod);
      } else {
        // Add custom date range parameters
        url.searchParams.append('startDate', customDateRange.startDate);
        url.searchParams.append('endDate', customDateRange.endDate);
        url.searchParams.append('reportPeriod', 'custom'); // Explicitly set as custom
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await response.json();
      
      if (data.success) {
        const reportId = data.reportId;
        
        // If it's a custom report, ensure we also pass the date range
        const customReportData = reportPeriod === 'custom' ? {
          ...data,
          id: reportId,
          reportPeriod: 'custom',
          dateRange: {
            from: customDateRange.startDate,
            to: customDateRange.endDate
          }
        } : { ...data, id: reportId };
        
        await fetchReports();
        handleReportSelect(customReportData);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
      setIsGeneratingReport(false);
    }
  };

  // Download PDF
  const downloadPDF = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/user-reports/${reportId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      
      if (data.success && data.downloadUrl) {
        const downloadResponse = await fetch(`${apiUrl}/api/auth/reports/download/${data.downloadUrl
            .split("/")
            .pop()}`, 
            {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/user-reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (response.ok) {
        await fetchReports();
        if (selectedReport?.id === reportId) {
          setSelectedReport(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  // Get report period label
  const getReportPeriodLabel = (period) => {
    switch(period) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'Custom';
    }
  };

  // Handle date change in custom period
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="8xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box bg={bgColor} rounded="lg" shadow="base" p={6}>
            <Heading size="xl">AI-Generated Expense Reports</Heading>
          </Box>

          <Flex direction={{ base: "column", lg: "row" }} gap={6}>
            <Box w={{ base: "100%", lg: "33%" }} bg={bgColor} rounded="lg" shadow="base" overflow="hidden">
              <Box p={4} borderBottom="1px" borderColor={borderColor}>
                <Heading size="md">Report List</Heading>
              </Box>
              <VStack divider={<Divider />} spacing={0} align="stretch" maxH="600px" overflowY="auto">
                {reports.map(report => (
                  <Box 
                    key={report.id}
                    p={4} 
                    _hover={{ bg: "gray.50" }} 
                    cursor="pointer"
                    onClick={() => handleReportSelect(report)}
                    bg={selectedReport?.id === report.id ? "gray.50" : "transparent"}
                  >
                    <Flex justify="space-between">
                      <Text fontWeight="medium" color="gray.900">#{report.id}</Text>
                      <Text fontSize="sm" color={
                        report.status === 'COMPLETED' ? "green.600" : 
                        report.status === 'FAILED' ? "red.600" : 
                        "orange.600"
                      }>{report.status}</Text>
                    </Flex>
                    <Text mt={1} fontSize="sm" color="gray.500">
                    {formatDate(report.generatedAt)}
                    </Text>
                    <Flex mt={1} justify="space-between" align="center">
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        AED{report.totalAmount?.toFixed(2)}
                      </Text>
                      {/* Only show the badge if reportPeriod exists */}
                      {report.reportPeriod && (
                        <Text fontSize="xs" bg="orange.50" color="orange.800" px={2} py={1} borderRadius="md">
                          {getReportPeriodLabel(report.reportPeriod || 'custom')}
                        </Text>
                      )}
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Box w={{ base: "100%", lg: "67%" }} bg={bgColor} rounded="lg" shadow="base">
              <Box p={6} borderBottom="1px" borderColor={borderColor}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <Heading size="md">Report Details</Heading>
                  <Flex gap={3} wrap="wrap">
                    <Button 
                      leftIcon={<FaSave />} 
                      colorScheme="orange"
                      onClick={handleOpenGenerateModal}
                    >
                      Generate New
                    </Button>
                    {selectedReport && (
                      <>
                        <Button 
                          leftIcon={<FaFilePdf />} 
                          colorScheme="orange" 
                          variant="outline"
                          onClick={() => downloadPDF(selectedReport.id)}
                        >
                          Export PDF
                        </Button>
                        <Button 
                          leftIcon={<FaTrash />} 
                          variant="outline"
                          onClick={() => deleteReport(selectedReport.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </Flex>
                </Flex>
              </Box>
              {detailsLoading ? (
                <Box p={6} textAlign="center">
                  <Spinner size="xl" color="orange.500" />
                  <Text mt={4} color="gray.500">Loading report details...</Text>
                </Box>
              ) : selectedReport ? (
                <Box p={6}>
                  <VStack spacing={6} align="stretch">
                    {/* Display report period regardless of type */}
                    {selectedReport.reportPeriod && (
                      <Box bg="orange.50" p={3} rounded="md">
                        <Flex align="center">
                          <FaCalendarAlt color="#C05621" />
                          <Text ml={2} fontWeight="medium" color="orange.800">
                            {getReportPeriodLabel(selectedReport.reportPeriod)} Report
                          </Text>
                        </Flex>
                        {selectedReport.dateRange && (
                          <Text fontSize="sm" mt={1} color="orange.700">
                            Period: {formatDate(selectedReport.dateRange.from)} - {formatDate(selectedReport.dateRange.to)}
                          </Text>
                        )}
                      </Box>
                    )}
                    
                    <Box>
                      <Heading size="md" mb={4}>Expense Breakdown</Heading>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Category</Th>
                            <Th>Count</Th>
                            <Th>Amount</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedReport.summary?.expensesByCategory?.map(category => (
                            <Tr key={category.name}>
                              <Td>{category.name}</Td>
                              <Td>{category.count}</Td>
                              <Td>AED{category.amount.toFixed(2)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                    <Box>
                      <Heading size="md" mb={4}>AI Analysis</Heading>
                      <Box bg="gray.50" p={4} rounded="lg">
                        <Text fontSize="sm">
                          {selectedReport.aiReport?.executiveSummary?.overview || 'Analysis not available'}
                        </Text>
                      </Box>
                    </Box>
                    <Box>
                      <Heading size="md" mb={4}>Generated Insights</Heading>
                      <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }} gap={4}>
                        {selectedReport.aiReport?.executiveSummary?.keyFindings?.slice(0, 2).map((finding, index) => (
                          <Box key={index} bg="orange.50" p={4} rounded="lg">
                            <Flex align="center">
                              {index === 0 ? <FaCheckCircle color="orange" /> : <FaInfoCircle color="orange" />}
                              <Text ml={2} fontSize="sm" fontWeight="medium" color="orange.800">
                                {finding}
                              </Text>
                            </Flex>
                          </Box>
                        ))}
                      </Grid>
                    </Box>
                  </VStack>
                </Box>
              ) : (
                <Box p={6}>
                  <Text color="gray.500">Select a report to view details</Text>
                </Box>
              )}
            </Box>
          </Flex>
        </VStack>
      </Container>
      
      {/* Report Generation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate New Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl style={{display: 'block', marginBottom: '15px'}}>
              <FormLabel style={{display: 'block', marginBottom: '5px'}}>Report Period</FormLabel>
              <Select 
                value={reportPeriod} 
                onChange={(e) => setReportPeriod(e.target.value)}
                style={{display: 'block', width: '100%'}}
              >
                <option value="custom">Custom Period</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
              </Select>
              
              {reportPeriod === 'weekly' && (
                <Text fontSize="sm" mt={2} color="gray.600">
                  Generates a report for the current week (Sunday to Saturday)
                </Text>
              )}
              
              {reportPeriod === 'monthly' && (
                <Text fontSize="sm" mt={2} color="gray.600">
                  Generates a report for the current month
                </Text>
              )}
              
              {reportPeriod === 'yearly' && (
                <Text fontSize="sm" mt={2} color="gray.600">
                  Generates a report for the current year
                </Text>
              )}
              
              {/* Add date pickers for custom period */}
              {reportPeriod === 'custom' && (
                <Box mt={4}>
                  <Text fontSize="sm" mb={2} color="gray.600">
                    Select a custom date range:
                  </Text>
                  <FormControl isRequired mb={3}>
                    <FormLabel>Start Date</FormLabel>
                    <Input 
                      type="date" 
                      name="startDate"
                      value={customDateRange.startDate}
                      onChange={handleDateChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input 
                      type="date" 
                      name="endDate"
                      value={customDateRange.endDate}
                      onChange={handleDateChange}
                    />
                    {customDateRange.startDate && customDateRange.endDate && 
                      new Date(customDateRange.startDate) > new Date(customDateRange.endDate) && (
                      <FormHelperText color="red.500">
                        End date must be after start date
                      </FormHelperText>
                    )}
                  </FormControl>
                </Box>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="orange" 
              leftIcon={<FaSave />}
              onClick={generateReport}
              isLoading={loading}
              isDisabled={reportPeriod === 'custom' && !isDateRangeValid()}
            >
              Generate Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isGeneratingReport && (
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        bg="rgba(0,0,0,0.4)" 
        zIndex="1000"
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        flexDirection="column"
      >
        <Spinner size="xl" color="orange.500" thickness="4px" />
        <Text mt={4} color="white" fontWeight="bold" fontSize="lg">
          Generating your report...
        </Text>
      </Box>
    )}
    </Box> 
  );
};

export default AIReports;