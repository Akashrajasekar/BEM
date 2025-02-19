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

const Charts = () => {
  const expenseChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const chartSize = useBreakpointValue({ base: 300, md: 400 });

  useEffect(() => {
    if (!expenseChartRef.current || !categoryChartRef.current) return;

    const expenseChart = echarts.init(expenseChartRef.current);
    const categoryChart = echarts.init(categoryChartRef.current);

    const expenseOption = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
      yAxis: { type: 'value' },
      series: [{
        data: [3200, 4500, 5200, 3800, 4200, 5500],
        type: 'line',
        smooth: true,
        lineStyle: { color: '#F97316' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(249, 115, 22, 0.2)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0)' }
            ]
          }
        }
      }]
    };

    const categoryOption = {
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 35, name: 'Travel' },
          { value: 25, name: 'Meals' },
          { value: 20, name: 'Supplies' },
          { value: 15, name: 'Services' },
          { value: 5, name: 'Others' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        color: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5']
      }]
    };

    expenseChart.setOption(expenseOption);
    categoryChart.setOption(categoryOption);

    const handleResize = () => {
      expenseChart.resize();
      categoryChart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      expenseChart.dispose();
      categoryChart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [chartSize]);

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
      gap={6}
      mb={8}
    >
      <Box bg="white" p={6} rounded="lg" shadow="sm">
        <Text fontSize="lg" fontWeight="medium" color="gray.900" mb={4}>
          Expense Trends
        </Text>
        <Box ref={expenseChartRef} h={`${chartSize}px`} />
      </Box>
      <Box bg="white" p={6} rounded="lg" shadow="sm">
        <Text fontSize="lg" fontWeight="medium" color="gray.900" mb={4}>
          Category Distribution
        </Text>
        <Box ref={categoryChartRef} h={`${chartSize}px`} />
      </Box>
    </Grid>
  );
};

export default Charts;