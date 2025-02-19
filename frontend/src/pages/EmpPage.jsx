import { Box, SimpleGrid } from "@chakra-ui/react";
import { FaDollarSign, FaClock, FaCheckCircle, FaFile } from "react-icons/fa";
import StatCard from "../components/StatCard";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import ExpenseSummary from "../components/ExpenseSummary";

const EmpPage = () => {
  
  const stats = [
    {
      icon: FaDollarSign,
      iconBg: "orange.100",
      title: "Total Expenses",
      value: "$4,257.00",
      subtitle: "This month"
    },
    {
      icon: FaClock,
      iconBg: "yellow.100",
      title: "Pending Submissions",
      value: "3",
      subtitle: "Reports awaiting"
    },
    {
      icon: FaCheckCircle,
      iconBg: "green.100",
      title: "Approved Expenses",
      value: "$1,892.00",
      subtitle: "Last 7 days"
    },
    {
      icon: FaFile,
      iconBg: "gray.100",
      title: "Draft Reports",
      value: "2",
      subtitle: "In progress"
    }
  ];

  return (
    <Box as="main" flex="1" overflow="auto" bg="gray.50" p={8}>
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </SimpleGrid>

      {/* Quick Actions and Recent Activity */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={8}>
        <QuickActions />
        <RecentActivity />
      </SimpleGrid>

      {/* Expense Summary */}
      <Box mt={8}>
        <ExpenseSummary />
      </Box>
    </Box>
  );
};

export default EmpPage;