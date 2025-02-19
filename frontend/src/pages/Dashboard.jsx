import React, { useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  VStack,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaHome, FaReceipt, FaFileInvoice, FaCheckCircle, FaCog, FaBell, FaBars, FaDollarSign, FaClock, FaCoins } from "react-icons/fa";
import * as echarts from 'echarts';
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import Charts from "../components/Charts";
import ExpenseTable from "../components/ExpenseTable";


const Dashboard = () => {
  const stats = [
    {
      title: "Total Expenses",
      value: "$12,450",
      subtitle: "+8.5% from last month",
      icon: <FaDollarSign />,
      iconColor: "orange.500"
    },
    {
      title: "Pending Approvals",
      value: "23",
      subtitle: "5 urgent requests",
      icon: <FaClock />,
      iconColor: "orange.500"
    },
    {
      title: "Available Tokens",
      value: "1,250",
      subtitle: "Refresh in 15 days",
      icon: <FaCoins />,
      iconColor: "green.500"
    }
  ];

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)"
        }}
        gap={6}
        mb={8}
      >
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </Grid>
      <Charts />
      <ExpenseTable />
    </Box>
  );
};

export default Dashboard;