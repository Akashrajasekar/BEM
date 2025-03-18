import React, { useEffect, useRef } from "react";
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
  useBreakpointValue,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaReceipt,
  FaFileInvoice,
  FaCheckCircle,
  FaCog,
  FaFileAlt,
  FaChartLine,
  FaBell,
  FaBars,
  FaDollarSign,
  FaClock,
  FaCoins,
} from "react-icons/fa";
import * as echarts from "echarts";
import logoImage from "../assets/logo.png";

// Sidebar Component
const Sidebar_man = ({ onClose, isOpen, activePage }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const menuItems = [
    {
      icon: FaChartLine,
      text: "Dashboard",
      path: "/manager",
      active: activePage === "manager",
    },
    {
      icon: FaCheckCircle,
      text: "Approvals",
      path: "/approvals",
      active: activePage === "approvals",
    },
    {
      icon: FaFileAlt,
      text: "AI Reports",
      path: "/man-report",
      active: activePage === "man-report",
    },
    {
      icon: FaCog,
      text: "Settings",
      active: activePage === "settings",
    },
  ];

  const SidebarContent = (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", lg: 64 }}
      pos="fixed"
      h="full"
    >
      <Flex
        h="16"
        alignItems="center"
        justifyContent="center"
        borderBottomWidth="1px"
      >
        <Image h="12" src={logoImage} alt="Logo" />
      </Flex>
      <VStack spacing="1" align="stretch" px="2" mt="6">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            leftIcon={<Icon as={item.icon} />}
            variant={item.active ? "solid" : "ghost"}
            colorScheme={item.active ? "orange" : "gray"}
            justifyContent="flex-start"
            size="lg"
            w="full"
            onClick={() => handleNavigation(item.path)}
          >
            {item.text}
          </Button>
        ))}
      </VStack>
    </Box>
  );

  return (
    <Box>
      <Box
        display={{ base: "none", md: "block" }}
        position="fixed"
        left={0}
        h="full"
      >
        {SidebarContent}
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>{SidebarContent}</DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Sidebar_man;