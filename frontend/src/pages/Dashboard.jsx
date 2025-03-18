import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useDisclosure,
  Select,
  useToast,
  Flex,
  IconButton,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaDollarSign,
  FaClock,
  FaWallet,
  FaUpload,
} from "react-icons/fa";
import StatsCard from "../components/StatsCard";
import Charts from "../components/Charts";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../components/NotificationContext";

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [formData, setFormData] = useState({
    category: "",
    budget: "",
  });
  const [policyFile, setPolicyFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  // Initialize with default stats
  const [stats, setStats] = useState([
    {
      title: "Total Expenses",
      value: "$0",
      subtitle: "Loading...",
      icon: <FaDollarSign />,
      iconColor: "orange.500",
    },
    {
      title: "Pending Approvals",
      value: "0",
      subtitle: "Loading...",
      icon: <FaClock />,
      iconColor: "orange.500",
    },
    {
      title: "Available Budget",
      value: "$0",
      subtitle: "Loading...",
      icon: <FaWallet />,
      iconColor: "green.500",
    },
  ]);

  useEffect(() => {
    fetchUsers();
    fetchExpenseStats();
    fetchDepartmentBudget();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/manager/by-department", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to fetch expense statistics
  const fetchExpenseStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/manager/stats", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Update the first two stat cards with null checks
      setStats((prevStats) => [
        {
          ...prevStats[0],
          value: `AED ${
            data?.totalExpenses ? data.totalExpenses.toLocaleString() : "0"
          }`,
          subtitle: `+${data?.expenseGrowth || "0"}% from last month`,
        },
        {
          ...prevStats[1],
          value: data?.pendingApprovals
            ? data.pendingApprovals.toString()
            : "0",
          subtitle: `${data?.urgentRequests || "0"} urgent requests`,
        },
        prevStats[2],
      ]);
    } catch (error) {
      console.error("Error fetching expense stats:", error);
      toast({
        title: "Error fetching expense statistics",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to fetch department budget
  const fetchDepartmentBudget = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/budget", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Update the third stat card with null checks
      setStats((prevStats) => [
        prevStats[0],
        prevStats[1],
        {
          ...prevStats[2],
          value: `AED ${
            data?.availableBudget ? data.availableBudget.toLocaleString() : "0"
          }`,
          subtitle: `${
            data?.budgetUsedPercentage || "0"
          }% of total budget used`,
        },
      ]);
    } catch (error) {
      console.error("Error fetching department budget:", error);
      toast({
        title: "Error fetching budget information",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSetLimit = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/manager/set-limit",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUser._id,
            ...formData,
          }),
        }
      );

      if (response.ok) {
        fetchUsers(); // Refresh the data
        onClose();
        setFormData({ category: "", budget: "" });
        toast({
          title: "Limit set successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to set limit");
      }
    } catch (error) {
      console.error("Error setting limit:", error);
      toast({
        title: "Error setting limit",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPolicyFile(e.target.files[0]);
    }
  };

  const uploadPolicyFile = async () => {
    if (!policyFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("policyFile", policyFile);

    try {
      const response = await fetch(
        "http://localhost:5000/api/manager/upload-policy",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: formData,
        }
      );

      if (response.ok) {
        toast({
          title: "Policy uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setPolicyFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload policy");
      }
    } catch (error) {
      console.error("Error uploading policy:", error);
      toast({
        title: "Error uploading policy",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Main Content */}
      <Box>
        {/* Main content */}
        <Box p={{ base: 4, md: 8 }}>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
            mb={8}
          >
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </Grid>

          {/* This component now uses real-time data from the backend */}
          <Charts />

          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={6}
            mt={8}
          >
            {departments.map((dept) => (
              <Box
                key={dept._id}
                bg="white"
                p={6}
                rounded="lg"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
              >
                <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">
                  {dept._id}
                </Text>
                <VStack align="stretch" spacing={4}>
                  {dept.users.map((user) => (
                    <Box key={user._id} p={4} bg="gray.50" rounded="md">
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {user.role}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Current Limit: ${user.Alloted_Limit || 0}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="orange"
                        onClick={() => handleSetLimit(user)}
                      >
                        Set Limit
                      </Button>
                    </Box>
                  ))}
                </VStack>
              </Box>
            ))}
          </Grid>

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Set Budget Limit</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      placeholder="Select category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="travel">Travel</option>
                      <option value="meals">Meals</option>
                      <option value="supplies">Supplies</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Budget Amount</FormLabel>
                    <Input
                      type="number"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      placeholder="Enter amount"
                    />
                  </FormControl>
                  <Button
                    colorScheme="orange"
                    width="full"
                    onClick={handleSubmit}
                  >
                    Set Limit
                  </Button>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
          <Box
            mt={8}
            bg="white"
            p={6}
            rounded="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">
              Company Policy Management
            </Text>
            <Box>
              <FormControl>
                <FormLabel>Upload Company Policy (PDF)</FormLabel>
                <Flex>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    mb={4}
                  />
                  <Button
                    ml={2}
                    colorScheme="orange"
                    leftIcon={<FaUpload />}
                    onClick={uploadPolicyFile}
                    isDisabled={!policyFile}
                  >
                    Upload
                  </Button>
                </Flex>
                {policyFile && (
                  <Text fontSize="sm" color="green.500" mb={2}>
                    Selected file: {policyFile.name}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.600">
                  Upload your company expense policy PDF. This will be used by
                  our AI to automatically evaluate expense compliance.
                </Text>
              </FormControl>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
