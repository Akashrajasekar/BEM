import {
  Box,
  Grid,
  Flex,
  Text,
  Button,
  Select,
  Switch,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import {
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaDollarSign,
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import ApprovalCard from "../components/ApprovalCard";
import StatsCard from "../components/StatsCard";
import { useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Approvals = () => {
  const token = localStorage.getItem('token');
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const lastExpenseCountRef = useRef(0);
  const toast = useToast();
  const navigate = useNavigate();

  const stats = [
    {
      title: "Pending Approvals",
      value: approvalRequests
        .filter((req) => req.status === "Pending")
        .length.toString(),
      subtitle: `${
        approvalRequests.filter((req) => req.status === "AutoFlagged").length
      } auto-flagged`,
      icon: <FaClock />,
      iconColor: "orange.500",
    },
    {
      title: "Today's Processed",
      value: approvalRequests
        .filter((req) => req.status === "Approved")
        .length.toString(),
      subtitle: "Approved requests",
      icon: <FaCheckCircle />,
      iconColor: "green.500",
    },
    {
      title: "Average Processing Time",
      value: "1.5 days",
      subtitle: "Processing efficiency",
      icon: <FaHourglassHalf />,
      iconColor: "yellow.500",
    },
    {
      title: "Total Amount Pending",
      value: `${approvalRequests
        .filter(
          (req) => req.status === "Pending" || req.status === "AutoFlagged"
        )
        .reduce((sum, req) => sum + req.amount, 0)
        .toLocaleString()}`,
      subtitle: "Awaiting approval",
      icon: <FaDollarSign />,
      iconColor: "blue.500",
    },
  ];

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/manager/expenses", {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();

      // Check for new expenses
      if (data.length > lastExpenseCountRef.current && autoApprove) {
        console.log(
          "New expenses detected:",
          data.length - lastExpenseCountRef.current
        );
        await processAutoApprovals();
      }

      lastExpenseCountRef.current = data.length;
      setApprovalRequests(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const processAutoApprovals = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        `http://localhost:5000/api/manager/auto-approve?autoApprove=${autoApprove}`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to auto-flag expenses");

      const data = await response.json();

      if (data.success) {
        if (data.processedExpenses.length > 0) {
          const approved = data.processedExpenses.filter(
            (exp) => exp.status === "AutoFlagged"
          ).length;
          const rejected = data.processedExpenses.filter(
            (exp) => exp.status === "Rejected"
          ).length;

          toast({
            title: "Expenses processed",
            description: `${approved} expenses flagged for approval, ${rejected} auto-rejected due to policy violations`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "No eligible expenses",
            description: "No expenses were found for processing",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
        await fetchExpenses();
      }
    } catch (error) {
      console.error("Auto-approval error:", error);
      toast({
        title: "Processing failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAutoApprovals = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        "http://localhost:5000/api/manager/confirm-approvals",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to confirm approvals");

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Expenses approved",
          description: `${data.modifiedCount} expenses approved successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        await fetchExpenses();
      }
    } catch (error) {
      console.error("Confirm approvals error:", error);
      toast({
        title: "Approval confirmation failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const filteredRequests = approvalRequests.filter((request) => {
    if (selectedDepartment === "all") return true;
    return request.department === selectedDepartment;
  });

  // Effect for auto-approve toggle
  useEffect(() => {
    if (autoApprove) {
      // Reset the counter when auto-approve is enabled
      lastExpenseCountRef.current = approvalRequests.length;
      // Initial auto-approve call when toggle is enabled
      processAutoApprovals();
    }
  }, [autoApprove]);

  // Effect for polling - separate from the auto-approve effect
  useEffect(() => {
    const interval = setInterval(fetchExpenses, 5000);
    fetchExpenses(); // Initial fetch

    return () => clearInterval(interval);
  }, [autoApprove]); // Add autoApprove as dependency to restart polling when toggle changes

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Main Content */}
      <Box p={6}>
        {/* Stats Cards */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={6}
          mb={6}
        >
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </Grid>

        {/* Filters and Controls */}
        <Box bg="white" p={4} rounded="lg" shadow="sm" mb={6}>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={4}
          >
            {/* Department Filter */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                Department
              </Text>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
              >
                <option value="all">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance</option>
              </Select>
            </Box>

            {/* Auto-Approve Toggle and Button */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                Auto-Approve
              </Text>
              <Flex alignItems="center" gap={4}>
                <Flex alignItems="center">
                  <Switch
                    colorScheme="green"
                    isChecked={autoApprove}
                    onChange={(e) => setAutoApprove(e.target.checked)}
                    size="md"
                  />
                  <Text ml={2} fontSize="sm" color="gray.600">
                    {autoApprove ? "Enabled" : "Disabled"}
                  </Text>
                </Flex>
                <Button
                  colorScheme="green"
                  size="md"
                  isDisabled={!autoApprove}
                  isLoading={isProcessing}
                  loadingText="Processing"
                  onClick={handleConfirmAutoApprovals}
                >
                  Confirm Auto Approvals
                </Button>
              </Flex>
            </Box>
          </Grid>
        </Box>

        {/* Approval Cards Grid */}
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {filteredRequests.map((request) => (
            <ApprovalCard
              key={request.id}
              id={request.id}
              name={request.name}
              department={request.department}
              amount={request.amount}
              items={request.items}
              submitted={request.submitted}
              status={request.status}
              image={request.image}
              autoApproveEnabled={autoApprove}
              onStatusChange={fetchExpenses}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Approvals;
