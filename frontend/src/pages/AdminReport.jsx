import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  Image,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Input,
  VStack,
  HStack,
  Heading,
  SimpleGrid,
  Avatar,
  Badge,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Select,
} from '@chakra-ui/react';
import {
  FaChartLine,
  FaUsers,
  FaWallet,
  FaFileAlt,
  FaHeadset,
  FaKey,
  FaBars,
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaFilePdf,
  FaChartBar,
} from 'react-icons/fa';

// Sidebar Component
const Sidebar = ({ onClose }) => {
  const navItems = [
    { icon: FaChartLine, text: 'Dashboard', active: true },
    { icon: FaUsers, text: 'User Management' },
    { icon: FaWallet, text: 'Budget Management' },
    { icon: FaFileAlt, text: 'Reports' },
    { icon: FaHeadset, text: 'Support' },
    { icon: FaKey, text: 'Generate Credentials' }
  ];

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', lg: 64 }}
      pos="fixed"
      h="full"
    >
      <Flex h="16" alignItems="center" justifyContent="center" borderBottomWidth="1px">
        <Image h="8" src="/api/placeholder/32/32" alt="Logo" />
        <Text ml="3" fontSize="xl" fontWeight="bold">Admin Portal</Text>
      </Flex>
      <VStack spacing="1" align="stretch" px="2" mt="6">
        {navItems.map((item, index) => (
          <Button
            key={index}
            leftIcon={<Icon as={item.icon} />}
            variant={item.active ? 'solid' : 'ghost'}
            colorScheme={item.active ? 'orange' : 'gray'}
            justifyContent="flex-start"
            size="lg"
            w="full"
            onClick={onClose}
          >
            {item.text}
          </Button>
        ))}
      </VStack>
    </Box>
  );
};

// Navbar Component
const Navbar = ({ onOpen }) => {
  return (
    <Flex
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      h="16"
      alignItems="center"
      px="4"
    >
      <IconButton
        display={{ base: 'flex', lg: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FaBars />}
      />
      <Text ml="4" fontSize="xl" fontWeight="bold">Expense Reports</Text>
      <Flex alignItems="center" ml="auto">
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="notifications"
          icon={<FaBell />}
          mr="4"
        />
        <HStack spacing="4">
          <Avatar size="sm" src="/api/placeholder/32/32" />
          <Text display={{ base: 'none', md: 'flex' }}>Admin User</Text>
        </HStack>
      </Flex>
    </Flex>
  );
};

const AdminReport = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Sidebar for desktop */}
      <Box display={{ base: 'none', lg: 'block' }}>
        <Sidebar />
      </Box>

      {/* Drawer for mobile */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box ml={{ base: 0, lg: 64 }}>
        <Navbar onOpen={onOpen} />
        
        {/* Main Content Area */}
        <Box p="6">
          {/* Search and Filter Section */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="4">
            <Input placeholder="Search by Report ID" />
            <Input type="date" />
            <Select placeholder="All Amount Ranges">
              <option>$0 - $500</option>
              <option>$501 - $1000</option>
              <option>$1001+</option>
            </Select>
            <Select placeholder="All Departments">
              <option>Sales</option>
              <option>Marketing</option>
              <option>Engineering</option>
            </Select>
          </SimpleGrid>

          {/* Report List and Details Grid */}
          <SimpleGrid columns={{ base: 1, lg: 12 }} spacing="6" mt="6">
            {/* Report List */}
            <Box gridColumn={{ lg: 'span 4' }}>
              <Box bg="white" rounded="lg" shadow="base" p="6">
                <Heading size="md" mb="4">Report List</Heading>
                <VStack spacing="4" align="stretch">
                  <Box p="4" bg="orange.50" rounded="lg" borderLeft="4px" borderLeftColor="orange.500">
                    <Flex justify="space-between">
                      <Box>
                        <Text fontWeight="medium">#EXP-2024-001</Text>
                        <Text fontSize="sm" color="gray.500">John Smith - Sales</Text>
                        <Text fontSize="sm" color="gray.500">March 15, 2024</Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontWeight="medium">$1,234.56</Text>
                        <Badge colorScheme="green">Approved</Badge>
                      </Box>
                    </Flex>
                  </Box>
                  <Box p="4" bg="white" rounded="lg" border="1px" borderColor="gray.200">
                    <Flex justify="space-between">
                      <Box>
                        <Text fontWeight="medium">#EXP-2024-002</Text>
                        <Text fontSize="sm" color="gray.500">Sarah Johnson - Marketing</Text>
                        <Text fontSize="sm" color="gray.500">March 14, 2024</Text>
                      </Box>
                      <Box textAlign="right">
                        <Text fontWeight="medium">$867.50</Text>
                        <Badge colorScheme="yellow">Pending</Badge>
                      </Box>
                    </Flex>
                  </Box>
                </VStack>
              </Box>
            </Box>

            {/* Report Details */}
            <Box gridColumn={{ lg: 'span 8' }}>
              <Box bg="white" rounded="lg" shadow="base" p="6">
                <Flex justify="space-between" align="center" mb="6">
                  <Heading size="md">Report Details</Heading>
                  <HStack spacing="3">
                    <Button colorScheme="green" leftIcon={<Icon as={FaCheckCircle} />}>Approve</Button>
                    <Button colorScheme="red" leftIcon={<Icon as={FaTimesCircle} />}>Reject</Button>
                    <Button variant="outline" leftIcon={<Icon as={FaFilePdf} />}>Export PDF</Button>
                  </HStack>
                </Flex>

                {/* Department Summary */}
                <Box borderTopWidth="1px" pt="6">
                  <Heading size="md" mb="4">Department Expense Summary</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Department</Th>
                          <Th>Manager</Th>
                          <Th>Employees</Th>
                          <Th isNumeric>Total Expenses</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>Sales</Td>
                          <Td>John Davis</Td>
                          <Td>12</Td>
                          <Td isNumeric>$15,650.00</Td>
                        </Tr>
                        <Tr>
                          <Td>Marketing</Td>
                          <Td>Sarah Johnson</Td>
                          <Td>8</Td>
                          <Td isNumeric>$12,420.00</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </Box>
                </Box>

                {/* AI Analysis */}
                <Box mt="8">
                  <Heading size="md" mb="4">AI Analysis</Heading>
                  <Box bg="gray.50" rounded="lg" p="4">
                    <Text color="gray.600">
                      This expense report shows typical business travel patterns with standard costs for a 3-day business trip. 
                      All expenses fall within company policy limits.
                    </Text>
                    <SimpleGrid columns={2} spacing="4" mt="4">
                      <Box bg="green.50" p="4" rounded="lg">
                        <HStack>
                          <Icon as={FaCheckCircle} color="green.500" />
                          <Text color="green.700" fontWeight="medium">All expenses comply with policy</Text>
                        </HStack>
                      </Box>
                      <Box bg="blue.50" p="4" rounded="lg">
                        <HStack>
                          <Icon as={FaChartBar} color="blue.500" />
                          <Text color="blue.700" fontWeight="medium">15% below quarterly average</Text>
                        </HStack>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Box>

                {/* Admin Comments */}
                <Box mt="8">
                  <Heading size="md" mb="4">Admin Comments</Heading>
                  <Input as="textarea" rows={3} placeholder="Add your comments here..." />
                </Box>
              </Box>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminReport;