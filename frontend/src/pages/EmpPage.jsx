import { useState, useEffect } from "react";
import { Box, SimpleGrid, Skeleton, useToast } from "@chakra-ui/react";
import { FaDollarSign, FaClock, FaCheckCircle, FaFile } from "react-icons/fa";
import axios from 'axios';
import StatCard from "../components/StatCard";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import ExpenseSummary from "../components/ExpenseSummary";

const EmpPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [apiUrl, setApiUrl] = useState('');
  const toast = useToast();
  
  // Get API URL with Vite-specific environment variables
  useEffect(() => {
    // For Vite apps, environment variables must be prefixed with VITE_
    const envApiUrl = import.meta.env.VITE_API_URL;
    
    if (envApiUrl) {
      setApiUrl(envApiUrl);
      console.log('Using API URL from environment:', envApiUrl);
    } else {
      console.log('No VITE_API_URL found, using default:', apiUrl);
      console.log('Available environment variables:', import.meta.env);
    }
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        
        // Get authentication data from localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        console.log('Making request to:', `${apiUrl}/api/auth/stats/${userId}`);
        
        // Fetch user expense statistics
        const response = await axios.get(`${apiUrl}/api/auth/stats/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = response.data;
        
        // Format the stats data
        setStats([
          {
            icon: FaDollarSign,
            iconBg: "orange.100",
            title: "Total Expenses",
            value: `AED${data.totalMonthlyExpenses.toFixed(2)}`,
            subtitle: "This month"
          },
          {
            icon: FaClock,
            iconBg: "yellow.100",
            title: "Pending Submissions",
            value: data.pendingCount.toString(),
            subtitle: "Expenses awaiting"
          },
          {
            icon: FaCheckCircle,
            iconBg: "green.100",
            title: "Approved Expenses",
            value: `AED${data.approvedExpenses.toFixed(2)}`,
            subtitle: "Last 7 days"
          },
          {
            icon: FaFile,
            iconBg: "gray.100",
            title: "Draft Expenses",
            value: data.draftCount.toString(),
            subtitle: "In progress"
          }
        ]);
      } catch (error) {
        console.error('Error fetching user expense statistics:', error);
        toast({
          title: "Error fetching expense data",
          description: "Please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [toast, apiUrl]); // Changed dependency from API_URL to apiUrl

  return (
    <Box as="main" flex="1" overflow="auto" bg="gray.50" p={8}>
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {loading ? (
          // Show skeletons while loading
          Array(4).fill(0).map((_, index) => (
            <Skeleton key={index} height="140px" rounded="lg" />
          ))
        ) : (
          // Show actual stat cards when data is loaded
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
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
