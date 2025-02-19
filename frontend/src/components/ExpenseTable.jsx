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

const ExpenseTable = () => {
  const expenses = [
    {
      date: "2024-02-15",
      description: "Business Lunch",
      category: "Meals",
      amount: "$85.00",
      status: "Approved"
    },
    {
      date: "2024-02-14",
      description: "Taxi Fare",
      category: "Transportation",
      amount: "$25.50",
      status: "Pending"
    },
    {
      date: "2024-02-13",
      description: "Office Supplies",
      category: "Supplies",
      amount: "$150.75",
      status: "Approved"
    }
  ];

  return (
    <Box bg="white" rounded="lg" shadow="sm">
      <Box p={6} borderBottom="1px" borderColor="gray.200">
        <Text fontSize="lg" fontWeight="medium" color="gray.900">
          Recent Expenses
        </Text>
      </Box>
      <Box overflowX="auto">
        <Table>
          <Thead bg="gray.50">
            <Tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {expenses.map((expense, index) => (
              <Tr key={index}>
                <Td>{expense.date}</Td>
                <Td>{expense.description}</Td>
                <Td>{expense.category}</Td>
                <Td>{expense.amount}</Td>
                <Td>
                  <Text
                    px={2}
                    py={1}
                    fontSize="xs"
                    fontWeight="medium"
                    rounded="full"
                    display="inline-block"
                    bg={expense.status === 'Approved' ? 'orange.100' : 'yellow.100'}
                    color={expense.status === 'Approved' ? 'orange.800' : 'yellow.800'}
                  >
                    {expense.status}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ExpenseTable;