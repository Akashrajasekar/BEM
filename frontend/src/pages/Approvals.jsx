import { Box, Grid, Flex, Text, Button, Input, Select, Image, useDisclosure } from "@chakra-ui/react";
import { FaBell, FaHome, FaCheckCircle, FaFileInvoiceDollar, FaChartBar, FaCog, FaClock, FaHourglassHalf, FaDollarSign  } from "react-icons/fa";
import ApprovalCard from "../components/ApprovalCard";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";

const Approvals = () => {
  const stats = [
    {
      title: "Pending Approvals",
      value: "23",
      subtitle: "5 urgent requests",
      icon: <FaClock />,
      iconColor: "orange.500"
    },
    {
      title: "Today's Processed",
      value: "12",
      subtitle: "+3 from yesterday",
      icon: <FaCheckCircle />,
      iconColor: "green.500"
    },
    {
      title: "Average Processing Time",
      value: "1.5 days",
      subtitle: "-0.5 days this week",
      icon: <FaHourglassHalf />,
      iconColor: "yellow.500"
    },
    {
      title: "Total Amount Pending",
      value: "$45,230",
      subtitle: "Across 23 requests",
      icon: <FaDollarSign />,
      iconColor: "orange.500"
    }
  ];

  const approvalRequests = [
    {
      id: 1,
      name: "Sarah Johnson",
      department: "Marketing",
      amount: 1250.00,
      items: 4,
      submitted: "Feb 15, 2024",
      status: "urgent",
      image: "https://creatie.ai/ai/api/search-image?query=A professional headshot..."
    },
    // Add other requests...
  ];

  return (
    <Box minH="100vh" bg="gray.50">
      <Box p={6}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={6}>
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </Grid>

        <Box bg="white" p={4} rounded="lg" shadow="sm" mb={6}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
                Department
              </Text>
              <Select placeholder="All Departments">
                <option>Sales</option>
                <option>Marketing</option>
                <option>Engineering</option>
              </Select>
            </Box>
            {/* Add other filter fields... */}
          </Grid>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
          {approvalRequests.map((request) => (
            <ApprovalCard key={request.id} {...request} />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Approvals;