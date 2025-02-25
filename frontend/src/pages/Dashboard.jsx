import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { FaDollarSign, FaClock, FaCoins } from "react-icons/fa";
import StatsCard from "../components/StatsCard";
import Charts from "../components/Charts";

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    category: "",
    budget: "",
  });

  const stats = [
    {
      title: "Total Expenses",
      value: "$12,450",
      subtitle: "+8.5% from last month",
      icon: <FaDollarSign />,
      iconColor: "orange.500",
    },
    {
      title: "Pending Approvals",
      value: "23",
      subtitle: "5 urgent requests",
      icon: <FaClock />,
      iconColor: "orange.500",
    },
    {
      title: "Available Tokens",
      value: "1,250",
      subtitle: "Refresh in 15 days",
      icon: <FaCoins />,
      iconColor: "green.500",
    },
  ];

  useEffect(() => {
    fetchUsers();
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
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching users:", error);
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
      }
    } catch (error) {
      console.error("Error setting limit:", error);
    }
  };

  return (
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

              <Button colorScheme="orange" width="full" onClick={handleSubmit}>
                Set Limit
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;
