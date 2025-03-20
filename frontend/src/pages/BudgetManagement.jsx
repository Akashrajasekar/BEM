import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Container,
  Heading,
  IconButton,
  VStack,
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
  FaDollarSign,
  FaChartPie,
  FaWallet,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";

const BudgetManagement = () => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    department_id: "",
    manager_id: "",
    total_budget: "",
  });
  
  const [apiUrl, setApiUrl] = useState("https://bem-47rp.onrender.com");

  const [budgetSummary, setBudgetSummary] = useState({
    totalBudget: 0,
    budgetSpent: 0,
    remainingBudget: 0,
    budgetUtilizationPercentage: 0,
  });
  const [pieData, setPieData] = useState([]);
  const [yearlyExpenseData, setYearlyExpenseData] = useState([]);
  const [departmentBudgets, setDepartmentBudgets] = useState([]);
  const toast = useToast();

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

  useEffect(() => {
    fetchDepartments();
    fetchBudgetSummary();
    fetchDepartmentDistribution();
    fetchYearlyExpenses();
    fetchDepartmentBudgets();
  }, []);

  const fetchBudgetSummary = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setBudgetSummary(result.data);
      }
    } catch (error) {
      console.error("Error fetching budget summary:", error);
      toast({
        title: "Error fetching budget data",
        description: "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchDepartmentDistribution = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/department-distribution`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPieData(result.data);
      }
    } catch (error) {
      console.error("Error fetching department distribution:", error);
      toast({
        title: "Error fetching chart data",
        description: "Could not load department distribution data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchYearlyExpenses = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/yearly-expenses`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setYearlyExpenseData(result.data);
      }
    } catch (error) {
      console.error("Error fetching yearly expenses:", error);
      toast({
        title: "Error fetching chart data",
        description: "Could not load yearly expense data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchDepartmentBudgets = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/department-budgets`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setDepartmentBudgets(result.data);
      }
    } catch (error) {
      console.error("Error fetching department budgets:", error);
      toast({
        title: "Error fetching department budgets",
        description: "Could not load department budget data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
        `${apiUrl}/api/admin/${departmentId}/managers`,
        {
          method: "GET",
          headers: {
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
        `${apiUrl}/api/admin/update-budget`,
        {
          method: "POST",
          headers: {
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
      fetchDepartments();
      fetchBudgetSummary();
      fetchDepartmentDistribution();
      fetchYearlyExpenses();
      fetchDepartmentBudgets();
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
      <DepartmentModal />
      {/* Main Content Area */}
      <Container maxW="container.xl" py="8">
        {/* Stats Grid */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap="6"
          mb="8"
        >
          <StatCard
            title="Total Budget"
            value={`AED ${
              budgetSummary.totalBudget?.toLocaleString() || "0"
            }`}
            subtext="Fiscal Year 2024"
            icon={FaDollarSign}
            iconColor="orange.500"
          />
          <StatCard
            title="Budget Spent"
            value={`AED ${
              budgetSummary.budgetSpent?.toLocaleString() || "0"
            }`}
            subtext={`${
              budgetSummary.budgetUtilizationPercentage || "0"
            }% of total`}
            icon={FaChartPie}
            iconColor="red.500"
          />
          <StatCard
            title="Remaining"
            value={`AED ${
              budgetSummary.remainingBudget?.toLocaleString() || "0"
            }`}
            subtext={`${(
              100 - parseFloat(budgetSummary.budgetUtilizationPercentage || 0)
            ).toFixed(1)}% available`}
            icon={FaWallet}
            iconColor="green.500"
          />
        </Grid>

        {/* Charts Grid */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6" mb="8">
          <Box bg={bgColor} p="6" borderRadius="lg" boxShadow="sm">
            <Heading size="md" mb="4">
              Yearly Spending Trend
            </Heading>
            <Box h="64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `AED ${value.toLocaleString()}`,
                      "Expenses",
                    ]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Bar
                    dataKey="value"
                    fill="#F97316"
                    name="Expenses"
                    barSize={60}
                  />
                </BarChart>
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
                  <Tooltip
                    formatter={(value) => `AED ${value.toLocaleString()}`}
                  />
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
              onClick={() => setIsModalOpen(true)}
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
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {departmentBudgets.length > 0 ? (
                  departmentBudgets.map((dept) => (
                    <Tr key={dept._id}>
                      <Td>{dept.name}</Td>
                      <Td>AED {dept.allocated.toLocaleString()}</Td>
                      <Td>AED {dept.spent.toLocaleString()}</Td>
                      <Td>AED {dept.remaining.toLocaleString()}</Td>
                      <Td>
                        <IconButton
                          icon={<FaEdit />}
                          variant="ghost"
                          colorScheme="orange"
                          aria-label="Edit"
                          mr="2"
                          onClick={() => {
                            setFormData({
                              department_id: dept._id,
                              manager_id: "",
                              total_budget: dept.allocated,
                            });
                            setIsModalOpen(true);
                          }}
                        />
                        <IconButton
                          icon={<FaTrash />}
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete"
                        />
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No departments found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BudgetManagement;
