import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  Image,
  Button,
  useColorModeValue,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Container,
  Heading,
  Stack,
  IconButton,
  useBreakpointValue,
  VStack,
  HStack,
  Avatar,
  useDisclosure,
  Drawer,
  DrawerContent,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
} from "@chakra-ui/react";
import {
  FaChartLine,
  FaPlusCircle,
  FaFileAlt,
  FaCog,
  FaBell,
  FaDollarSign,
  FaChartPie,
  FaWallet,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBars,
  FaUsers,
  FaHeadset,
  FaKey,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

const BudgetManagement = () => {
  const token = localStorage.getItem('token');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  const navItems = [
    { icon: FaChartLine, text: "Dashboard", active: true },
    { icon: FaUsers, text: "User Management" },
    { icon: FaWallet, text: "Budget Management" },
    { icon: FaFileAlt, text: "Reports" },
    { icon: FaHeadset, text: "Support" },
    { icon: FaKey, text: "Generate Credentials" },
  ];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    department_id: "",
    manager_id: "",
    total_budget: "",
  });
  const toast = useToast();
  const monthlyData = [
    { name: "Jan", amount: 15000 },
    { name: "Feb", amount: 25000 },
    { name: "Mar", amount: 20000 },
    { name: "Apr", amount: 35000 },
    { name: "May", amount: 30000 },
    { name: "Jun", amount: 40000 },
  ];

  const pieData = [
    { name: "Marketing", value: 75000, color: "#F97316" },
    { name: "Sales", value: 100000, color: "#FB923C" },
    { name: "IT", value: 50000, color: "#FDBA74" },
    { name: "HR", value: 25000, color: "#FED7AA" },
  ];

  const Sidebar = ({ onClose }) => {
    return (
      <Box
        bg={useColorModeValue("white", "gray.900")}
        borderRight="1px"
        borderRightColor={useColorModeValue("gray.200", "gray.700")}
        w={{ base: "full", lg: 64 }}
        pos="fixed"
        h="full"
      >
        <Flex
          h="16"
          alignItems="center"
          justifyContent="center"
          borderBottomWidth="1px"
        >
          <Image
            h="8"
            src="https://ai-public.creatie.ai/gen_page/logo_placeholder.png"
            alt="Logo"
          />
        </Flex>
        <VStack spacing="1" align="stretch" px="2" mt="6">
          {navItems.map((item, index) => (
            <Button
              key={index}
              leftIcon={<Icon as={item.icon} />}
              variant={item.active ? "solid" : "ghost"}
              colorScheme={item.active ? "orange" : "gray"}
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/list",
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "Error fetching departments",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchDepartmentManagers = async (departmentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/${departmentId}/managers`,
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setManagers(data);
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast({
        title: "Error fetching managers",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setFormData({ ...formData, department_id: departmentId });
    fetchDepartmentManagers(departmentId);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/update-budget",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Budget allocated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsModalOpen(false);
      fetchDepartments(); // Refresh departments list
    } catch (error) {
      console.error("Error allocating budget:", error);
      toast({
        title: "Error allocating budget",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const StatCard = ({ title, value, subtext, icon, iconColor }) => (
    <Box p="6" bg={bgColor} borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="center" mb="2">
        <Text color="gray.500" fontSize="sm" fontWeight="medium">
          {title}
        </Text>
        <Icon as={icon} color={iconColor} />
      </Flex>
      <Text fontSize="2xl" fontWeight="semibold">
        {value}
      </Text>
      <Text fontSize="sm" color="gray.500" mt="1">
        {subtext}
      </Text>
    </Box>
  );

  const DepartmentModal = () => (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Allocate Department Budget</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Department</FormLabel>
              <Select
                placeholder="Select department"
                onChange={handleDepartmentChange}
                value={formData.department_id}
              >
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Manager</FormLabel>
              <Select
                placeholder="Select manager"
                onChange={(e) =>
                  setFormData({ ...formData, manager_id: e.target.value })
                }
                value={formData.manager_id}
                isDisabled={!formData.department_id}
              >
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Budget Amount</FormLabel>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.total_budget}
                onChange={(e) =>
                  setFormData({ ...formData, total_budget: e.target.value })
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Sidebar for desktop */}
      <Box display={{ base: "none", lg: "block" }}>
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
          bg={useColorModeValue("white", "gray.900")}
          borderBottomWidth="1px"
          h="16"
          alignItems="center"
          px="4"
        >
          <IconButton
            display={{ base: "flex", lg: "none" }}
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
              <Text display={{ base: "none", md: "flex" }}>Admin User</Text>
            </HStack>
          </Flex>
        </Flex>
        <DepartmentModal />
        {/* Main Content Area */}
        <Container maxW="container.xl" py="8">
          {/* Stats Grid */}
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap="6"
            mb="8"
          >
            <StatCard
              title="Total Budget"
              value="$250,000"
              subtext="Fiscal Year 2024"
              icon={FaDollarSign}
              iconColor="orange.500"
            />
            <StatCard
              title="Budget Spent"
              value="$145,230"
              subtext="58.1% of total"
              icon={FaChartPie}
              iconColor="red.500"
            />
            <StatCard
              title="Remaining"
              value="$104,770"
              subtext="41.9% available"
              icon={FaWallet}
              iconColor="green.500"
            />
            <StatCard
              title="Alerts"
              value="2"
              subtext="Departments over budget"
              icon={FaBell}
              iconColor="yellow.500"
            />
          </Grid>

          {/* Charts Grid */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6" mb="8">
            <Box bg={bgColor} p="6" borderRadius="lg" boxShadow="sm">
              <Heading size="md" mb="4">
                Monthly Spending Trend
              </Heading>
              <Box h="64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#F97316"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
            <Box bg={bgColor} p="6" borderRadius="lg" boxShadow="sm">
              <Heading size="md" mb="4">
                Budget Distribution
              </Heading>
              <Box h="64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="70%"
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>
          {/* Department Table */}
          <Box bg={bgColor} borderRadius="lg" boxShadow="sm">
            <Flex
              p="6"
              borderBottom="1px"
              borderColor={borderColor}
              justify="space-between"
              align="center"
            >
              <Heading size="md">Department Budgets</Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="orange"
                onClick={() => setIsModalOpen(true)} // This line triggers the modal
              >
                Add Department
              </Button>
            </Flex>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Department</Th>
                    <Th>Allocated</Th>
                    <Th>Spent</Th>
                    <Th>Remaining</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>Marketing</Td>
                    <Td>$75,000</Td>
                    <Td>$45,230</Td>
                    <Td>$29,770</Td>
                    <Td>
                      <Badge colorScheme="green">On Track</Badge>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FaEdit />}
                        variant="ghost"
                        colorScheme="orange"
                        aria-label="Edit"
                        mr="2"
                      />
                      <IconButton
                        icon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Delete"
                      />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Sales</Td>
                    <Td>$100,000</Td>
                    <Td>$85,000</Td>
                    <Td>$15,000</Td>
                    <Td>
                      <Badge colorScheme="yellow">Warning</Badge>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FaEdit />}
                        variant="ghost"
                        colorScheme="orange"
                        aria-label="Edit"
                        mr="2"
                      />
                      <IconButton
                        icon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Delete"
                      />
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default BudgetManagement;
