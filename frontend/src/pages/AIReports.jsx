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
  
} from '@chakra-ui/react';
import { FaSave, FaFilePdf, FaTrash, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const AIReports = () => {
  const token = localStorage.getItem('token');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch reports
  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user-reports', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  // Handle report selection and fetch details
  const handleReportSelect = async (report) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/user-reports/${report.id}`, {
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
          aiReport: data.data.aiReport
        });
      }
    } catch (err) {
      console.error('Failed to fetch report details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Generate new report
  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/user-reports/generate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const data = await response.json();
      
      if (data.success) {
        const reportId = data.reportId;
        await fetchReports();
        handleReportSelect({ ...data, id: reportId });
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setLoading(false);
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
        const downloadResponse = await fetch(`http://localhost:5000/api/auth/reports/download/${data.downloadUrl.split('/').pop()}`, {
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
      const response = await fetch(`http://localhost:5000/api/auth/user-reports/${reportId}`, {
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
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </Text>
                    <Text mt={1} fontSize="sm" fontWeight="medium" color="gray.900">
                      AED{report.totalAmount?.toFixed(2)}
                    </Text>
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
                      onClick={generateReport}
                      isLoading={loading}
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
    </Box>
  );
};

export default AIReports;