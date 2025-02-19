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
  Container,
  Avatar,
  Badge,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerContent,
  FormControl,
  FormLabel,
  Select,
  Stack,
  Divider
} from '@chakra-ui/react';
import * as echarts from 'echarts';
import {
  FaChartLine,
  FaUsers,
  FaWallet,
  FaFileAlt,
  FaHeadset,
  FaKey,
  FaBars,
  FaBell,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaChartPie,
  FaEdit,
  FaTrash,
  FaRobot,
  FaPaperPlane,
  FaUserTag,
  FaEnvelope,
  FaDownload,
  FaCopy
} from 'react-icons/fa';

const Credentials = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('white', 'gray.800');
  const contentBg = useColorModeValue('white', 'gray.800');
  const [userName, setUserName] = useState('Admin User'); // Default value
  
  useEffect(() => {
    // Retrieve user's name from localStorage
    const storedUserName = localStorage.getItem('userName') || 'Admin User'; // Default if not found
    setUserName(storedUserName);
  }, []);

  const navItems = [
    { icon: FaChartLine, text: 'Dashboard', active: false },
    { icon: FaUsers, text: 'User Management' },
    { icon: FaWallet, text: 'Budget Management' },
    { icon: FaFileAlt, text: 'Reports' },
    { icon: FaHeadset, text: 'Support' },
    { icon: FaKey, text: 'Generate Credentials', active: true }
  ];

  const Sidebar = ({ onClose }) => {
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
          <Image h="8" src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png" alt="Logo" />
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
        {/* Navbar */}
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
          <Flex alignItems="center" ml="auto">
            <IconButton
              size="lg"
              variant="ghost"
              aria-label="notifications"
              icon={<FaBell />}
              mr="4"
            />
            <HStack spacing="4">
              <Avatar size="sm" src="https://bit.ly/dan-abramov" />
              <Text display={{ base: 'none', md: 'flex' }}>{userName}</Text>
            </HStack>
          </Flex>
        </Flex>

        {/* Main Content Area */}
        <Box p="6">
          <Container maxW="container.xl">
            <Stack spacing={6}>
              {/* Generate Credentials Form */}
              <Box bg={contentBg} rounded="lg" shadow="sm" p={6}>
                <Stack spacing={4}>
                  <Heading size="md" mb={4}>Generate New Credentials</Heading>
                  <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                    <FormControl>
                      <FormLabel>Department</FormLabel>
                      <Select placeholder="Select department">
                        <option>Engineering</option>
                        <option>Marketing</option>
                        <option>Sales</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <Select placeholder="Select role">
                        <option>Admin</option>
                        <option>Manager</option>
                        <option>User</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Access Level</FormLabel>
                      <Select placeholder="Select access level">
                        <option>Full Access</option>
                        <option>Read Only</option>
                        <option>Limited</option>
                      </Select>
                    </FormControl>
                  </Flex>
                  <Button colorScheme="orange" alignSelf="flex-start">
                    Generate Credentials
                  </Button>
                </Stack>
              </Box>

              {/* Recent Credentials */}
              <Box bg={contentBg} rounded="lg" shadow="sm">
                <Box p={6}>
                  <Heading size="md">Recent Credentials</Heading>
                </Box>
                <Divider />
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Department</Th>
                        <Th>Role</Th>
                        <Th>Access Level</Th>
                        <Th>Generated</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Engineering</Td>
                        <Td>Admin</Td>
                        <Td>Full Access</Td>
                        <Td>2024-02-07</Td>
                        <Td>
                          <Badge colorScheme="green">Active</Badge>
                        </Td>
                        <Td>
                          <Flex gap={2}>
                            <IconButton
                              icon={<FaDownload />}
                              variant="ghost"
                              colorScheme="blue"
                              size="sm"
                            />
                            <IconButton
                              icon={<FaCopy />}
                              variant="ghost"
                              colorScheme="green"
                              size="sm"
                            />
                            <IconButton
                              icon={<FaTrash />}
                              variant="ghost"
                              colorScheme="red"
                              size="sm"
                            />
                          </Flex>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Marketing</Td>
                        <Td>Manager</Td>
                        <Td>Limited</Td>
                        <Td>2024-02-06</Td>
                        <Td>
                          <Badge colorScheme="red">Expired</Badge>
                        </Td>
                        <Td>
                          <Flex gap={2}>
                            <IconButton
                              icon={<FaDownload />}
                              variant="ghost"
                              colorScheme="blue"
                              size="sm"
                            />
                            <IconButton
                              icon={<FaCopy />}
                              variant="ghost"
                              colorScheme="green"
                              size="sm"
                            />
                            <IconButton
                              icon={<FaTrash />}
                              variant="ghost"
                              colorScheme="red"
                              size="sm"
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Credentials;
