import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Text,
  useColorModeValue,
  Flex,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Charts = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    categoryData: [],
    monthlyData: [],
    departmentData: [],
  });
  const [apiUrl, setApiUrl] = useState("http://localhost:5000");
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Colors for pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#FF6B6B",
    "#6BCB77",
    "#4D96FF",
  ];
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
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/manager/chart-data`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setChartData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return `$${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Prepare data for rendering
  const pieChartData = chartData.categoryData.map((item) => ({
    name: item._id,
    value: item.total,
  }));

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (loading) {
    return (
      <Center p={8}>
        <Spinner size="xl" color="orange.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center p={8}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
      {/* Monthly Trend Chart */}
      <Box
        bg={bgColor}
        p={6}
        rounded="lg"
        shadow="sm"
        border="1px"
        borderColor={borderColor}
      >
        <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">
          Monthly Expense Trend
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#FF8C00"
                activeDot={{ r: 8 }}
                name="Expense Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Category Pie Chart */}
      <Box
        bg={bgColor}
        p={6}
        rounded="lg"
        shadow="sm"
        border="1px"
        borderColor={borderColor}
      >
        <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">
          Expense by Category
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Department Comparison */}
      <Box
        bg={bgColor}
        p={6}
        rounded="lg"
        shadow="sm"
        border="1px"
        borderColor={borderColor}
        gridColumn={{ base: "1", lg: "span 2" }}
      >
        <Text fontSize="xl" fontWeight="bold" mb={4} color="gray.800">
          Top Department Expenses
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.departmentData.map((item) => ({
                name: item._id || "Unassigned",
                amount: item.total,
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" name="Total Expense" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Grid>
  );
};

export default Charts;