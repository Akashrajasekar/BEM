import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
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
  Grid,
  GridItem,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FaSave, FaFilePdf, FaTrash, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const AIReports = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box minH="100vh" bg="gray.50">

      <Container maxW="8xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Box bg={bgColor} rounded="lg" shadow="base" p={6}>
            <Heading size="xl" mb={4}>AI-Generated Expense Reports</Heading>
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
              <GridItem>
                <Input placeholder="Search by Report ID" />
              </GridItem>
              <GridItem>
                <Input type="date" />
              </GridItem>
              <GridItem>
                <Select placeholder="All Amount Ranges">
                  <option>$0 - $100</option>
                  <option>$101 - $500</option>
                  <option>$501 - $1000</option>
                  <option>$1000+</option>
                </Select>
              </GridItem>
            </Grid>
          </Box>

          <Flex direction={{ base: "column", lg: "row" }} gap={6}>
            <Box w={{ base: "100%", lg: "33%" }} bg={bgColor} rounded="lg" shadow="base" overflow="hidden">
              <Box p={4} borderBottom="1px" borderColor={borderColor}>
                <Heading size="md">Report List</Heading>
              </Box>
              <VStack divider={<Divider />} spacing={0} align="stretch" maxH="600px" overflowY="auto">
                <Box p={4} _hover={{ bg: "gray.50" }} cursor="pointer">
                  <Flex justify="space-between">
                    <Text fontWeight="medium" color="gray.900">#EXP-2024-001</Text>
                    <Text fontSize="sm" color="orange.600">Saved</Text>
                  </Flex>
                  <Text mt={1} fontSize="sm" color="gray.500">March 15, 2024</Text>
                  <Text mt={1} fontSize="sm" fontWeight="medium" color="gray.900">$1,234.56</Text>
                </Box>
                <Box p={4} _hover={{ bg: "gray.50" }} cursor="pointer">
                  <Flex justify="space-between">
                    <Text fontWeight="medium" color="gray.900">#EXP-2024-002</Text>
                    <Text fontSize="sm" color="orange.600">Pending</Text>
                  </Flex>
                  <Text mt={1} fontSize="sm" color="gray.500">March 14, 2024</Text>
                  <Text mt={1} fontSize="sm" fontWeight="medium" color="gray.900">$867.50</Text>
                </Box>
              </VStack>
            </Box>

            <Box w={{ base: "100%", lg: "67%" }} bg={bgColor} rounded="lg" shadow="base">
              <Box p={6} borderBottom="1px" borderColor={borderColor}>
                <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                  <Heading size="md">Report Details</Heading>
                  <Flex gap={3} wrap="wrap">
                    <Button leftIcon={<FaSave />} colorScheme="orange">Save</Button>
                    <Button leftIcon={<FaFilePdf />} colorScheme="orange" variant="outline">Export PDF</Button>
                    <Button leftIcon={<FaTrash />} variant="outline">Delete</Button>
                  </Flex>
                </Flex>
              </Box>
              <Box p={6}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>Expense Breakdown</Heading>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Category</Th>
                          <Th>Description</Th>
                          <Th>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Travel</Td>
                          <Td>Flight tickets</Td>
                          <Td>$650.00</Td>
                        </Tr>
                        <Tr>
                          <Td>Accommodation</Td>
                          <Td>Hotel stay</Td>
                          <Td>$420.00</Td>
                        </Tr>
                        <Tr>
                          <Td>Meals</Td>
                          <Td>Business dinners</Td>
                          <Td>$164.56</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                  <Box>
                    <Heading size="md" mb={4}>AI Analysis</Heading>
                    <Box bg="gray.50" p={4} rounded="lg">
                      <Text fontSize="sm">This expense report shows typical business travel patterns with standard costs for a 3-day business trip. All expenses fall within company policy limits. The meal expenses are slightly above average but justified by client meetings.</Text>
                    </Box>
                  </Box>
                  <Box>
                    <Heading size="md" mb={4}>Generated Insights</Heading>
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }} gap={4}>
                      <Box bg="orange.50" p={4} rounded="lg">
                        <Flex align="center">
                          <FaCheckCircle color="orange" mr={2} />
                          <Text fontSize="sm" fontWeight="medium" color="orange.800">All expenses comply with policy</Text>
                        </Flex>
                      </Box>
                      <Box bg="orange.50" opacity={0.5} p={4} rounded="lg">
                        <Flex align="center">
                          <FaInfoCircle color="orange" mr={2} />
                          <Text fontSize="sm" fontWeight="medium" color="orange.800">15% below quarterly average</Text>
                        </Flex>
                      </Box>
                    </Grid>
                  </Box>
                </VStack>
              </Box>
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default AIReports;
