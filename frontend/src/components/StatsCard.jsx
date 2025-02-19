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

const StatsCard = ({ title, value, subtitle, icon: Icon, iconColor }) => {
  return (
    <Box bg="white" p={6} rounded="lg" shadow="sm">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="medium" color="gray.900">
          {title}
        </Text>
        <Box color={iconColor}>{Icon}</Box>
      </Flex>
      <Text fontSize="3xl" fontWeight="semibold" color="gray.900">
        {value}
      </Text>
      <Text fontSize="sm" color="gray.500" mt={2}>
        {subtitle}
      </Text>
    </Box>
  );
};

export default StatsCard;