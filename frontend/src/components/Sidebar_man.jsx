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

// Sidebar Component
const Sidebar_man = ({ onClose, isOpen }) => {
  const menuItems = [
    { icon: FaHome, text: "Dashboard", isActive: true },
    { icon: FaReceipt, text: "Expenses" },
    { icon: FaFileInvoice, text: "Reports" },
    { icon: FaCheckCircle, text: "Approvals" },
    { icon: FaCog, text: "Settings" }
  ];

  const SidebarContent = (
    <Box
      as="aside"
      w="64"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      h="full"
    >
      <Box p={6}>
        <Image h="8" src="/api/placeholder/120/32" alt="Logo" />
      </Box>
      <VStack as="nav" mt={6} spacing={0}>
        {menuItems.map((item, index) => (
          <Box
            key={index}
            as={RouterLink}
            to="#"
            display="flex"
            alignItems="center"
            px={6}
            py={3}
            w="full"
            color={item.isActive ? "orange.600" : "gray.600"}
            bg={item.isActive ? "orange.50" : "transparent"}
            _hover={{ bg: "orange.50" }}
          >
            <Box as={item.icon} w={5} />
            <Text ml={3}>{item.text}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );

  return (
    <Box>
      <Box display={{ base: "none", md: "block" }} position="fixed" left={0} h="full">
        {SidebarContent}
      </Box>
      
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          {SidebarContent}
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Sidebar_man;