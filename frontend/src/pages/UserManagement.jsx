import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  IconButton,
  InputGroup,
  InputLeftElement,
  Select,
  useColorModeValue,
  Image,
  Badge,
  VStack,
  HStack,
  Icon,
  Avatar,
  Drawer,
  DrawerContent,
  useDisclosure
} from '@chakra-ui/react';
import { FaSearch, FaPlus, FaUserPlus, FaEdit, FaTrash, FaBuilding, FaBars, FaBell, FaChartLine, FaUsers, FaWallet, FaFileAlt, FaHeadset, FaKey } from 'react-icons/fa';

const UserManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('white', 'gray.800');
  const tableBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const navItems = [
    { icon: FaChartLine, text: 'Dashboard', active: false },
    { icon: FaUsers, text: 'User Management', active: true },
    { icon: FaWallet, text: 'Budget Management' },
    { icon: FaFileAlt, text: 'Reports' },
    { icon: FaHeadset, text: 'Support' },
    { icon: FaKey, text: 'Generate Credentials' }
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
              <Text display={{ base: 'none', md: 'flex' }}>Admin User</Text>
            </HStack>
          </Flex>
        </Flex>
      <Box>
      <Container maxW="container.xl" py={6}>
        <Box bg={tableBg} rounded="lg" shadow="sm">
          <Box p={4} borderBottom="1px" borderColor={borderColor}>
            <Flex direction={{ base: 'column', md: 'row' }} align="start" gap={4}>
              <Box flex="1" minW="240px">
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <FaSearch color="gray.400" />
                  </InputLeftElement>
                  <Input placeholder="Search departments or users..." />
                </InputGroup>
              </Box>
              <Button leftIcon={<FaPlus />} colorScheme="orange">
                Add Department
              </Button>
            </Flex>
          </Box>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>
                    <Checkbox colorScheme="orange" />
                  </Th>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Company Email</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Engineering Department */}
                <Tr bg="gray.50">
                  <Td colSpan={5}>
                    <Flex justify="space-between" align="center">
                      <Flex align="center">
                        <FaBuilding style={{ marginRight: '0.5rem' }} />
                        <Text fontWeight="semibold">Engineering Department</Text>
                      </Flex>
                      <Flex gap={3}>
                        <Button size="sm" leftIcon={<FaUserPlus />} colorScheme="orange">
                          Add User
                        </Button>
                        <IconButton
                          size="sm"
                          icon={<FaEdit />}
                          variant="ghost"
                          colorScheme="orange"
                        />
                        <IconButton
                          size="sm"
                          icon={<FaTrash />}
                          variant="ghost"
                          colorScheme="red"
                        />
                      </Flex>
                    </Flex>
                  </Td>
                </Tr>
                
                {/* Sample User Row */}
                <Tr>
                  <Td>
                    <Checkbox colorScheme="orange" />
                  </Td>
                  <Td>
                    <Flex align="center">
                      <Image
                        src="/api/placeholder/40/40"
                        alt="John Smith"
                        boxSize="40px"
                        rounded="full"
                        mr={4}
                      />
                      <Box>
                        <Text fontWeight="medium">John Smith</Text>
                        <Text fontSize="sm" color="gray.500">
                          john.smith@example.com
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Select
                      size="sm"
                      variant="filled"
                      bg="orange.100"
                      color="orange.800"
                      border="none"
                      defaultValue="Tech Lead"
                    >
                      <option>Tech Lead</option>
                      <option>Senior Developer</option>
                      <option>Developer</option>
                      <option>Junior Developer</option>
                    </Select>
                  </Td>
                  <Td>
                    <Text color="gray.500">john.smith@company.com</Text>
                  </Td>
                  <Td>
                    <IconButton
                      icon={<FaEdit />}
                      variant="ghost"
                      colorScheme="orange"
                      mr={2}
                    />
                    <IconButton
                      icon={<FaTrash />}
                      variant="ghost"
                      colorScheme="red"
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>

          <Box p={4} borderTop="1px" borderColor={borderColor}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'stretch', md: 'center' }}
              justify="space-between"
              gap={4}
            >
              <Flex align="center">
                <Text fontSize="sm">Showing 1 to 10 of 97 results</Text>
                <Select ml={4} w="auto" size="sm">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </Select>
              </Flex>
              <Flex gap={2}>
                <Button size="sm" variant="outline">
                  Previous
                </Button>
                <Button size="sm" colorScheme="orange">
                  1
                </Button>
                <Button size="sm" variant="outline">
                  2
                </Button>
                <Button size="sm" variant="outline">
                  3
                </Button>
                <Button size="sm" variant="outline">
                  Next
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Container>
    </Box>
    </Box>
    </Box>
  );
};

export default UserManagement;
